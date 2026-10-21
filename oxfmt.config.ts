import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

// Ultracite 8 types these fields as optional; they are always set in its preset.
const ultraciteIgnorePatterns = ultracite.ignorePatterns ?? [];
const ultraciteTailwind =
  typeof ultracite.sortTailwindcss === "object"
    ? ultracite.sortTailwindcss
    : {};

export default defineConfig({
  ...ultracite,
  // ponytail: .astro formatting exists in oxfmt 0.74 (`astro` option, needs
  // @astrojs/compiler-rs) but stays off: it would reindent every template.
  ignorePatterns: [...ultraciteIgnorePatterns, "**/*.astro"],
  sortTailwindcss: {
    ...ultraciteTailwind,
    stylesheet: "./src/styles/global.css",
  },
});
