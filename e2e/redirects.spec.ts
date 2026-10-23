import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

// Règles réellement servies : dist/_redirects (public/_redirects + règles
// générées au build), appliqué par le runtime Workers local de wrangler.
type Rule = { from: string; status: number; to: string };

const rules: Rule[] = readFileSync("dist/_redirects", "utf-8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => {
    const [from = "", to = "", status = "302"] = line.split(/\s+/);
    return { from, status: Number(status), to };
  });

const exactRules = rules.filter((rule) => !rule.from.includes("*"));

test("toutes les redirections sont permanentes (301)", () => {
  expect(rules.length).toBeGreaterThan(0);
  expect(rules.filter((rule) => rule.status !== 301)).toEqual([]);
});

test("les règles exactes passent avant les règles génériques", () => {
  const firstSplat = rules.findIndex((rule) => rule.from.includes("*"));
  if (firstSplat === -1) return;
  const lateExact = rules
    .slice(firstSplat + 1)
    .filter(
      (rule) => !rule.from.includes("*") && rule.from.startsWith("/blog")
    );
  expect(lateExact).toEqual([]);
});

for (const rule of exactRules) {
  test(`${rule.from} → ${rule.to} (301, cible en 200)`, async ({ request }) => {
    const response = await request.get(rule.from, { maxRedirects: 0 });
    expect(response.status()).toBe(rule.status);
    expect(
      new URL(response.headers().location ?? "", "http://x").pathname
    ).toBe(rule.to);
    const target = await request.get(rule.to, { maxRedirects: 0 });
    expect(target.status()).toBe(200);
  });
}

test("une ancienne URL /blog inconnue finit sur /articles/", async ({
  request,
}) => {
  const response = await request.get("/blog/article-qui-n-existe-pas", {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(301);
  expect(new URL(response.headers().location ?? "", "http://x").pathname).toBe(
    "/articles/"
  );
});
