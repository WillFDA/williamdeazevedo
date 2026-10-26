import type { ImageMetadata } from "astro";

import leFellicHomePoster from "../assets/projects/lefellic-home.webp";
import motivaiLandingHero from "../assets/projects/motivai-landing-hero.webp";
import motivaiLandingPreset from "../assets/projects/motivai-landing-preset.webp";
import motivaiLandingPoster from "../assets/projects/motivai-landing.webp";
import persistanceHomePoster from "../assets/projects/persistance-home.webp";
import regletEquipe from "../assets/projects/reglet-equipe.webp";
import regletHomePoster from "../assets/projects/reglet-home.webp";
import regletRapport from "../assets/projects/reglet-rapport.webp";

export type Project = {
  brand: {
    logo: {
      alt: string;
      className?: string;
      src: string;
    };
  };
  caseStudy: {
    need: string;
    overview: string;
    solution: string;
  };
  gallery?: {
    alt: string;
    src: ImageMetadata;
  }[];
  href: string;
  id: string;
  media:
    | {
        poster: ImageMetadata;
        src: string;
        type: "video";
      }
    | {
        poster: ImageMetadata;
        type: "image";
      }
    | {
        label: string;
        type: "placeholder";
      };
  stack: string[];
  tags: {
    icon:
      | "globe"
      | "sparkle"
      | "window-layout"
      | "window-paintbrush"
      | "window-pointer";
    label: string;
  }[];
  summary: string;
  /** Short context label, e.g. "Projet personnel". */
  status?: string;
  seoDescription?: string;
  title: string;
};

