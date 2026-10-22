// Offres et prix publiés sur l'accueil (repris tels quels de l'ancien
// PricingPreview.astro). Ce sont les seuls prix du site : n'en ajouter aucun
// sans validation. Montants en euros HT.

export type PricingOption = {
  id: string;
  label: string;
  /** Supplément en euros HT. Absent : option chiffrée sur devis. */
  price?: number;
};

export const siteOffer = {
  title: "Site web",
  subtitle:
    "Pour lancer, clarifier ou moderniser une présence web qui inspire confiance.",
  basePrice: 2000,
  delay: "Livré en 10 jours à 5 semaines selon périmètre",
  cta: "Parlons de votre site web",
  ctaLocation: "pricing-site-web",
  features: [
    "Architecture et parcours de conversion",
    "Design responsive sur mesure",
    "Développement front-end propre",
    "SEO technique et performance",
    "Mise en ligne",
  ],
  options: [
    { id: "animations", label: "Animations", price: 500 },
    { id: "formulaire", label: "Formulaire contact personnalisé", price: 500 },
    { id: "cms", label: "CMS / contenus modifiables", price: 1000 },
    { id: "google-ads", label: "Google Ads" },
  ] satisfies PricingOption[],
};

export const productOffer = {
  title: "Interface produit",
  subtitle:
    "Pour construire ou améliorer un SaaS, dashboard, espace client ou outil métier.",
  price: "Sur devis",
  framingFrom: 900,
  delay: "Planning défini après lecture du périmètre",
  cta: "Cadrer votre interface",
  ctaLocation: "pricing-interface-produit",
  footnote:
    "Le prix dépend surtout des écrans, états, rôles, données et intégrations.",
  features: [
    "Intégration Figma ou design système",
    "React / Next.js",
    "Authentification ou espace client",
    "Dashboard ou back-office",
    "IA, paiement ou API externe",
    "Mise en ligne",
  ],
};

/** 2000 → « 2 000 » (espace fine insécable, comme Intl côté client). */
export const formatEuro = (value: number) =>
  new Intl.NumberFormat("fr-FR").format(value);
