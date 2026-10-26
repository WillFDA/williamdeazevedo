import { expect, test } from "bun:test";

import {
  filterArticles,
  paginateArticles,
  readFiltersFromUrl,
  writeFiltersToUrl,
} from "../src/lib/articleFilters";

const articles = [
  {
    description: "Référencement local",
    tags: ["SEO"],
    title: "Être trouvé à Achères",
  },
  {
    description: "Choisir un CMS",
    tags: ["Wix", "WordPress"],
    title: "Wix ou WordPress",
  },
];

test("search ignores accents and case, and matches tags", () => {
  expect(filterArticles(articles, { search: "acheres", tag: "all" })).toEqual([
    true,
    false,
  ]);
  expect(filterArticles(articles, { search: "WORDPRESS", tag: "all" })).toEqual(
    [false, true]
  );
});

test("search and tag filters combine", () => {
  expect(filterArticles(articles, { search: "cms", tag: "SEO" })).toEqual([
    false,
    false,
  ]);
  expect(filterArticles(articles, { search: "cms", tag: "Wix" })).toEqual([
    false,
    true,
  ]);
});

test("unknown url values fall back to all, and the url round-trips", () => {
  expect(readFiltersFromUrl("?tag=Inconnu&search=seo", ["SEO"])).toEqual({
    search: "seo",
    tag: "all",
  });
  expect(
    writeFiltersToUrl("https://williamdeazevedo.fr/articles/?x=1#a", {
      search: " seo ",
      tag: "SEO",
    })
  ).toBe("/articles/?x=1&search=seo&tag=SEO#a");
});

test("an article without tags never matches a tag filter", () => {
  const untagged = [{ description: "", tags: [], title: "Sans tag" }];
  expect(filterArticles(untagged, { search: "", tag: "SEO" })).toEqual([false]);
  expect(filterArticles(untagged, { search: "sans", tag: "all" })).toEqual([
    true,
  ]);
});

test("back to « all » and an empty search removes the parameters", () => {
  expect(
    writeFiltersToUrl(
      "https://williamdeazevedo.fr/articles/?search=seo&tag=SEO",
      { search: "  ", tag: "all" }
    )
  ).toBe("/articles/");
});

test("the removed year filter is dropped from old links", () => {
  expect(
    writeFiltersToUrl("https://williamdeazevedo.fr/articles/?year=2025", {
      search: "",
      tag: "SEO",
    })
  ).toBe("/articles/?tag=SEO");
});

test("a tag in the url is matched without case or accents", () => {
  expect(readFiltersFromUrl("?tag=seo", ["SEO", "Référencement"]).tag).toBe(
    "SEO"
  );
  expect(
    readFiltersFromUrl("?tag=referencement", ["SEO", "Référencement"]).tag
  ).toBe("Référencement");
});

test("only the first `limit` matches are shown until « Voir plus »", () => {
  const matches = [true, false, true, true, true];
  expect(paginateArticles(matches, { search: "", tag: "all" }, 2)).toEqual({
    hasMore: true,
    matchCount: 4,
    visible: [true, false, true, false, false],
  });
  expect(paginateArticles(matches, { search: "", tag: "all" }, 4)).toEqual({
    hasMore: false,
    matchCount: 4,
    visible: [true, false, true, true, true],
  });
});

test("a search shows every result, without « Voir plus »", () => {
  expect(
    paginateArticles(
      [true, true, false, true],
      { search: "seo", tag: "all" },
      1
    )
  ).toEqual({
    hasMore: false,
    matchCount: 3,
    visible: [true, true, false, true],
  });
});
