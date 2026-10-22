import { getProjectById } from "@/data/projects";

// FAQ de l'accueil : questions et réponses reprises telles quelles de
// l'ancienne FaqSection. Les entrées avec un `topic` sont affichées ouvertes
// (« L'essentiel d'abord ») ; le JSON-LD FAQPage reprend la même liste.

export type FaqItem = {
  answer: string;
  link?: {
    href: string;
    label: string;
  };
  question: string;
  /** Sujet affiché au-dessus d'une question de « L'essentiel d'abord ». */
  topic?: string;
};

const persistanceProject = getProjectById("persistance");

if (!persistanceProject) {
  throw new Error("Projet Persistance introuvable pour la FAQ.");
}

export const homeFaq: FaqItem[] = [
  {
    question: "Est-ce qu'un site à 2 000 € suffit toujours ?",
    answer:
      "Non. C'est une base pour lancer ou moderniser une présence web claire. Le budget évolue selon le nombre de pages, le contenu à produire, l'identité visuelle, les animations, le formulaire, le CMS ou les besoins SEO plus poussés.",
    topic: "Budget",
  },
  {
    question: "Combien de temps faut-il prévoir ?",
    answer:
      "Pour un site web, le délai dépend surtout du contenu, du nombre de pages et des validations. Un périmètre simple peut aller vite, tandis qu'une refonte, une identité complète ou une interface produit demandent plus de cadrage avant de produire proprement.",
    topic: "Délais",
  },
  {
    question: "Je n'ai pas encore de site, par quoi on commence ?",
    answer:
      "On commence par votre offre, vos clients et l'action que le site doit provoquer. Ensuite seulement on structure les pages, les messages, les priorités visuelles et le parcours de contact.",
    topic: "Point de départ",
  },
  {
    question: "Je n'ai pas de logo ni de charte graphique, c'est possible ?",
    answer:
      "Oui. Si le projet part de zéro, je peux intégrer Persistance, graphiste partenaire, au cadrage. Elle prend en charge l'identité visuelle : logo, palette, typographies, direction artistique et déclinaisons. De mon côté, je construis ensuite le site sur cette base pour éviter de poser une interface propre sur une identité fragile.",
    link: {
      href: persistanceProject.href,
      label: `Voir le site de ${persistanceProject.title}`,
    },
  },
  {
    question: "J'ai déjà un site, tu peux le reprendre ?",
    answer:
      "Oui. Je regarde ce qui fonctionne déjà, puis ce qui crée du doute : message flou, design daté, mobile inconfortable, lenteur, SEO technique ou parcours de contact fragile.",
  },
  {
    question: "Quelle différence avec un site généré par IA ?",
    answer:
      "L'IA peut générer vite une page présentable, mais le résultat paraît souvent générique : sections déjà vues, textes interchangeables, choix visuels sans vraie intention. Les visiteurs repèrent de plus en plus facilement ces sites \"faits par IA\", et ça peut décrédibiliser votre offre au lieu de rassurer. Je l'utilise comme un outil de recherche et de contrôle, mais les décisions de stratégie, design, contenu et intégration restent humaines.",
  },
  {
    question: "Est-ce qu'un site peut vraiment m'apporter des demandes ?",
    answer:
      "Oui, si le site ne se contente pas d'être joli. Il doit clarifier votre offre, répondre aux doutes, inspirer confiance vite et guider vers une action simple. On ne promet pas un chiffre magique : on construit une base plus mesurable, plus crédible et plus facile à améliorer.",
  },
  {
    question: "Est-ce que je pourrai modifier le contenu après ?",
    answer:
      "Oui, si c'est un besoin important, on peut prévoir un CMS ou des contenus modifiables. Sinon, on peut garder une base plus simple, rapide et maintenable pour éviter d'ajouter de la complexité inutile.",
  },
  {
    question: "Combien de temps je dois y consacrer ?",
    answer:
      "Je pilote l'exécution, mais votre expertise reste indispensable au départ : offre, cible, priorités, validations et retours. En général, quelques points bien préparés suffisent à avancer sans vous transformer en chef de projet web.",
  },
  {
    question: "Pourquoi travailler avec toi plutôt qu'une agence classique ?",
    answer:
      "Vous avez un interlocuteur unique qui relie design, front-end, performance et logique métier. Quand le projet demande une compétence complémentaire, comme une identité visuelle complète, je peux m'appuyer sur des partenaires plutôt que de bricoler en dehors de mon rôle.",
  },
  {
    question: "Tu travailles aussi sur des SaaS ou interfaces produit ?",
    answer:
      "Oui. Pour une interface produit, je cadre d'abord les écrans, les rôles, les états, les données et les intégrations. Le devis dépend surtout de cette complexité, pas seulement du nombre de pages.",
  },
];
