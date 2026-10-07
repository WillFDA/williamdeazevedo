import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

// Articles (blog). Files prefixed with `_` are ignored, so you can keep
// work-in-progress drafts out of the build entirely.
const articles = defineCollection({
  loader: glob({
    base: "./src/content/articles",
    pattern: "**/[^_]*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    description: z.string(),
    // `pubDate` doubles as the scheduled release date: an article is not
    // rendered (and gets no page) until this date is reached. See
    // `src/lib/articles.ts`.
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    image: z
      .object({
        alt: z.string().default(""),
        src: z.string(),
      })
      .optional(),
    author: z.string().default("William De Azevedo"),
    // Force-hide an article regardless of its date.
    draft: z.boolean().default(false),
  }),
});

const realisations = defineCollection({
  loader: glob({
    base: "./src/content/realisations",
    pattern: "**/[^_]*.{md,mdx}",
  }),
  schema: z.object({
    projectId: z.string(),
    siteLabel: z.string().default("Voir le site"),
    partners: z
      .array(
        z
          .object({
            label: z.string().optional(),
            projectId: z.string().optional(),
            href: z.string().url().optional(),
            description: z.string().optional(),
          })
          .refine((partner) => partner.href || partner.projectId, {
            message: "A partner needs either href or projectId.",
          })
      )
      .default([]),
    gallery: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string(),
        })
      )
      .default([]),
  }),
});

export const collections = { articles, realisations };
