import { describe, expect, test } from "bun:test";
import { pathToFileURL } from "node:url";

import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri";

import hastArticleFaq from "../scripts/hast-article-faq.mjs";
import { splitArticleFaq } from "../src/lib/articleFaq";

// Same pipeline as the build: the hast plugin marks the FAQ, Astro then adds
// the heading ids, and splitArticleFaq reads the section back.
const render = async (
  markdown: string,
  file = "src/content/articles/test.md"
) => {
  const processor = await createSatteriMarkdownProcessor({
    hastPlugins: [hastArticleFaq],
    syntaxHighlight: false,
  });
  const { code } = await processor.render(markdown, {
    fileURL: pathToFileURL(file),
  });
  return code;
};

const article = `Intro.

## Questions fréquentes

### Combien ça coûte ?

Voir [les tarifs](/tarifs/) et \`votresite.fr\`.

- un point
- un autre

### Et après ?

Une réponse.

Un second paragraphe.

## Sources officielles

- [Source](https://example.com)
`;

describe("splitArticleFaq", () => {
  test("splits the article around its FAQ, answers kept as rendered HTML", async () => {
    const { after, before, faq } = splitArticleFaq(await render(article));

    expect(before).toBe("<p>Intro.</p>");
    expect(after).toStartWith('<h2 id="sources-officielles">');
    expect(faq?.titleId).toBe("questions-fréquentes");
    expect(faq?.items).toEqual([
      {
        answerHtml:
          '<p>Voir <a href="/tarifs/">les tarifs</a> et <code>votresite.fr</code>.</p>\n<ul>\n<li>un point</li>\n<li>un autre</li>\n</ul>',
        questionHtml: "Combien ça coûte ?",
        questionId: "combien-ça-coûte-",
      },
      {
        answerHtml: "<p>Une réponse.</p>\n<p>Un second paragraphe.</p>",
        questionHtml: "Et après ?",
        questionId: "et-après-",
      },
    ]);
  });

  test("a FAQ that ends the article leaves nothing after it", async () => {
    const parts = splitArticleFaq(await render(article.split("## Sources")[0]));
    expect(parts.after).toBe("");
    expect(parts.faq?.items).toHaveLength(2);
  });

  test("leaves an article without FAQ untouched", async () => {
    const html = await render("Intro.\n\n## Autre partie\n\nTexte.\n");
    expect(splitArticleFaq(html)).toEqual({ after: "", before: html });
  });

  test("only articles are grouped", async () => {
    const html = await render(article, "src/content/realisations/test.md");
    expect(splitArticleFaq(html).faq).toBeUndefined();
  });

  test("rejects text between the FAQ title and its first question", async () => {
    await expect(
      render(
        "## Questions fréquentes\n\nIntro.\n\n### Question ?\n\nRéponse.\n"
      )
    ).rejects.toThrow("must start with a ### question");
  });
});
