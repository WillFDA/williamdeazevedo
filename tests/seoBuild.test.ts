import { expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import nodePath from "node:path";
import { pathToFileURL } from "node:url";

import {
  buildRedirectRules,
  createSitemapSerializer,
  listBuiltPages,
  readArticleDates,
  seoRedirects,
} from "../scripts/seo-build.mjs";
import { services } from "../src/data/services";
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

test("readArticleDates lit le CRLF et ignore les commentaires YAML", () => {
  const dir = mkdtempSync(nodePath.join(tmpdir(), "articles-"));
  writeFileSync(
    nodePath.join(dir, "crlf.md"),
    "---\r\npubDate: 2026-04-01\r\n---\r\nTexte"
  );
  writeFileSync(
    nodePath.join(dir, "commente.md"),
    '---\npubDate: "2026-05-02" # date de sortie\nupdatedDate: 2026-06-03 # relu\n---\n'
  );
  writeFileSync(
    nodePath.join(dir, "wip.md"),
    "---\npubDate: 2026-01-01\ndraft: true # en cours\n---\n"
  );
  const dates = readArticleDates(dir, new Date("2026-10-23T00:00:00Z"));
  expect([...dates.keys()].toSorted()).toEqual(["commente", "crlf"]);
  expect(dates.get("crlf")?.toISOString()).toBe("2026-04-01T00:00:00.000Z");
  expect(dates.get("commente")?.toISOString()).toBe("2026-06-03T00:00:00.000Z");
});

test("readArticleDates échoue sur une pubDate illisible", () => {
  const dir = mkdtempSync(nodePath.join(tmpdir(), "articles-"));
  writeFileSync(nodePath.join(dir, "casse.md"), "---\npubDate: bientôt\n---\n");
  expect(() => readArticleDates(dir)).toThrow("casse.md");
});

test("buildRedirectRules refuse un joker existant qui couvre /blog/<slug>", () => {
  for (const rule of [
    "/blog/* /articles/ 301",
    "/blog/:slug /articles/:slug 301",
    "/* /index.html 200",
  ]) {
    expect(() => buildRedirectRules(["/articles/seo-local/"], rule)).toThrow(
      "/blog/<slug>"
    );
  }
  expect(() =>
    buildRedirectRules(["/articles/seo-local/"], "/autre/* /ailleurs/ 301")
  ).not.toThrow();
});

test("seoRedirects complète dist/_redirects après les règles de public/", () => {
  const dist = mkdtempSync(nodePath.join(tmpdir(), "dist-"));
  mkdirSync(nodePath.join(dist, "articles/seo-local"), { recursive: true });
  writeFileSync(nodePath.join(dist, "index.html"), "");
  writeFileSync(nodePath.join(dist, "articles/seo-local/index.html"), "");
  writeFileSync(nodePath.join(dist, "_redirects"), "/ancien /articles/ 301\n");
  const messages: string[] = [];
  seoRedirects().hooks["astro:build:done"]({
    dir: pathToFileURL(`${dist}/`),
    logger: { info: (message: string) => messages.push(message) },
  });
  const lines = readFileSync(nodePath.join(dist, "_redirects"), "utf-8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#"));
  expect(lines).toEqual([
    "/ancien /articles/ 301",
    "/articles/seo-local /articles/seo-local/ 301",
    "/blog/seo-local /articles/seo-local/ 301",
    "/blog/seo-local/ /articles/seo-local/ 301",
    "/blog/* /articles/ 301",
  ]);
  expect(messages).toEqual(["4 redirections 301 ajoutées à _redirects"]);
});

test("les <title> des pages service tiennent en 60 caractères", () => {
  for (const service of services) {
    expect({
      title: service.seoTitle,
      length: service.seoTitle.length <= 60,
    }).toEqual({
      title: service.seoTitle,
      length: true,
    });
  }
});
