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
  // ponytail: Oxfmt does not format Astro templates yet; remove when support lands.
  ignorePatterns: [...ultraciteIgnorePatterns, "**/*.astro"],
  sortTailwindcss: {
    ...ultraciteTailwind,
    stylesheet: "./src/styles/global.css",
  },
});
