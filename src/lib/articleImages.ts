import type { ImageMetadata } from "astro";

// Les images d'articles restent dans public/articles/<slug>/ : leur URL
// publique sert d'image Open Graph stable (vérifiée par check:editorial). On
// les importe aussi ici pour que l'affichage passe par le pipeline d'images
// d'Astro (dimensions connues, variantes AVIF/WebP responsives).
const publicArticleImages = import.meta.glob<ImageMetadata>(
  "../../public/articles/**/*.{webp,png,jpg,jpeg}",
  { eager: true, import: "default" }
);

/** Retrouve l'image importée correspondant à une URL publique `/articles/...`. */
export const getPublicArticleImage = (
  publicSrc: string | undefined
): ImageMetadata | undefined =>
  publicSrc ? publicArticleImages[`../../public${publicSrc}`] : undefined;
