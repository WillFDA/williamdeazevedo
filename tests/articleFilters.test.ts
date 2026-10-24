import { expect, test } from "bun:test";

import {
  filterArticles,
  readFiltersFromUrl,
  writeFiltersToUrl,
} from "../src/lib/articleFilters";

const articles = [
  {
    description: "Référencement local",
    tags: ["SEO"],
    title: "Être trouvé à Achères",
    year: "2026",
  },
  {
    description: "Choisir un CMS",
    tags: ["Wix", "WordPress"],
    title: "Wix ou WordPress",
    year: "2025",
  },
];

test("search ignores accents and case, and matches tags", () => {
  expect(
    filterArticles(articles, { search: "acheres", tag: "all", year: "all" })
  ).toEqual([true, false]);
  expect(
    filterArticles(articles, { search: "WORDPRESS", tag: "all", year: "all" })
  ).toEqual([false, true]);
});

test("tag and year filters combine", () => {
  expect(
    filterArticles(articles, { search: "", tag: "SEO", year: "2025" })
  ).toEqual([false, false]);
  expect(
    filterArticles(articles, { search: "", tag: "Wix", year: "2025" })
  ).toEqual([false, true]);
});

test("unknown url values fall back to all, and the url round-trips", () => {
  expect(
    readFiltersFromUrl("?tag=Inconnu&year=1999&search=seo", ["SEO"], ["2026"])
  ).toEqual({
    search: "seo",
    tag: "all",
    year: "all",
  });
  expect(
    writeFiltersToUrl("https://williamdeazevedo.fr/articles/?x=1#a", {
      search: " seo ",
      tag: "SEO",
      year: "all",
    })
  ).toBe("/articles/?x=1&search=seo&tag=SEO#a");
});

test("an article without tags never matches a tag filter", () => {
  const untagged = [
    { description: "", tags: [], title: "Sans tag", year: "2026" },
  ];
  expect(
    filterArticles(untagged, { search: "", tag: "SEO", year: "all" })
  ).toEqual([false]);
  expect(
    filterArticles(untagged, { search: "sans", tag: "all", year: "all" })
  ).toEqual([true]);
});

test("back to « all » and an empty search removes the parameters", () => {
  expect(
    writeFiltersToUrl(
      "https://williamdeazevedo.fr/articles/?search=seo&tag=SEO&year=2026",
      { search: "  ", tag: "all", year: "all" }
    )
  ).toBe("/articles/");
});

test("a tag in the url is matched without case or accents", () => {
  expect(readFiltersFromUrl("?tag=seo", ["SEO", "Référencement"], []).tag).toBe(
    "SEO"
  );
  expect(
    readFiltersFromUrl("?tag=referencement", ["SEO", "Référencement"], []).tag
  ).toBe("Référencement");
});
