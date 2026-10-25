// Group an article's « Questions fréquentes » section (its h2, then one h3 per
// question up to the next h2) so the article page can render it like the
// homepage FAQ. src/lib/articleFaq.ts reads these data-article-faq markers back.
// Sätteri hast plugin, limited to the articles collection.
const FAQ_TITLE = "Questions fréquentes";

const isElement = (node, tagName) =>
  node.type === "element" && node.tagName === tagName;

// Moved nodes are copied: the originals are removed in the same pass.
const clone = (node) =>
  Object.fromEntries(
    Object.entries(node)
      .filter(([key]) => key !== "position")
      .map(([key, value]) => [
        key,
        key === "children" ? value.map(clone) : value,
      ])
  );

const wrapper = (tagName, marker, children) => ({
  type: "element",
  tagName,
  properties: { dataArticleFaq: marker },
  children,
});

const articleFaq = {
  name: "article-faq",
  after(root, ctx) {
    const nodes = root.children;
    const start = nodes.findIndex(
      (node) =>
        isElement(node, "h2") && ctx.textContent(node).trim() === FAQ_TITLE
    );
    if (start === -1) return;
    const next = nodes.findIndex(
      (node, index) => index > start && isElement(node, "h2")
    );
    const section = nodes.slice(start + 1, next === -1 ? undefined : next);
    const items = [];
    for (const node of section) {
      if (isElement(node, "h3")) {
        items.push(wrapper("div", "item", [clone(node)]));
      } else if (items.length > 0) {
        items.at(-1).children.push(clone(node));
      } else if (node.type !== "text" || node.value.trim()) {
        // Text before the first question has no place in the FAQ layout.
        throw new Error(
          `${ctx.fileURL?.pathname}: « ${FAQ_TITLE} » must start with a ### question.`
        );
      }
    }
    if (items.length === 0) return;
    ctx.replaceNode(
      nodes[start],
      wrapper("section", "section", [clone(nodes[start]), ...items])
    );
    for (const node of section) ctx.removeNode(node);
  },
};

export default function hastArticleFaq({ fileURL }) {
  return fileURL?.pathname.includes("/src/content/articles/")
    ? articleFaq
    : null;
}
