/// <reference types="node" />
// Shell guard for coding agents: blocks force pushes, pushes to protected
// branches, destructive Git commands and npm-family package managers.
// Claude Code (PreToolUse, Bash) and Cursor (beforeShellExecution) call it with
// the hook payload on stdin. Any unexpected input or error lets the command run.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { text } from "node:stream/consumers";

/** @typedef {{ advice: string, reason: string }} Block */
/** @typedef {Block & { command: string }} Violation */
/** @typedef {{ delimiter: string, stripTabs: boolean }} Heredoc */
/** @typedef {{ args: string[], name: string }} Command */
/** @typedef {(args: string[], cwd: string) => Block | null} GitCheck */
// Tokenizer state. `index` is the last character read; `words` and `word` hold
// the command being read, `quote` the open quote character, if any.
/** @typedef {{ commands: string[][], heredocs: Heredoc[], inWord: boolean, index: number, quote: string, source: string, word: string, words: string[] }} Scanner */

const PROTECTED_BRANCHES = new Set(["main", "develop", "2026"]);
const PACKAGE_MANAGERS = new Set(["npm", "pnpm", "yarn", "npx", "pnpx"]);
const SHELLS = new Set(["bash", "sh", "zsh", "dash"]);
const WHOLE_TREE = new Set([".", "./", ":/", "*"]);

const SHELL_KEYWORDS = new Set([
  "!",
  "{",
  "}",
  "if",
  "then",
  "elif",
  "else",
  "while",
  "until",
  "do",
  "time",
  "exec",
  "nohup",
]);

// Wrappers that run the next word as a command, with their options that take a value.
/** @type {Map<string, Set<string>>} */
const PREFIX_VALUE_OPTIONS = new Map([
  ["sudo", new Set(["-u", "-g", "-h", "-p", "-C", "-D", "-r", "-t", "-U"])],
  ["env", new Set(["-u", "-C", "-S"])],
  ["command", new Set()],
  ["nice", new Set(["-n"])],
]);

const GIT_GLOBAL_VALUE_OPTIONS = new Set([
  "-C",
  "-c",
  "--git-dir",
  "--work-tree",
  "--namespace",
  "--config-env",
]);

const ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/u;
const REDIRECTION = /^[\d&]*[<>]/u;
const REDIRECTION_WITHOUT_TARGET = /^[\d&]*[<>]+&?$/u;
const HEREDOC_DELIMITER_END = /[\s;&|()<>]/u;
const SEPARATORS = new Set([";", "|", "&", "\n", "(", ")", "`"]);
const MAX_NESTING = 3;

const BYPASS =
  "Si l'opération est voulue, demande à un humain de la lancer dans son terminal.";

// --- Parsing ---------------------------------------------------------------

// What `\<next>` stands for: a line continuation, or a literal character.
// Inside double quotes, the backslash stays unless it escapes a special one.
/** @type {(next: string, quote: string) => string} */
const unescape = (next, quote) => {
  if (next === "\n") {
    return "";
  }

  if (quote === '"' && !'"\\$`'.includes(next)) {
    return `\\${next}`;
  }

  return next;
};

// `&` inside `2>&1`, `>&2` or `&>file` belongs to a redirection, not a separator.
/** @type {(source: string, index: number) => boolean} */
const isSeparator = (source, index) => {
  const char = source[index];

  if (char !== "&") {
    return SEPARATORS.has(char);
  }

  return source[index - 1] !== ">" && source[index + 1] !== ">";
};

// Reads the word after `<<` or `<<-` and returns the index of its last character.
/** @type {(source: string, start: number, heredocs: Heredoc[]) => number} */
const readHeredocDelimiter = (source, start, heredocs) => {
  let index = start;
  const stripTabs = source[index] === "-";

  if (stripTabs) {
    index += 1;
  }

  while (source[index] === " ") {
    index += 1;
  }

  let delimiter = "";

  while (index < source.length && !HEREDOC_DELIMITER_END.test(source[index])) {
    if (source[index] !== "'" && source[index] !== '"') {
      delimiter += source[index];
    }

    index += 1;
  }

  heredocs.push({ delimiter, stripTabs });

  return index - 1;
};

