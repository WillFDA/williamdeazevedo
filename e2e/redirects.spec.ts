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

const isPattern = (from: string) => /[*:]/.test(from);
const exactRules = rules.filter((rule) => !isPattern(rule.from));

// Source Cloudflare (`*`, `:param`) en expression régulière.
const matcherOf = (from: string) =>
  new RegExp(
    `^${from
      .replaceAll(/[.+?^${}()|[\]\\]/g, String.raw`\$&`)
      .replaceAll("*", ".*")
      .replaceAll(/:[A-Za-z]\w*/g, "[^/]+")}$`
  );

// Une cible peut être un chemin ou une URL absolue.
const expectLocation = (location: string | undefined, to: string) => {
  if (/^https?:\/\//.test(to)) {
    expect(location).toBe(to);
    return;
  }
  expect(new URL(location ?? "", "http://x").pathname).toBe(to);
};

test("toutes les redirections sont permanentes (301)", () => {
  expect(rules.length).toBeGreaterThan(0);
  expect(rules.filter((rule) => rule.status !== 301)).toEqual([]);
});

test("aucune règle exacte n'est masquée par un joker placé avant elle", () => {
  const shadowed = rules.flatMap((rule, index) =>
    isPattern(rule.from)
      ? []
      : rules
          .slice(0, index)
          .filter(
            (earlier) =>
              isPattern(earlier.from) && matcherOf(earlier.from).test(rule.from)
          )
          .map((earlier) => `${rule.from} masquée par ${earlier.from}`)
  );
  expect(shadowed).toEqual([]);
});

for (const rule of exactRules) {
  test(`${rule.from} → ${rule.to} (301, cible en 200)`, async ({ request }) => {
    const response = await request.get(rule.from, { maxRedirects: 0 });
    expect(response.status()).toBe(rule.status);
    expectLocation(response.headers().location, rule.to);
    if (/^https?:\/\//.test(rule.to)) return;
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
