// `lastmod` du sitemap : la date de modification que la page déclare elle-même
// (`article:modified_time`, soit `updatedDate ?? pubDate` pour un article).
// @astrojs/sitemap sérialise ses entrées une fois le HTML écrit dans dist/ :
// la date est lue là, sans seconde lecture du frontmatter. Les pages qui ne
// déclarent aucune date (accueil, services…) restent sans lastmod plutôt
// qu'avec la date du build, qui changerait à chaque déploiement.
import { existsSync, readFileSync } from "node:fs";

const DIST = new URL("../dist/", import.meta.url);
const MODIFIED_TIME =
  /<meta property="article:modified_time" content="(?<date>[^"]+)"/;

export default function sitemapLastmod(item) {
  const file = new URL(`.${new URL(item.url).pathname}index.html`, DIST);
  if (!existsSync(file)) return item;
  const lastmod = MODIFIED_TIME.exec(readFileSync(file, "utf-8"))?.groups?.date;
  return lastmod ? { ...item, lastmod } : item;
}
