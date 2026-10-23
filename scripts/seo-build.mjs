// Règles SEO calculées au build : `lastmod` du sitemap et redirections 301.
import { readdirSync, readFileSync, existsSync, appendFileSync } from "node:fs";
import nodePath from "node:path";
import { fileURLToPath } from "node:url";

const frontmatterOf = (source) =>
  source.match(/^---\n(?<body>[\s\S]*?)\n---/)?.groups?.body ?? "";

const readField = (frontmatter, field) => {
  const match = frontmatter.match(
    new RegExp(`^${field}:\\s*["']?(?<value>[^"'\\n]+?)["']?\\s*$`, "m")
  );
  return match?.groups?.value;
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
    if (/^draft:\s*true\s*$/m.test(frontmatter)) continue;
    const pubDate = new Date(readField(frontmatter, "pubDate") ?? "");
    if (Number.isNaN(pubDate.getTime()) || pubDate > now) continue;
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
 * @param {string[]} pagePaths chemins construits, avec barre finale (ex. "/tarifs/")
 * @param {string} existingRules contenu actuel de _redirects
 */
export function buildRedirectRules(pagePaths, existingRules = "") {
  const taken = new Set(
    existingRules
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split(/\s+/)[0])
  );
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
