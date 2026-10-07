import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import nodePath from "node:path";

const { resolve } = nodePath;

// Run after `bun run build`. No third-party test dependency needed.
// Articles marked `draft: true` must stay out of the build; the others are checked.
const slugs = [
  "prix-site-vitrine",
  "cout-site-internet-par-mois",
  "prix-refonte-site-internet",
  "refonte-seo",
  "cahier-des-charges-site-internet",
  "exemples-sites-vitrines",
  "site-internet-artisan-contenus",
  "creer-site-internet-ia",
  "tester-accessibilite-site-web",
  "referencement-chatgpt",
  "mentions-legales-site-internet-professionnel",
  "fiche-google-my-business-artisan",
  "widget-avis-google",
  "changer-prestataire-web",
];
const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf-8");
const listing = read("dist/articles/index.html");
const sitemap = read("dist/sitemap-0.xml");
const evidence = [];
const drafts = new Set();

for (const slug of slugs) {
  const path = `/articles/${slug}/`;
  const sourcePaths = ["md", "mdx"]
    .map((extension) => `src/content/articles/${slug}.${extension}`)
    .filter((sourcePath) => existsSync(resolve(root, sourcePath)));
  assert.equal(
    sourcePaths.length,
    1,
    `${slug}: exactly one .md or .mdx source`
  );
  const source = read(sourcePaths[0]);
  const frontmatter = source.match(/^---[\s\S]*?---/)?.[0] ?? "";
  if (/^draft:\s*true\s*$/m.test(frontmatter)) {
    drafts.add(slug);
    assert.ok(
      !existsSync(resolve(root, `dist${path}index.html`)),
      `${slug}: draft must not be built`
    );
    assert.ok(!listing.includes(`href="${path}"`), `${slug}: draft listed`);
    assert.ok(
      !sitemap.includes(`https://williamdeazevedo.fr${path}`),
      `${slug}: draft in sitemap`
    );
    evidence.push({ slug, status: "draft" });
    continue;
  }
  const body = source.replace(/^---[\s\S]*?---/, "");
  const words = body.split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 750, `${slug}: article incomplete (${words} words)`);
  assert.ok(!/^# /m.test(body), `${slug}: body must not contain a second h1`);
  assert.ok(/https:\/\//.test(body), `${slug}: missing cited source`);
  const html = read(`dist${path}index.html`);
  const tableCount = (html.match(/<table\b/g) || []).length;
  const accessibleTableCount = (
    html.match(
      /class="article-table-scroll" tabindex="0" role="region" aria-label="[^"]+"/g
    ) || []
  ).length;
  assert.equal(
    accessibleTableCount,
    tableCount,
    `${slug}: keyboard-accessible tables`
  );
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${slug}: one h1`);
  assert.ok(
    listing.includes(`href="${path}"`),
    `${slug}: missing from listing`
  );
  assert.ok(
    sitemap.includes(`https://williamdeazevedo.fr${path}`),
    `${slug}: sitemap`
  );
  assert.ok(
    html.includes(`rel="canonical" href="https://williamdeazevedo.fr${path}"`),
    `${slug}: canonical`
  );
  const imagePath = `/articles/${slug}/cover.webp`;
  assert.ok(
    html.includes(
      `property="og:image" content="https://williamdeazevedo.fr${imagePath}"`
    ),
    `${slug}: wrong OG image`
  );
  const schemas = [
    ...html.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>(?<json>[\s\S]*?)<\/script>/g
    ),
  ].map((match) => JSON.parse(match[1]));
  const article = schemas.find((schema) => schema["@type"] === "BlogPosting");
  assert.ok(article, `${slug}: BlogPosting schema`);
  assert.equal(article.url, `https://williamdeazevedo.fr${path}`);
  assert.equal(article.image, `https://williamdeazevedo.fr${imagePath}`);
  assert.ok(
    schemas.some((schema) => schema["@type"] === "BreadcrumbList"),
    `${slug}: breadcrumbs`
  );
  const person = schemas.find((schema) => schema["@type"] === "Person");
  assert.ok(
    person?.image.endsWith("/pictures/william-low.png"),
    `${slug}: portrait must not become article cover`
  );

  for (const [, attribute, target] of html.matchAll(
    /\b(?<attribute>href|src)="(?<target>[^"\s]+)"/g
  )) {
    if (!target.startsWith("/") || target.startsWith("//")) continue;
    const url = new URL(target, "https://williamdeazevedo.fr");
    const localPath = decodeURIComponent(url.pathname);
    const file = resolve(root, `dist${localPath}`);
    const candidate =
      existsSync(file) && statSync(file).isDirectory()
        ? resolve(file, "index.html")
        : file;
    assert.ok(existsSync(candidate), `${slug}: broken ${attribute} ${target}`);
    if (url.hash && candidate.endsWith(".html")) {
      const destination = readFileSync(candidate, "utf-8");
      assert.ok(
        destination.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),
        `${slug}: missing anchor ${target}`
      );
    }
  }
  const cover = readFileSync(resolve(root, `public${imagePath}`));
  assert.equal(
    cover.toString("ascii", 0, 4),
    "RIFF",
    `${slug}: cover not WebP`
  );
  assert.equal(
    cover.toString("ascii", 8, 12),
    "WEBP",
    `${slug}: cover not WebP`
  );
  evidence.push({ slug, status: "published", words, coverBytes: cover.length });
}
assert.equal(new Set(evidence.map((entry) => entry.slug)).size, slugs.length);

