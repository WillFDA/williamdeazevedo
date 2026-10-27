import { defineConfig } from "oxlint";
import astro from "ultracite/oxlint/astro";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";

export default defineConfig({
  extends: [core, astro, react],
  env: core.env,
  ignorePatterns: core.ignorePatterns,
  // ponytail: keep Ultracite useful without renaming/refactoring the existing app.
  rules: {
    curly: "off",
    "func-style": "off",
    "import/consistent-type-specifier-style": "off",
    "no-implicit-globals": "off",
    // Function declarations are hoisted (no TDZ): mutual recursion such as
    // schedule <-> tick in Marquee stays allowed; variables and classes are still checked.
    "no-use-before-define": ["error", { functions: false }],
    "prefer-destructuring": "off",
    "react/function-component-definition": "off",
    "require-unicode-regexp": "off",
    "sort-keys": "off",
    "typescript/array-type": "off",
    "typescript/consistent-type-definitions": "off",
    "unicorn/consistent-function-scoping": "off",
    "unicorn/filename-case": "off",
    "unicorn/no-array-for-each": "off",
    "unicorn/no-useless-undefined": "off",
    // parseFloat/parseInt are intentional: CSS durations like "0.3s" become NaN with Number().
    "unicorn/prefer-number-coercion": "off",
    "unicorn/prefer-query-selector": "off",
    "unicorn/prefer-spread": "off",
  },
});
