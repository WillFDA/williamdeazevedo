// Règles SEO calculées au build : `lastmod` du sitemap et redirections 301.
import { readdirSync, readFileSync, existsSync, appendFileSync } from "node:fs";
import nodePath from "node:path";
import { fileURLToPath } from "node:url";

// Frontmatter en LF ou CRLF.
const frontmatterOf = (source) =>
  source.match(/^---\r?\n(?<body>[\s\S]*?)\r?\n---/)?.groups?.body ?? "";

// Valeur scalaire d'un champ, sans commentaire YAML de fin de ligne
// (` # …`) ni guillemets.
const readField = (frontmatter, field) => {
  const match = frontmatter.match(new RegExp(`^${field}:(?<value>.*)$`, "m"));
  if (!match?.groups) return undefined;
  const value = match.groups.value
    .replace(/\s+#.*$/, "")
    .trim()
    .replace(/^(?<quote>["'])(?<inner>.*)\k<quote>$/, "$<inner>");
  return value || undefined;
};

/**
 * Date de dernière modification de chaque article publié (updatedDate, sinon
 * pubDate), lue dans le frontmatter. Les brouillons et les articles programmés
 * dans le futur sont ignorés, comme dans src/lib/articles.ts.
 * @param {string} articlesDir dossier src/content/articles
 * @param {Date} [now] date de référence (tests)
 * @returns {Map<string, Date>} slug -> date
 */
export function readArticleDates(articlesDir, now = new Date()) {
  const dates = new Map();
  for (const file of readdirSync(articlesDir)) {
    if (file.startsWith("_") || !/\.mdx?$/.test(file)) continue;
    const frontmatter = frontmatterOf(
      readFileSync(nodePath.join(articlesDir, file), "utf-8")
    );
    if (readField(frontmatter, "draft") === "true") continue;
    const pubDate = new Date(readField(frontmatter, "pubDate") ?? "");
    // Astro refuserait aussi cet article : mieux vaut échouer ici que publier
    // un sitemap sans sa date.
    if (Number.isNaN(pubDate.getTime())) {
      throw new TypeError(`${file} : pubDate absente ou illisible.`);
    }
    if (pubDate > now) continue;
    const updatedDate = new Date(readField(frontmatter, "updatedDate") ?? "");
    dates.set(
      file.replace(/\.mdx?$/, ""),
      Number.isNaN(updatedDate.getTime()) ? pubDate : updatedDate
    );
  }
  return dates;
}

/**
 * Fonction `serialize` pour @astrojs/sitemap : ajoute `lastmod` aux articles et
 * à la liste des articles (date la plus récente). Les autres pages n'en ont pas :
 * mieux vaut aucune date qu'une date de build qui change à chaque déploiement.
 * @param {Map<string, Date>} articleDates slug -> date, voir readArticleDates
 */
export function createSitemapSerializer(articleDates) {
  const latest = [...articleDates.values()].toSorted(
    (a, b) => b.getTime() - a.getTime()
  )[0];
  return (item) => {
    const { pathname } = new URL(item.url);
    const slug = pathname.match(/^\/articles\/(?<slug>[^/]+)\/$/)?.groups?.slug;
    let date;
    if (slug) date = articleDates.get(slug);
    else if (pathname === "/articles/") date = latest;
    return date ? { ...item, lastmod: date.toISOString() } : item;
  };
}

/**
 * Règles `_redirects` générées depuis les pages réellement construites :
 * - `/page` -> `/page/` en 301 (sinon Workers répond 307) ;
 * - `/blog/<slug>` -> `/articles/<slug>/` quand l'article existe ;
 * - puis `/blog/*` -> `/articles/` en dernier recours.
 * Cloudflare applique la première règle qui correspond : les sources déjà
 * présentes dans public/_redirects gardent la priorité et ne sont pas dupliquées.
 * Une règle existante à joker (`*` ou `:param`) qui couvre /blog/<slug>
 * rendrait les règles générées inutiles : elle fait échouer le build.
 * @param {string[]} pagePaths chemins construits, avec barre finale (ex. "/tarifs/")
 * @param {string} existingRules contenu actuel de _redirects
 */
export function buildRedirectRules(pagePaths, existingRules = "") {
  const sources = existingRules
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split(/\s+/)[0]);
  for (const source of sources) {
    if (!/[*:]/.test(source)) continue;
    const pattern = source
      .replaceAll(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replaceAll("*", ".*")
      .replaceAll(/:[A-Za-z]\w*/g, "[^/]+");
    const matcher = new RegExp(`^${pattern}$`);
    if (
      ["/blog/un-article", "/blog/un-article/"].some((path) =>
        matcher.test(path)
      )
    ) {
      throw new Error(
        `public/_redirects : « ${source} » couvre /blog/<slug> et masquerait les redirections générées. Retirez-la, elle est ajoutée en dernier au build.`
      );
    }
  }
  const taken = new Set(sources);
  const rules = [];
  const add = (from, to) => {
    if (taken.has(from)) return;
    taken.add(from);
    rules.push(`${from} ${to} 301`);
  };
  const paths = [...new Set(pagePaths)]
    .filter((path) => path !== "/")
    .toSorted();
  for (const path of paths) add(path.slice(0, -1), path);
  for (const path of paths) {
    const slug = path.match(/^\/articles\/(?<slug>[^/]+)\/$/)?.groups?.slug;
    if (!slug) continue;
    add(`/blog/${slug}`, path);
    add(`/blog/${slug}/`, path);
  }
  add("/blog/*", "/articles/");
  return rules;
}

/** Liste les dossiers de `dist` qui contiennent un index.html, en chemins d'URL. */
export function listBuiltPages(distDir, base = "/") {
  const pages = [];
  for (const entry of readdirSync(distDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const dir = nodePath.join(distDir, entry.name);
    const path = `${base}${entry.name}/`;
    if (existsSync(nodePath.join(dir, "index.html"))) pages.push(path);
    pages.push(...listBuiltPages(dir, path));
  }
  return pages;
}

/** Intégration Astro : complète dist/_redirects après le build. */
export function seoRedirects() {
  return {
    name: "seo-redirects",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        const redirectsPath = nodePath.join(distDir, "_redirects");
        const existing = existsSync(redirectsPath)
          ? readFileSync(redirectsPath, "utf-8")
          : "";
        const rules = buildRedirectRules(listBuiltPages(distDir), existing);
        appendFileSync(
          redirectsPath,
          `\n# Généré au build par scripts/seo-build.mjs.\n${rules.join("\n")}\n`
        );
        logger.info(`${rules.length} redirections 301 ajoutées à _redirects`);
      },
    },
  };
}
