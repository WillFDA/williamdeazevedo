// Reads back the « Questions fréquentes » section that
// scripts/hast-article-faq.mjs marks in an article's rendered HTML, so the
// article page can render it with FaqSection, outside the reading column.

export type ArticleFaqItem = {
  answerHtml: string;
  questionHtml: string;
  questionId: string;
};

export type ArticleFaq = {
  items: ArticleFaqItem[];
  titleId: string;
};

export type ArticleBodyParts = {
  after: string;
  before: string;
  faq?: ArticleFaq;
};

const SECTION_START = /<section\b[^>]*\bdata-article-faq="section"[^>]*>/;
const SECTION_TAG = /<(?<closing>\/?)section\b/g;
const SECTION_CLOSE = "</section>";
const ITEM_START = /<div\b[^>]*\bdata-article-faq="item"[^>]*>/;
const ITEM_END = /<\/div>\s*$/;
const HEADING =
  /^\s*<h(?<level>[23])\b(?<attributes>[^>]*)>(?<html>[\s\S]*?)<\/h\k<level>>/;
const ID = /\bid="(?<id>[^"]+)"/;

const readHeading = (html: string, level: "2" | "3") => {
  const heading = HEADING.exec(html);
  const id = ID.exec(heading?.groups?.attributes ?? "")?.groups?.id;
  if (!heading?.groups || heading.groups.level !== level || !id) {
    throw new Error(`Article FAQ: expected an <h${level}> with an id.`);
  }
  return {
    html: heading.groups.html,
    id,
    rest: html.slice(heading[0].length),
  };
};

/** Index just after the `</section>` that closes the one opened at `start`. */
const findSectionEnd = (html: string, start: number) => {
  let depth = 0;
  for (const tag of html.slice(start).matchAll(SECTION_TAG)) {
    depth += tag.groups?.closing ? -1 : 1;
    if (depth === 0) return start + tag.index + SECTION_CLOSE.length;
  }
  throw new Error("Article FAQ: unclosed section.");
};

/** Splits an article's HTML around its FAQ; `faq` is absent when it has none. */
export const splitArticleFaq = (html: string): ArticleBodyParts => {
  const opening = SECTION_START.exec(html);
  if (!opening) return { after: "", before: html };

  const end = findSectionEnd(html, opening.index);
  const inner = html.slice(
    opening.index + opening[0].length,
    end - SECTION_CLOSE.length
  );
  const [head = "", ...chunks] = inner.split(ITEM_START);
  const items = chunks.map((chunk) => {
    const question = readHeading(chunk.replace(ITEM_END, ""), "3");
    return {
      answerHtml: question.rest.trim(),
      questionHtml: question.html,
      questionId: question.id,
    };
  });

  return {
    after: html.slice(end).trim(),
    before: html.slice(0, opening.index).trim(),
    faq: { items, titleId: readHeading(head, "2").id },
  };
};