// Skips the heredoc bodies that start at `start` and returns the next index.
/** @type {(source: string, start: number, heredocs: Heredoc[]) => number} */
const skipHeredocBodies = (source, start, heredocs) => {
  let index = start;

  for (const { delimiter, stripTabs } of heredocs) {
    while (index < source.length) {
      const lineEnd = source.indexOf("\n", index);
      const end = lineEnd === -1 ? source.length : lineEnd;
      const line = source.slice(index, end);
      index = end + 1;

      if ((stripTabs ? line.replace(/^\t+/u, "") : line) === delimiter) {
        break;
      }
    }
  }

  return index;
};

/** @type {(scanner: Scanner, chars: string) => void} */
const appendToWord = (scanner, chars) => {
  scanner.word += chars;
  scanner.inWord = true;
};

/** @type {(scanner: Scanner) => void} */
const endWord = (scanner) => {
  if (scanner.inWord) {
    scanner.words.push(scanner.word);
  }

  scanner.word = "";
  scanner.inWord = false;
};

/** @type {(scanner: Scanner) => void} */
const endCommand = (scanner) => {
  endWord(scanner);

  if (scanner.words.length > 0) {
    scanner.commands.push(scanner.words);
  }

  scanner.words = [];
};

/** @type {(scanner: Scanner, char: string) => void} */
const scanQuoted = (scanner, char) => {
  if (char === scanner.quote) {
    scanner.quote = "";
  } else {
    scanner.word += char;
  }
};

/** @type {(scanner: Scanner) => void} */
const scanEscape = (scanner) => {
  scanner.index += 1;
  appendToWord(
    scanner,
    unescape(scanner.source[scanner.index] ?? "", scanner.quote)
  );
};

/** @type {(scanner: Scanner, char: string) => void} */
const scanUnquoted = (scanner, char) => {
  const { index, source } = scanner;

  if (char === "'" || char === '"') {
    scanner.quote = char;
    scanner.inWord = true;
  } else if (char === "#" && !scanner.inWord) {
    const lineEnd = source.indexOf("\n", index);
    scanner.index = (lineEnd === -1 ? source.length : lineEnd) - 1;
  } else if (
    char === "<" &&
    source[index + 1] === "<" &&
    source[index + 2] !== "<"
  ) {
    endWord(scanner);
    scanner.index = readHeredocDelimiter(source, index + 2, scanner.heredocs);
  } else if (isSeparator(source, index)) {
    endCommand(scanner);

    if (char === "\n" && scanner.heredocs.length > 0) {
      const heredocs = scanner.heredocs.splice(0);
      scanner.index = skipHeredocBodies(source, index + 1, heredocs) - 1;
    }
  } else if (char === " " || char === "\t") {
    endWord(scanner);
  } else {
    appendToWord(scanner, char);
  }
};

/** @type {(scanner: Scanner) => void} */
const scanCharacter = (scanner) => {
  const char = scanner.source[scanner.index];

  if (scanner.quote === "'") {
    scanQuoted(scanner, char);
  } else if (char === "\\") {
    scanEscape(scanner);
  } else if (scanner.quote === '"') {
    scanQuoted(scanner, char);
  } else {
    scanUnquoted(scanner, char);
  }
};

// Splits a shell string into simple commands (arrays of unquoted words).
// Handles quotes, escapes, comments and heredoc bodies; not a full shell parser.
/** @type {(source: string) => string[][]} */
const splitCommands = (source) => {
  /** @type {Scanner} */
  const scanner = {
    commands: [],
    heredocs: [],
    inWord: false,
    index: 0,
    quote: "",
    source,
    word: "",
    words: [],
  };

  while (scanner.index < source.length) {
    scanCharacter(scanner);
    scanner.index += 1;
  }

  endCommand(scanner);

  return scanner.commands;
};

