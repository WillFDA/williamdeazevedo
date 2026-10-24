// @ts-check
import { satteri } from "@astrojs/markdown-satteri";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import hastAccessibleTables from "./scripts/hast-accessible-tables.mjs";
import hastStaticTaskLists from "./scripts/hast-static-task-lists.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://williamdeazevedo.fr/",
  integrations: [mdx(), sitemap()],

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