const enrichments = [
  ["prix-site-vitrine", "IdentityScope", "identity-scope"],
  [
    "cahier-des-charges-site-internet",
    "PreparationChecklist",
    "preparation-checklist",
  ],
  ["exemples-sites-vitrines", "PersistancePartner", "persistance-partner"],
];
for (const [slug, component, marker] of enrichments) {
  if (drafts.has(slug)) continue;
  assert.ok(
    existsSync(resolve(root, `src/components/articles/${component}.astro`)),
    `${slug}: missing enrichment component`
  );
  const html = read(`dist/articles/${slug}/index.html`);
  assert.ok(
    html.includes(`class="${marker}"`),
    `${slug}: component not rendered`
  );
  assert.ok(
    html.includes('href="https://persistance-studio.fr/identite-visuelle/"'),
    `${slug}: missing public direct service link`
  );
  const source = read(`src/content/articles/${slug}.mdx`);
  assert.ok(
    source.includes("pubDate: 2026-09-16"),
    `${slug}: original publication date`
  );
  assert.ok(
    source.includes("updatedDate: 2026-09-17"),
    `${slug}: enrichment date`
  );
}
if (!drafts.has("prix-site-vitrine")) {
  const price = read("dist/articles/prix-site-vitrine/index.html");
  assert.equal(
    (price.match(/<details\b[^>]*\bopen\b/g) || []).length,
    2,
    "price: both comparison disclosures initially readable"
  );
}
if (!drafts.has("cahier-des-charges-site-internet")) {
  const preparation = read(
    "dist/articles/cahier-des-charges-site-internet/index.html"
  );
  const checklist = preparation.match(
    /<preparation-checklist\b[^>]*>(?<content>[\s\S]*?)<\/preparation-checklist>/
  )?.groups?.content;
  assert.ok(checklist, "brief: rendered custom checklist");
  assert.equal(
    (checklist.match(/<input\b[^>]*type="checkbox"/g) || []).length,
    7,
    "brief: seven native checkboxes"
  );
  assert.equal(
    (checklist.match(/<label\b/g) || []).length,
    7,
    "brief: seven wrapping labels"
  );
  assert.ok(
    !/<input\b[^>]*\bdisabled\b/.test(checklist),
    "brief: checkboxes work without JavaScript"
  );
  assert.ok(
    /class="checklist-tools"[^>]*\bhidden\b/.test(checklist),
    "brief: enhancement-only tools hidden initially"
  );
  assert.ok(
    checklist.includes('role="status"'),
    "brief: progress announced accessibly"
  );
}
if (!drafts.has("exemples-sites-vitrines")) {
  const examples = read("dist/articles/exemples-sites-vitrines/index.html");
  assert.ok(
    examples.includes(
      'src="/articles/exemples-sites-vitrines/persistance-home.webp"'
    ),
    "examples: real project image"
  );
  assert.ok(
    examples.includes("pas d’une maquette de charte graphique"),
    "examples: honest image caption"
  );
}
console.table(evidence);
console.log(
  `PASS: ${slugs.length - drafts.size} published article(s) checked (unique MD/MDX sources, listing, sitemap, canonical, schemas, OG covers, local links, enrichments) and ${drafts.size} draft(s) kept out of the build.`
);
