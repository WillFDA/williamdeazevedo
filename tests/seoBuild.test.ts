import { expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import nodePath from "node:path";

import {
  buildRedirectRules,
  createSitemapSerializer,
  listBuiltPages,
  readArticleDates,
} from "../scripts/seo-build.mjs";
import { serializeJsonLd } from "../src/lib/jsonLd";

test("buildRedirectRules : 301 barre finale, /blog/<slug> puis splat en dernier", () => {
  const rules = buildRedirectRules(
    ["/", "/tarifs/", "/articles/", "/articles/seo-local/"],
    "/blog /articles/ 301\n# commentaire\n/blog/seo-local/ /ailleurs/ 301\n"
  );
  expect(rules).toEqual([
    "/articles /articles/ 301",
    "/articles/seo-local /articles/seo-local/ 301",
    "/tarifs /tarifs/ 301",
    "/blog/seo-local /articles/seo-local/ 301",
    "/blog/* /articles/ 301",
  ]);
});

test("readArticleDates ignore brouillons et articles programmés, préfère updatedDate", () => {
  const dir = mkdtempSync(nodePath.join(tmpdir(), "articles-"));
  writeFileSync(
    nodePath.join(dir, "a.mdx"),
    '---\ntitle: "A"\npubDate: 2026-01-10\nupdatedDate: "2026-03-01"\n---\nTexte'
  );
  writeFileSync(nodePath.join(dir, "b.md"), "---\npubDate: 2026-02-01\n---\n");
  writeFileSync(
    nodePath.join(dir, "draft.md"),
    "---\npubDate: 2026-01-01\ndraft: true\n---\n"
  );
  writeFileSync(
    nodePath.join(dir, "futur.md"),
    "---\npubDate: 2099-01-01\n---\n"
  );
  writeFileSync(
    nodePath.join(dir, "_brouillon.md"),
    "---\npubDate: 2026-01-01\n---\n"
  );
  const dates = readArticleDates(dir, new Date("2026-10-23T00:00:00Z"));
  expect([...dates.keys()].toSorted()).toEqual(["a", "b"]);
  expect(dates.get("a")?.toISOString()).toBe("2026-03-01T00:00:00.000Z");

  const serialize = createSitemapSerializer(dates);
  expect(serialize({ url: "https://williamdeazevedo.fr/articles/b/" })).toEqual(
    {
      lastmod: "2026-02-01T00:00:00.000Z",
      url: "https://williamdeazevedo.fr/articles/b/",
    }
  );
  expect(
    serialize({ url: "https://williamdeazevedo.fr/articles/" }).lastmod
  ).toBe("2026-03-01T00:00:00.000Z");
  expect(serialize({ url: "https://williamdeazevedo.fr/tarifs/" })).toEqual({
    url: "https://williamdeazevedo.fr/tarifs/",
  });
});

test("listBuiltPages liste les dossiers avec index.html, sans _astro", () => {
  const dist = mkdtempSync(nodePath.join(tmpdir(), "dist-"));
  for (const dir of ["tarifs", "articles/seo-local", "_astro/x", "vide"]) {
    mkdirSync(nodePath.join(dist, dir), { recursive: true });
  }
  writeFileSync(nodePath.join(dist, "index.html"), "");
  writeFileSync(nodePath.join(dist, "tarifs/index.html"), "");
  writeFileSync(nodePath.join(dist, "articles/seo-local/index.html"), "");
  writeFileSync(nodePath.join(dist, "_astro/x/index.html"), "");
  expect(listBuiltPages(dist).toSorted()).toEqual([
    "/articles/seo-local/",
    "/tarifs/",
  ]);
});

test("serializeJsonLd échappe </script> sans changer les données", () => {
  const data = { name: "</script><script>alert(1)</script> & co\u2028" };
  const serialized = serializeJsonLd(data);
  expect(serialized).not.toContain("</script>");
  expect(serialized).not.toContain("<");
  expect(JSON.parse(serialized)).toEqual(data);
});
