import type { Service } from "./services";

export type ServiceBentoVisual =
  | "artisan"
  | "frontend"
  | "professional"
  | "refonte"
  | "seo"
  | "vitrine";

export type ServiceBentoVariant =
  | "feature"
  | "related"
  | "relatedCompact"
  | "relatedFeature"
  | "small"
  | "support"
  | "wide";

export type ServiceBentoItem = {
  description: string;
  href: string;
  title: string;
  visual: ServiceBentoVisual;
};

export type ServiceBentoOverviewItem = ServiceBentoItem & {
  variant: Exclude<ServiceBentoVariant, "related">;
};

const serviceBentoCopy: Record<
  string,
  Pick<ServiceBentoItem, "description" | "title" | "visual">
> = {
  "creation-site-internet-artisan": {
    description:
      "Un site local qui met en avant vos prestations, vos réalisations, votre zone d'intervention et la demande de devis.",
    title: "Site internet artisan",
    visual: "artisan",
  },
  "creation-site-internet-professionnel": {
    description:
      "Une présence plus complète pour structurer vos services, vos preuves, vos pages clés et une base technique durable.",
    title: "Site internet professionnel",
    visual: "professional",
  },
  "creation-site-vitrine": {
    description:
      "Du cadrage à la mise en ligne, je construis une présence claire, rapide et crédible, avec un parcours pensé pour déclencher le contact.",
    title: "Création de site vitrine",
    visual: "vitrine",
  },
  "developpeur-web-freelance": {
    description:
      "J'intègre des maquettes, corrige les états d'interface, le responsive, l'accessibilité et la performance sans casser votre produit.",
    title: "Renfort front-end",
    visual: "frontend",
  },
  "refonte-site-internet": {
    description:
      "Je pars de l'existant : ce qui rassure, ce qui bloque, ce qui ralentit. Puis on reconstruit une expérience plus lisible et plus crédible.",
    title: "Refonte de site internet",
    visual: "refonte",
  },
};

export const createServiceBentoItem = (service: Service): ServiceBentoItem => {
  const copy = serviceBentoCopy[service.slug] ?? {
    description: service.description,
    title: service.title,
    visual: "vitrine" as const,
  };

  return {
    ...copy,
    href: service.rootPath ?? `/services/${service.slug}/`,
  };
};

export const servicesOverviewBentoItems = [
  {
    ...serviceBentoCopy["creation-site-vitrine"],
    href: "/creation-site-vitrine/",
    variant: "feature",
  },
  {
    ...serviceBentoCopy["refonte-site-internet"],
    href: "/refonte-site-internet/",
    variant: "wide",
  },
  {
    ...serviceBentoCopy["developpeur-web-freelance"],
    href: "/services/developpeur-web-freelance/",
    variant: "small",
  },
  {
    description:
      "Structure, vitesse, métadonnées, formulaires et mise en ligne : je pose une base propre pour être trouvé, compris et contacté.",
    href: "/tarifs/",
    title: "SEO & mise en ligne",
    variant: "small",
    visual: "seo",
  },
  {
    ...serviceBentoCopy["creation-site-internet-artisan"],
    href: "/creation-site-internet-artisan/",
    variant: "support",
  },
  {
    ...serviceBentoCopy["creation-site-internet-professionnel"],
    href: "/creation-site-internet-professionnel/",
    variant: "support",
  },
] satisfies [
  ServiceBentoOverviewItem,
  ServiceBentoOverviewItem,
  ServiceBentoOverviewItem,
  ServiceBentoOverviewItem,
  ServiceBentoOverviewItem,
  ServiceBentoOverviewItem,
];