export const projects: Project[] = [
  {
    id: "reglet",
    title: "Réglet",
    href: "https://reglet.fr/",
    brand: {
      logo: {
        alt: "Logo Réglet",
        className: "scale-[1.1]",
        src: "/projects/reglet/logo.svg",
      },
    },
    summary:
      "Application de suivi de chantier pour le BTP : l'équipe alimente un journal terrain (photos, audios, notes) et l'IA rédige le rapport de chantier en citant ses sources.",
    seoDescription:
      "Réglet, application de suivi de chantier pour le BTP : journal terrain et rapports de chantier rédigés par IA à partir de photos, audios et notes.",
    tags: [
      { icon: "sparkle", label: "Produit IA" },
      { icon: "window-pointer", label: "Application métier" },
      { icon: "window-layout", label: "BTP" },
    ],
    stack: [
      "TanStack Start",
      "React",
      "TypeScript",
      "PostgreSQL",
      "Cloudflare Workers",
      "Astro",
    ],
    media: {
      type: "image",
      poster: regletHomePoster,
    },
    gallery: [
      {
        src: regletRapport,
        alt: "Journal de chantier et rapport technique rédigé par l'IA dans Réglet",
      },
      {
        src: regletEquipe,
        alt: "Collaboration d'équipe et rôles sur un chantier dans Réglet",
      },
    ],
    caseStudy: {
      overview:
        "Application de suivi de chantier pour le BTP, conçue et développée par William De Azevedo, en ligne sur reglet.fr.",
      need: "Sur le terrain, les constats s'éparpillent entre photos, messages vocaux et notes, et la rédaction du rapport de chantier prend du temps une fois rentré au bureau.",
      solution:
        "Un journal de chantier partagé où chacun dépose photos, audios et notes ; l'IA transcrit les audios, rédige le rapport en citant ses sources, puis l'équipe relit, corrige et exporte en PDF.",
    },
  },
  {
    id: "persistance",
    title: "Persistance",
    href: "https://persistance-studio.fr/",
    brand: {
      logo: {
        alt: "Logo Persistance",
        className: "scale-[1.24]",
        src: "/projects/persistance/logo.png",
      },
    },
    summary:
      "Site vitrine administrable pour un studio d'accompagnement graphique, avec portfolio, articles, témoignages, pages prestations, SEO technique et formulaire de contact sécurisé.",
    seoDescription:
      "Site vitrine administrable pour Persistance Studio : portfolio, prestations, témoignages et publication d’articles avec un CMS.",
    tags: [
      { icon: "window-paintbrush", label: "Identité forte" },
      { icon: "window-layout", label: "CMS" },
      { icon: "globe", label: "SEO technique" },
    ],
    stack: [
      "Astro 6",
      "TypeScript",
      "Tailwind CSS 4",
      "Sanity",
      "React",
      "Cloudflare",
      "Embla Carousel",
    ],
    media: {
      type: "video",
      poster: persistanceHomePoster,
      src: "/persistance/persistance-home.mp4",
    },
    caseStudy: {
      overview:
        "Conception et développement du site vitrine de Persistance, une activité d'accompagnement graphique portée par Cédrine Marmasse.",
      need: "Présenter clairement l'univers, la méthode et les offres, valoriser les réalisations, publier des articles et rendre la cliente autonome sur les contenus via un CMS.",
      solution:
        "Architecture Astro légère avec Sanity pour administrer projets, articles, clients et témoignages, pages prestations structurées, SEO technique et formulaire sécurisé avec validation et Turnstile.",
    },
  },
  {
    id: "le-fellic",
    title: "SARL LE FELLIC",
    href: "https://lefellic.fr/",
    brand: {
      logo: {
        alt: "Logo SARL LE FELLIC",
        className: "scale-[1.42]",
        src: "/projects/le-fellic/logo.png",
      },
    },
    summary:
      "Site vitrine one-page pour une entreprise de maîtrise d'oeuvre à Rennes, pensé pour clarifier l'offre, rassurer une cible B2B et faciliter la prise de contact via un formulaire sécurisé.",
    seoDescription:
      "Site vitrine pour Le Fellic, entreprise de maîtrise d’œuvre à Rennes : offre claire, preuves B2B et formulaire de contact sécurisé.",
    tags: [
      { icon: "window-layout", label: "One-page" },
      { icon: "globe", label: "B2B local" },
      { icon: "window-pointer", label: "Contact clair" },
    ],
    stack: [
      "Astro 6",
      "TypeScript",
      "Tailwind CSS 4",
      "Cloudflare Workers",
      "Turnstile",
      "React Email",
      "MapLibre GL",
    ],
    media: {
      type: "video",
      poster: leFellicHomePoster,
      src: "/lefellic/lefellic-home.mp4",
    },
    caseStudy: {
      overview:
        "Site vitrine one-page conçu et développé pour SARL LE FELLIC - Maîtrise & Solutions, entreprise de maîtrise d'oeuvre d'exécution, OPC et suivi de chantier basée à Rennes.",
      need: "Créer une présence web claire pour une société récente, sans donner l'impression d'une jeune expérience, en valorisant le parcours de Quentin LE FELLIC, son expertise terrain et sa zone d'intervention.",
      solution:
        "Une page unique orientée conversion avec hero métier, parcours, projets témoins, carte d'intervention, SEO local et formulaire sécurisé via Astro, Cloudflare Workers, Turnstile, rate limiting et notification email.",
    },
  },
  {
    id: "motivai",
    title: "Motivai",
    href: "https://www.motivai.fr/",
    brand: {
      logo: {
        alt: "Logo Motivai",
        className: "scale-[1.18]",
        src: "/projects/motivai/logo.svg",
      },
    },
    status: "Projet personnel",
    summary:
      "SaaS de génération de lettres de motivation par IA, développé en solo avec une architecture produit complète, authentification, base de données et intégration multi-modèles.",
    seoDescription:
      "Découvrez Motivai, un SaaS développé en solo pour générer des lettres de motivation avec l’IA, du prototype à un produit complet.",
    tags: [
      { icon: "sparkle", label: "Produit IA" },
      { icon: "window-pointer", label: "SaaS" },
      { icon: "window-layout", label: "Interface complète" },
    ],
    stack: [
      "Next.js",
      "Drizzle ORM",
      "Better Auth",
      "Vercel AI SDK",
      "TypeScript",
      "Vercel",
    ],
    media: {
      type: "video",
      poster: motivaiLandingPoster,
      src: "/motivai/motivai-landing.mp4",
    },
    gallery: [
      {
        src: motivaiLandingHero,
        alt: "Interface de génération de lettre de motivation dans Motivai",
      },
      {
        src: motivaiLandingPreset,
        alt: "Sélection du mode de génération dans Motivai",
      },
    ],
    caseStudy: {
      overview:
        "Projet personnel : SaaS de génération de lettres de motivation par IA développé en solo depuis 2024.",
      need: "Construire un produit complet avec onboarding, génération IA, gestion utilisateur, environnements multiples et déploiements versionnés.",
      solution:
        "Architecture Next.js avec Drizzle ORM, Better Auth et Vercel AI SDK pour permettre aux utilisateurs de choisir leur modèle d'IA.",
    },
  },
];

export const getProjectById = (id: string) =>
  projects.find((project) => project.id === id);
