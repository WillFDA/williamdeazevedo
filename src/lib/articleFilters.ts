// Logique pure des filtres d'articles (testée dans tests/articleFilters.test.ts).

export const ALL_VALUE = "all";
const COMBINING_MARKS = /[\u0300-\u036F]/g;

export type ArticleFilterState = {
  search: string;
  tag: string;
};

export type FilterableArticle = {
  description: string;
  tags: string[];
  title: string;
};

export const normalize = (value: string) =>
  value.toLowerCase().normalize("NFD").replaceAll(COMBINING_MARKS, "");

/** Valeur canonique de la liste, comparée sans casse ni accents. */
const getAllowedValue = (value: string | null, allowed: string[]) => {
  if (!value) return ALL_VALUE;
  const wanted = normalize(value);
  return allowed.find((item) => normalize(item) === wanted) ?? ALL_VALUE;
};

export const readFiltersFromUrl = (
  search: string,
  tags: string[]
): ArticleFilterState => {
  const params = new URLSearchParams(search);
  return {
    search: params.get("search") ?? "",
    tag: getAllowedValue(params.get("tag"), tags),
  };
};

export const writeFiltersToUrl = (href: string, state: ArticleFilterState) => {
  const url = new URL(href);
  const query = state.search.trim();
  if (query) url.searchParams.set("search", query);
  else url.searchParams.delete("search");
  if (state.tag === ALL_VALUE) url.searchParams.delete("tag");
  else url.searchParams.set("tag", state.tag);
  // Ancien filtre par année, retiré : on nettoie les vieux liens.
  url.searchParams.delete("year");
  return `${url.pathname}${url.search}${url.hash}`;
};

export const filterArticles = (
  articles: FilterableArticle[],
  state: ArticleFilterState
) => {
  const query = normalize(state.search.trim());
  const selectedTag = state.tag === ALL_VALUE ? "" : normalize(state.tag);

  return articles.map((article) => {
    const itemTags = article.tags.filter(Boolean).map(normalize);
    const matchesQuery =
      query.length === 0 ||
      normalize(article.title).includes(query) ||
      normalize(article.description).includes(query) ||
      itemTags.join(" ").includes(query);
    const matchesTag =
      selectedTag.length === 0 || itemTags.includes(selectedTag);
    return matchesQuery && matchesTag;
  });
};

/**
 * Garde les `limit` premiers articles retenus par les filtres (« Voir plus »
 * augmente la limite). Une recherche affiche tous ses résultats.
 */
export const paginateArticles = (
  matches: boolean[],
  state: ArticleFilterState,
  limit: number
) => {
  const max = state.search.trim().length > 0 ? Number.POSITIVE_INFINITY : limit;
  let matchCount = 0;
  const visible = matches.map((isMatch) => {
    if (!isMatch) return false;
    matchCount += 1;
    return matchCount <= max;
  });

  return { hasMore: matchCount > max, matchCount, visible };
};