/** @type {(words: string[]) => string[]} */
const withoutRedirections = (words) => {
  /** @type {string[]} */
  const kept = [];

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];

    if (!REDIRECTION.test(word)) {
      kept.push(word);
    } else if (REDIRECTION_WITHOUT_TARGET.test(word)) {
      index += 1;
    }
  }

  return kept;
};

/** @type {(words: string[], valueOptions: Set<string>) => string[]} */
const skipOptions = (words, valueOptions) => {
  let index = 0;

  while (index < words.length && words[index].startsWith("-")) {
    if (words[index] === "--") {
      return words.slice(index + 1);
    }

    index += valueOptions.has(words[index]) ? 2 : 1;
  }

  return words.slice(index);
};

// Drops env assignments, shell keywords and wrappers such as `sudo`, `env` or
// `command`. Returns null when nothing is executed (`command -v npm`).
/** @type {(rawWords: string[]) => Command | null} */
const resolveCommand = (rawWords) => {
  let words = withoutRedirections(rawWords);

  while (words.length > 0) {
    const [first, ...rest] = words;

    if (ASSIGNMENT.test(first) || SHELL_KEYWORDS.has(first)) {
      words = rest;
      continue;
    }

    const valueOptions = PREFIX_VALUE_OPTIONS.get(first);

    if (!valueOptions) {
      break;
    }

    if (first === "command" && (rest.includes("-v") || rest.includes("-V"))) {
      return null;
    }

    words = skipOptions(rest, valueOptions);
  }

  if (words.length === 0) {
    return null;
  }

  return { args: words.slice(1), name: path.basename(words[0]) };
};

// Returns 1 when the cluster ends with an option whose value is the next arg.
/** @type {(cluster: string, flags: Set<string>, valueOptions: Set<string>) => number} */
const addShortFlags = (cluster, flags, valueOptions) => {
  for (let position = 1; position < cluster.length; position += 1) {
    const flag = `-${cluster[position]}`;
    flags.add(flag);

    if (valueOptions.has(flag)) {
      return position === cluster.length - 1 ? 1 : 0;
    }
  }

  return 0;
};

// Parses subcommand arguments into flags (`-f`, `--force`) and positionals.
// Short clusters expand (`-fdx` gives -f, -d, -x). Options listed in
// `valueOptions` consume their value, so `-m "--no-verify"` is not a flag.
/** @type {(args: string[], valueOptions?: Set<string>) => { flags: Set<string>, positionals: string[] }} */
const parseOptions = (args, valueOptions = new Set()) => {
  /** @type {Set<string>} */
  const flags = new Set();
  /** @type {string[]} */
  const positionals = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--") {
      positionals.push(...args.slice(index + 1));
      break;
    }

    if (arg.startsWith("--")) {
      const [name] = arg.split("=");
      flags.add(name);

      if (!arg.includes("=") && valueOptions.has(name)) {
        index += 1;
      }
    } else if (arg.startsWith("-") && arg.length > 1) {
      index += addShortFlags(arg, flags, valueOptions);
    } else {
      positionals.push(arg);
    }
  }

  return { flags, positionals };
};

/** @type {(flags: Set<string>, names: string[]) => boolean} */
const hasAny = (flags, names) => names.some((name) => flags.has(name));

// --- Rules -----------------------------------------------------------------

/** @type {(reason: string, advice: string) => Block} */
const block = (reason, advice) => ({ advice, reason });

const PUSH_FEATURE_BRANCH =
  "Pousse une branche de fonctionnalité et ouvre une PR.";

const PUSH_VALUE_OPTIONS = new Set([
  "-o",
  "--push-option",
  "--repo",
  "--receive-pack",
  "--exec",
]);

