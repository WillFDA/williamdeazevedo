/**
 * Maillage articles ↔ pages services.
 *
 * - `serviceReadings` : articles proposés dans le bloc « À lire avant de vous
 *   lancer » de chaque page service, par ordre de priorité. Seuls les articles
 *   publiés sont affichés (les brouillons apparaîtront d'eux-mêmes une fois
 *   publiés). Si moins de 2 articles sont disponibles, le bloc complète avec
 *   des articles qui partagent un des `fallbackTags`.
 * - `articleServices` : service mis en avant dans l'encart en bas d'un
 *   article, par ordre de priorité (le premier service existant est utilisé).
 */
export type ServiceReading = {
  articles: string[];
  fallbackTags: string[];
};

export const serviceReadings: Record<string, ServiceReading> = {
  "creation-site-vitrine": {
    articles: [
      "site-600-euros-vs-site-2000-euros",
      "hebergement-site-vitrine",
      "prix-site-vitrine",
      "landing-page",
      "site-one-page",
      "exemples-sites-vitrines",
      "audit-seo",
    ],
    fallbackTags: ["site vitrine"],
  },
  "refonte-site-internet": {
    articles: [
      "changer-prestataire-web",
      "prix-refonte-site-internet",
      "refonte-seo",
      "audit-seo",
      "tester-accessibilite-site-web",
    ],
    fallbackTags: ["refonte"],
  },
  "developpeur-web-freelance": {
    articles: [
      "choisir-developpeur-web",
      "site-600-euros-vs-site-2000-euros",
      "application-metier-sur-mesure-btp",
      "landing-page",
    ],
    fallbackTags: ["tpe"],
  },
  "creation-site-internet-artisan": {
    articles: [
      "site-internet-artisan-contenus",
      "fiche-google-my-business-artisan",
      "widget-avis-google",
      "mentions-legales-site-internet-professionnel",
    ],
    fallbackTags: ["artisan"],
  },
  "creation-site-internet-professionnel": {
    articles: [
      "mentions-legales-site-internet-professionnel",
      "charte-graphique-entreprise",
      "cahier-des-charges-site-internet",
      "site-600-euros-vs-site-2000-euros",
      "landing-page",
    ],
    fallbackTags: ["tpe"],
  },
  // Pages proposées dans des PR séparées : sans effet tant qu'elles n'existent pas.
  "creation-site-internet-yvelines": {
    articles: [
      "fiche-google-my-business-artisan",
      "widget-avis-google",
      "audit-seo",
    ],
    fallbackTags: ["artisan"],
  },
  "developpement-sur-mesure": {
    // L'article application-metier-sur-mesure-btp est déjà lié par la preuve
    // de cette page : pas de doublon ici.
    articles: [
      "choisir-developpeur-web",
      "cahier-des-charges-site-internet",
      "site-600-euros-vs-site-2000-euros",
    ],
    // Pas de repli : le tag « tpe » ramènerait l'article Réglet en doublon.
    fallbackTags: [],
  },
};

export const articleServices: Record<string, string[]> = {
  "application-metier-sur-mesure-btp": [
    "developpement-sur-mesure",
    "developpeur-web-freelance",
  ],
  "audit-seo": ["creation-site-vitrine"],
  "cahier-des-charges-site-internet": ["creation-site-vitrine"],
  "changer-prestataire-web": ["refonte-site-internet"],
  "charte-graphique-entreprise": ["creation-site-internet-professionnel"],
  "choisir-developpeur-web": ["creation-site-vitrine"],
  "cout-site-internet-par-mois": ["creation-site-vitrine"],
  "creer-site-internet-ia": ["creation-site-vitrine"],
  "exemples-sites-vitrines": ["creation-site-vitrine"],
  "fiche-google-my-business-artisan": ["creation-site-internet-artisan"],
  "hebergement-site-vitrine": ["creation-site-vitrine"],
  "landing-page": ["creation-site-vitrine"],
  "maquette-site-web": ["creation-site-vitrine"],
  "mentions-legales-site-internet-professionnel": [
    "creation-site-internet-professionnel",
  ],
  "prix-refonte-site-internet": ["refonte-site-internet"],
  "prix-site-vitrine": ["creation-site-vitrine"],
  "referencement-chatgpt": ["refonte-site-internet"],
  "refonte-seo": ["refonte-site-internet"],
  "seo-local": ["creation-site-internet-artisan"],
  "site-600-euros-vs-site-2000-euros": ["creation-site-vitrine"],
  "site-non-securise": ["refonte-site-internet"],
  "site-one-page": ["creation-site-vitrine"],
  "site-pas-sur-google": ["refonte-site-internet"],
  "site-internet-artisan-contenus": ["creation-site-internet-artisan"],
  "tester-accessibilite-site-web": ["refonte-site-internet"],
  "widget-avis-google": ["creation-site-vitrine"],
  "wix-ou-wordpress": ["creation-site-vitrine"],
  // premier-side-project-motivai : projet personnel, pas d'encart service.
};
