// FAQPage construit à partir de ce que FaqSection affiche : le balisage ne
// peut pas s'écarter du texte visible. Les questions et réponses d'articles
// arrivent en HTML rendu (voir src/lib/articleFaq.ts) et sont ramenées à leur
// texte.

type FaqText = {
  answer?: string;
  answerHtml?: string;
  question?: string;
  questionHtml?: string;
};

// Une fin de bloc sépare deux mots, même sans espace dans le HTML.
const BLOCK_END = /<\/(?:p|li|ul|ol|div|blockquote|pre|tr|h[1-6])>|<br\s*\/?>/g;
const TAG = /<[^>]+>/g;
const ENTITY =
  /&(?:#x(?<hex>[\da-f]+)|#(?<decimal>\d+)|(?<name>amp|apos|gt|lt|nbsp|quot));/gi;
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

const htmlToText = (html: string) =>
  html
    .replaceAll(BLOCK_END, " ")
    .replaceAll(TAG, "")
    .replaceAll(ENTITY, (entity, hex, decimal, name) => {
      if (name) return NAMED_ENTITIES[name.toLowerCase()];
      const codePoint = hex ? Number.parseInt(hex, 16) : Number(decimal);
      return codePoint <= 0x10_ff_ff ? String.fromCodePoint(codePoint) : entity;
    })
    .replaceAll(/\s+/g, " ")
    .trim();

export const buildFaqJsonLd = (items: readonly FaqText[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.questionHtml
      ? htmlToText(item.questionHtml)
      : (item.question ?? ""),
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answerHtml ? htmlToText(item.answerHtml) : (item.answer ?? ""),
    },
  })),
});
