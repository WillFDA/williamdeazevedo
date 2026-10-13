export type FaqJsonLdItem = {
  answer: string;
  question: string;
};

/** JSON-LD FAQPage partagé par les pages services et l'accueil. */
export function buildFaqJsonLd(items: readonly FaqJsonLdItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
