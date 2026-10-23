// Logique pure des filtres d'articles (testée dans tests/articleFilters.test.ts).

export const ALL_VALUE = "all";
const COMBINING_MARKS = /[\u0300-\u036F]/g;

export type ArticleFilterState = {
  search: string;
  tag: string;
  year: string;
};

export type FilterableArticle = {
  description: string;
  tags: string[];
  title: string;
  year: string;
};

export const normalize = (value: string) =>
  value.toLowerCase().normalize("NFD").replaceAll(COMBINING_MARKS, "");

const getAllowedValue = (value: string | null, allowed: string[]) =>
  value && allowed.includes(value) ? value : ALL_VALUE;

export const readFiltersFromUrl = (
  search: string,
  tags: string[],
  years: string[]
): ArticleFilterState => {
  const params = new URLSearchParams(search);
  return {
    search: params.get("search") ?? "",
    tag: getAllowedValue(params.get("tag"), tags),
    year: getAllowedValue(params.get("year"), years),
  };
};

export const writeFiltersToUrl = (href: string, state: ArticleFilterState) => {
  const url = new URL(href);
  const query = state.search.trim();
  if (query) url.searchParams.set("search", query);
  else url.searchParams.delete("search");
  if (state.tag === ALL_VALUE) url.searchParams.delete("tag");
  else url.searchParams.set("tag", state.tag);
  if (state.year === ALL_VALUE) url.searchParams.delete("year");
  else url.searchParams.set("year", state.year);
  return `${url.pathname}${url.search}${url.hash}`;
};

export const filterArticles = (
  articles: FilterableArticle[],
  state: ArticleFilterState
) => {
  const query = normalize(state.search.trim());
  const selectedTag = state.tag === ALL_VALUE ? "" : normalize(state.tag);
  const selectedYear = state.year === ALL_VALUE ? "" : state.year;

  return articles.map((article) => {
    const itemTags = article.tags.map(normalize);
    const matchesQuery =
      query.length === 0 ||
      normalize(article.title).includes(query) ||
      normalize(article.description).includes(query) ||
      itemTags.join(" ").includes(query);
    const matchesTag =
      selectedTag.length === 0 || itemTags.includes(selectedTag);
    const matchesYear =
      selectedYear.length === 0 || article.year === selectedYear;
    return matchesQuery && matchesTag && matchesYear;
  });
};
