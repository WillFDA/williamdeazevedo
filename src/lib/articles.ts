import { type CollectionEntry, getCollection } from "astro:content";

export type Article = CollectionEntry<"articles">;

/**
 * An article is visible once it is not a draft and its scheduled release date
 * (`pubDate`) has been reached.
 */
export function isArticleVisible(
  article: Article,
  now: Date = new Date()
): boolean {
  if (article.data.draft) {
    return false;
  }
  return article.data.pubDate.getTime() <= now.getTime();
}

/**
 * Returns published articles, newest first.
 *
 * In production only visible articles are returned, so scheduled (future-dated)
 * and draft articles get no page at all and are unreachable until a rebuild
 * happens after their `pubDate`. In dev, everything is shown so you can preview.
 */
export async function getVisibleArticles(): Promise<Article[]> {
  const articles = await getCollection("articles", (article) =>
    import.meta.env.PROD ? isArticleVisible(article) : true
  );

  return articles.toSorted(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );
}

export function formatArticleDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const WORDS_PER_MINUTE = 220;

export function getArticleWordCount(body: string | undefined): number {
  if (!body) {
    return 0;
  }

  const plainText = body
    .replaceAll(/^import\s+.*$/gm, " ")
    .replaceAll(/```[\s\S]*?```/g, " ")
    .replaceAll(/<[A-Z][\w.-]*(?:\s[\s\S]*?)?\/>/g, " ")
    .replaceAll(/<[^>]+>/g, " ")
    .replaceAll(/^\|[\s:|-]+\|$/gm, " ")
    .replaceAll(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replaceAll(/\[(?<label>[^\]]+)\]\([^)]+\)/g, "$<label>");

  return plainText.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
}

export function getArticleReadingTimeMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

/**
 * Picks up to `limit` published articles most relevant to `current`.
 * Specific tags (rare across the corpus) weigh more than broad tags like "tpe"
 * or "site vitrine", with recency as tie-breaker.
 */
export function getRelatedArticles(
  current: Article,
  allVisible: readonly Article[],
  limit = 3
): Article[] {
  const tagCounts = new Map<string, number>();
  for (const item of allVisible) {
    for (const tag of item.data.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const currentTags = new Set(current.data.tags);

  return allVisible
    .filter((candidate) => candidate.id !== current.id)
    .map((candidate) => {
      let score = 0;
      for (const tag of candidate.data.tags) {
        if (currentTags.has(tag)) {
          score += 1 / (tagCounts.get(tag) ?? 1);
        }
      }
      return { candidate, score };
    })
    .toSorted(
      (a, b) =>
        b.score - a.score ||
        b.candidate.data.pubDate.getTime() - a.candidate.data.pubDate.getTime()
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
