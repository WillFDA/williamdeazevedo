import { fileURLToPath } from "node:url";

// @ts-check
import { satteri } from "@astrojs/markdown-satteri";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import hastAccessibleTables from "./scripts/hast-accessible-tables.mjs";
import hastStaticTaskLists from "./scripts/hast-static-task-lists.mjs";
import {
  createSitemapSerializer,
  readArticleDates,
  seoRedirects,
} from "./scripts/seo-build.mjs";

const articleDates = readArticleDates(
  fileURLToPath(new URL("src/content/articles/", import.meta.url))
);

// https://astro.build/config
export default defineConfig({
  site: "https://williamdeazevedo.fr/",
  integrations: [
    react(),
    mdx(),
    sitemap({ serialize: createSitemapSerializer(articleDates) }),
    // Après sitemap : complète dist/_redirects (301 barre finale, /blog/<slug>).
    seoRedirects(),
  ],

  // <ClientRouter /> turns prefetch ON by default (prefetchAll, hover strategy)
  // — exactly the hover-time, full-page fetching that made the homepage hover
  // interactions feel laggy. Keep link prefetch disabled (the "disable link
  // prefetch" decision on 2026): the client router already makes navigation
  // feel instant without prefetching every link on hover. No links opt back in
  // via data-astro-prefetch, so this effectively disables prefetch.
  prefetch: {
    prefetchAll: false,
  },

  markdown: {
    // Sätteri (Astro's native pipeline) also renders .mdx: @astrojs/mdx
    // inherits markdown.processor, so both plugins apply to every article.
    processor: satteri({
      hastPlugins: [hastAccessibleTables, hastStaticTaskLists],
    }),
    shikiConfig: {
      theme: "github-dark-dimmed",
      wrap: true,
    },
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
});