const PUSH_FORCE_FLAGS = [
  "--force",
  "-f",
  "--force-with-lease",
  "--force-if-includes",
  "--mirror",
];

/** @type {(cwd: string) => string} */
const currentBranch = (cwd) => {
  try {
    return execFileSync("git", ["symbolic-ref", "--short", "-q", "HEAD"], {
      cwd,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 2000,
    }).trim();
  } catch {
    return "";
  }
};

// `feature:develop` targets develop, `main` targets main, `HEAD` the current branch.
/** @type {(refspec: string, cwd: string) => string} */
const pushTarget = (refspec, cwd) => {
  const destination = refspec.includes(":")
    ? refspec.slice(refspec.lastIndexOf(":") + 1)
    : refspec;

  const branch = destination.replace(/^refs\/heads\//u, "");

  return branch === "HEAD" || branch === "@" ? currentBranch(cwd) : branch;
};

const noVerify = () =>
  block(
    "--no-verify contourne les hooks Git",
    "Corrige ce que signalent les hooks puis relance sans --no-verify."
  );

/** @type {GitCheck} */
const checkPush = (args, cwd) => {
  const { flags, positionals } = parseOptions(args, PUSH_VALUE_OPTIONS);
  const refspecs = positionals.slice(1);

  if (
    hasAny(flags, PUSH_FORCE_FLAGS) ||
    refspecs.some((r) => r.startsWith("+"))
  ) {
    return block(
      "push forcé ou miroir",
      "Pousse sans réécrire l'historique distant ; si la branche a divergé, intègre les changements distants ou crée une nouvelle branche."
    );
  }

  if (flags.has("--no-verify")) {
    return noVerify();
  }

  if (
    hasAny(flags, ["--delete", "-d"]) ||
    refspecs.some((r) => r.startsWith(":"))
  ) {
    return block(
      "suppression de branche distante",
      "Laisse un humain supprimer la branche distante."
    );
  }

  if (hasAny(flags, ["--all", "--branches"])) {
    return block(
      "push de toutes les branches locales, branches protégées comprises",
      PUSH_FEATURE_BRANCH
    );
  }

  const targets =
    refspecs.length === 0 && !flags.has("--tags")
      ? [currentBranch(cwd)]
      : refspecs.map((refspec) => pushTarget(refspec, cwd));

  const protectedTarget = targets.find((t) => PROTECTED_BRANCHES.has(t));

  if (!protectedTarget) {
    return null;
  }

  return block(
    `push vers la branche protégée ${protectedTarget}`,
    PUSH_FEATURE_BRANCH
  );
};

const COMMIT_VALUE_OPTIONS = new Set([
  "-m",
  "-F",
  "-C",
  "-c",
  "-t",
  "--message",
  "--file",
  "--reuse-message",
  "--reedit-message",
  "--template",
  "--author",
  "--date",
  "--fixup",
  "--squash",
  "--trailer",
  "--cleanup",
]);

/** @type {GitCheck} */
const checkCommit = (args) => {
  const { flags } = parseOptions(args, COMMIT_VALUE_OPTIONS);

  return hasAny(flags, ["--no-verify", "-n"]) ? noVerify() : null;
};

/** @type {GitCheck} */
const checkReset = (args) => {
  if (!parseOptions(args).flags.has("--hard")) {
    return null;
  }

  return block(
    "git reset --hard efface les modifications non commitées",
    "Mets le travail de côté dans un commit WIP, ou utilise git reset --soft ou --mixed."
  );
};

/** @type {GitCheck} */
const checkClean = (args) => {
  const { flags } = parseOptions(args, new Set(["-e", "--exclude"]));

  if (!hasAny(flags, ["-f", "--force"])) {
    return null;
  }

  return block(
    "git clean -f supprime les fichiers non suivis",
    "Liste-les avec git clean -n puis supprime les fichiers voulus un par un."
  );
};

/** @type {GitCheck} */
const checkBranch = (args) => {
  const { flags } = parseOptions(args, new Set(["-u", "--set-upstream-to"]));

  const forcedDelete =
    flags.has("-D") ||
    (hasAny(flags, ["-d", "--delete"]) && hasAny(flags, ["-f", "--force"]));

  if (!forcedDelete) {
    return null;
  }

  return block(
    "suppression forcée de branche locale",
    "Utilise git branch -d, qui refuse de supprimer une branche non fusionnée."
  );
};

const discardsWorktree = () =>
  block(
    "annulation de toutes les modifications du worktree",
    "Restaure les fichiers voulus un par un avec git restore <fichier>."
  );

/** @type {GitCheck} */
const checkCheckout = (args) => {
  const { positionals } = parseOptions(
    args,
    new Set(["-b", "-B", "--orphan", "--conflict"])
  );

  const wholeTree = positionals.some((arg) => WHOLE_TREE.has(arg));

  return wholeTree ? discardsWorktree() : null;
};

/** @type {GitCheck} */
const checkRestore = (args) => {
  const { flags, positionals } = parseOptions(
    args,
    new Set(["-s", "--source", "--conflict"])
  );

  const touchesWorktree =
    !hasAny(flags, ["--staged", "-S"]) || hasAny(flags, ["--worktree", "-W"]);

  const wholeTree = positionals.some((arg) => WHOLE_TREE.has(arg));

  return wholeTree && touchesWorktree ? discardsWorktree() : null;
};

/** @type {GitCheck} */
const checkStash = (args) => {
  const { positionals } = parseOptions(args, new Set(["-m", "--message"]));

  if (positionals[0] !== "clear") {
    return null;
  }

  return block(
    "git stash clear vide la pile de stash partagée entre worktrees",
    "Supprime uniquement ton entrée avec git stash drop <ref>."
  );
};

/** @type {Map<string, GitCheck>} */
const GIT_CHECKS = new Map([
  ["push", checkPush],
  ["commit", checkCommit],
  ["reset", checkReset],
  ["clean", checkClean],
  ["branch", checkBranch],
  ["checkout", checkCheckout],
  ["restore", checkRestore],
  ["stash", checkStash],
]);

// Skips global options such as `-C <dir>` or `-c <key=value>`, then checks
// the subcommand.
/** @type {GitCheck} */
const checkGit = (args, cwd) => {
  let index = 0;
  let gitCwd = cwd;

  while (index < args.length && args[index].startsWith("-")) {
    if (args[index] === "-C") {
      gitCwd = path.resolve(gitCwd, args[index + 1] ?? ".");
    }

    index += GIT_GLOBAL_VALUE_OPTIONS.has(args[index]) ? 2 : 1;
  }

  const check = GIT_CHECKS.get(args[index]);

  return check ? check(args.slice(index + 1), gitCwd) : null;
};

/** @type {(name: string) => Block} */
const checkPackageManager = (name) => {
  const advice =
    name === "npx" || name === "pnpx"
      ? "Utilise bunx --bun <outil>."
      : "Utilise bun install, bun add <paquet> ou bun run <script>.";

  return block(
    `${name} est interdit, ce dépôt utilise Bun`,
    `${advice} Le site utilise Bun.`
  );
};

/** @type {(command: Command, cwd: string) => Block | null} */
const checkCommand = ({ args, name }, cwd) => {
  if (PACKAGE_MANAGERS.has(name)) {
    return checkPackageManager(name);
  }

  return name === "git" ? checkGit(args, cwd) : null;
};

// The script of `bash -c "…"` or `sh -lc "…"`, or null.
/** @type {(args: string[]) => string | null} */
const inlineScript = (args) => {
  const index = args.findIndex((arg) => /^-[a-z]*c[a-z]*$/u.test(arg));

  return index === -1 ? null : (args[index + 1] ?? null);
};

/** @type {(command: Command) => string | null} */
const nestedScript = ({ args, name }) => {
  if (name === "eval") {
    return args.join(" ");
  }

  return SHELLS.has(name) ? inlineScript(args) : null;
};

// Checks each command, then the scripts it runs (`bash -c`, `eval`). A
// violation reports the outermost command that leads to it.
/** @type {(source: string, cwd: string, depth?: number) => Violation | null} */
const findViolation = (source, cwd, depth = 0) => {
  if (depth > MAX_NESTING) {
    return null;
  }

  for (const words of splitCommands(source)) {
    const command = resolveCommand(words);

    if (!command) {
      continue;
    }

    const script = nestedScript(command);

    const violation =
      checkCommand(command, cwd) ??
      (script === null ? null : findViolation(script, cwd, depth + 1));

    if (violation) {
      return { ...violation, command: words.join(" ") };
    }
  }

  return null;
};

// --- Hook protocols --------------------------------------------------------

/** @typedef {{ claudeCommand?: string, cursorCommand?: string, cwd?: string, hookEventName?: string }} HookPayload */

/** @type {(input: string) => unknown} */
const parseJson = (input) => {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
};

/** @type {(json: unknown, key: string) => unknown} */
const field = (json, key) => (json instanceof Object ? json[key] : null);

/** @type {(json: unknown, key: string) => string | undefined} */
const stringField = (json, key) => {
  const value = field(json, key);

  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- decodes untrusted hook JSON at the stdin boundary
  return typeof value === "string" ? value : undefined;
};

// Claude Code sends `tool_input.command`; Cursor sends `command` and
// `hook_event_name`. Both send `cwd`.
/** @type {(input: string) => HookPayload} */
const parseHookPayload = (input) => {
  const json = parseJson(input);

  return {
    claudeCommand: stringField(field(json, "tool_input"), "command"),
    cursorCommand: stringField(json, "command"),
    cwd: stringField(json, "cwd"),
    hookEventName: stringField(json, "hook_event_name"),
  };
};

/** @type {(command: string, cwd: string) => Violation | null} */
const safeFindViolation = (command, cwd) => {
  try {
    return findViolation(command, cwd);
  } catch {
    return null;
  }
};

/** @type {(violation: Violation) => string} */
const formatMessage = ({ reason, advice, command }) =>
  `Garde-fou : ${reason} (\`${command}\`). ${advice} ${BYPASS}`;

// Claude Code: exit 2 with the reason on stderr blocks, silent exit 0 allows.
/** @type {(violation: Violation | null) => void} */
const answerClaude = (violation) => {
  if (!violation) {
    return;
  }

  process.stderr.write(`${formatMessage(violation)}\n`);
  process.exitCode = 2;
};

// Cursor: always answer with JSON on stdout and exit 0.
/** @type {(violation: Violation | null) => void} */
const answerCursor = (violation) => {
  const answer = violation
    ? {
        agent_message: formatMessage(violation),
        permission: "deny",
        user_message: `Garde-fou : ${violation.reason} (\`${violation.command}\`).`,
      }
    : { permission: "allow" };

  process.stdout.write(`${JSON.stringify(answer)}\n`);
};

const main = async () => {
  const payload = parseHookPayload(await text(process.stdin));
  const cwd = payload.cwd || process.cwd();

  if (payload.claudeCommand !== undefined) {
    answerClaude(safeFindViolation(payload.claudeCommand, cwd));

    return;
  }

  const { cursorCommand } = payload;

  const isCursor =
    cursorCommand !== undefined ||
    payload.hookEventName === "beforeShellExecution" ||
    Boolean(process.env.CURSOR_VERSION);

  if (!isCursor) {
    return;
  }

  answerCursor(
    cursorCommand === undefined ? null : safeFindViolation(cursorCommand, cwd)
  );
};

try {
  await main();
} catch {
  // Fail open: a broken guard must never stop the agent.
  process.exitCode = 0;
}
