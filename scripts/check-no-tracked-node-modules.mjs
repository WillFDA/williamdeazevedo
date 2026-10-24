// node_modules was committed once as a symlink to an agent's machine (c4a9da6):
// `node_modules/` in .gitignore only matches directories, not a symlink.
// .gitignore now ignores `node_modules` (any type); this check fails CI if it is tracked again.
import { execFileSync } from "node:child_process";

const tracked = execFileSync("git", ["ls-files", "--", "node_modules"], {
  encoding: "utf-8",
}).trim();

if (tracked) {
  console.error(
    `node_modules is tracked by git:\n${tracked}\nRun \`git rm --cached -r node_modules\`; .gitignore already ignores it.`
  );
  process.exit(1);
}
console.log("OK: node_modules is not tracked.");
