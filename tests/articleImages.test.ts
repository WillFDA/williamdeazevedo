import { expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

// Chaque couverture d'article déclarée en /articles/... doit exister dans
// public/ : src/lib/articleImages.ts la retrouve à partir de cette URL
// (sinon ArticleImage.astro échoue au build).
const contentDir = path.join(import.meta.dir, "../src/content/articles");
const publicDir = path.join(import.meta.dir, "../public");
const IMAGE_SRC = /^\s*src:\s*["']?(?<src>\/articles\/[^"'\s]+)["']?\s*$/m;

test("every article cover under /articles/ resolves to a file in public/", () => {
  const files = readdirSync(contentDir).filter((file) => /\.mdx?$/.test(file));
  expect(files.length).toBeGreaterThan(0);
  const missing = files.flatMap((file) => {
    const src = IMAGE_SRC.exec(
      readFileSync(path.join(contentDir, file), "utf-8")
    )?.groups?.src;
    return src && !existsSync(path.join(publicDir, src))
      ? [`${file}: ${src}`]
      : [];
  });
  expect(missing).toEqual([]);
});
