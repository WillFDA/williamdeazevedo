export type ServiceCapabilityIcon =
  | "cms"
  | "conversion"
  | "deploy"
  | "form"
  | "ia"
  | "performance"
  | "refonte"
  | "search"
  | "touch"
  | "ux"
  | "web";

export type ServiceCapabilityTone =
  | "blue"
  | "cyan"
  | "green"
  | "indigo"
  | "orange"
  | "pink"
  | "sky"
  | "slate"
  | "teal"
  | "violet";

export type ServiceCapability = {
  icon: ServiceCapabilityIcon;
  label: string;
  tone: ServiceCapabilityTone;
};

export type ServiceDiagnostic = {
  afterItems: string[];
  afterLabel?: string;
  beforeItems: string[];
  beforeLabel?: string;
  description: string;
  title: string;
};

export type ServiceTimelinePoint = {
  description: string;
  icon: ServiceCapabilityIcon;
  title: string;
  tone: ServiceCapabilityTone;
};

export type Service = {
  capabilities?: ServiceCapability[];
  description: string;
  seoDescription?: string;
  diagnostic?: ServiceDiagnostic;
  eyebrow: string;
  faq: {
    answer: string;
    question: string;
  }[];
  fit: string[];
  formats?: {
    description: string;
    title: string;
  }[];
  h1: string;
  heroPillPhrases?: string[];
  included: string[];
  intro: string;
  navLabel: string;
  rootPath?: string;
  problem: {
    items: string[];
    title: string;
  };
  proof: {
    projectId: string;
    text: string;
  };
  relatedServices: string[];
  seoTitle: string;
  serviceType: string;
  slug: string;
  steps: string[];
  title: string;
};

export const services: Service[] = [
  {
    slug: "creation-site-vitrine",
    rootPath: "/creation-site-vitrine/",
    navLabel: "Création site vitrine",
    title: "Création de site vitrine",
    seoTitle: "Création de site vitrine freelance - William De Azevedo",
    description:
      "Création de sites vitrines rapides, accessibles et pensés pour rassurer avant le premier contact. Accompagnement design, contenu, SEO technique et développement front-end.",
    seoDescription:
      "Création de site vitrine rapide et accessible, pensé pour rassurer et faciliter le contact. Parlons de votre projet.",
    eyebrow: "Site vitrine freelance",
    h1: "Création de sites vitrines qui rassurent avant le premier contact",
    heroPillPhrases: ["sites vitrines", "premier contact"],
    intro:
      "Je pars de votre offre, de vos contenus et des questions de vos prospects pour créer un site clair, rapide et crédible, pensé pour transformer une première visite en prise de contact.",
    capabilities: [
      { icon: "web", label: "Site vitrine", tone: "blue" },
      { icon: "ux", label: "Structure des pages", tone: "violet" },
      { icon: "conversion", label: "Parcours de contact", tone: "indigo" },
      { icon: "refonte", label: "Design responsive", tone: "cyan" },
      { icon: "touch", label: "Mobile & accessibilité", tone: "teal" },
      { icon: "performance", label: "Chargement rapide", tone: "green" },
      { icon: "search", label: "SEO technique", tone: "sky" },
      { icon: "deploy", label: "Mise en ligne", tone: "orange" },
    ],
    serviceType: "Création de site vitrine",
    problem: {
      title: "Un site vitrine doit éviter de créer du doute",
      items: [
        "expliquer rapidement qui vous êtes, ce que vous proposez et pour qui",
        "rassurer avec des preuves, des contenus clairs et une interface actuelle",
        "guider le visiteur vers la bonne action sans le perdre",
        "charger vite, surtout sur mobile",
        "poser une base SEO technique propre dès la conception",
      ],
    },
    diagnostic: {
      title: "Ce qu'un site vitrine doit clarifier",
      description:
        "On transforme une présence floue en parcours lisible, crédible et orienté contact.",
      beforeItems: [
        "la présence actuelle ne suffit pas à expliquer l'offre sans échange",
        "les preuves, contenus et réponses clés sont dispersés",
        "le visiteur hésite sur la prochaine action à faire",
        "l'expérience mobile ne donne pas assez confiance",
        "la performance ou la structure technique ralentit la découverte",
        "la base SEO n'est pas prête pour être indexée proprement",
      ],
      afterItems: [
        "une offre comprise rapidement, sans devoir tout réexpliquer",
        "une hiérarchie de pages et contenus pensée pour guider la lecture",
        "des preuves placées au bon moment pour rassurer",
        "un parcours de contact clair, avec formulaire ou action adaptée",
        "un design responsive cohérent avec la marque",
        "un site rapide, accessible et confortable sur mobile",
        "une base SEO technique propre dès le lancement",
        "une mise en ligne vérifiée avec mesure des conversions",
      ],
    },
    fit: [
      "vous lancez une activité ou une nouvelle offre",
      "votre présence actuelle se limite aux réseaux sociaux",
      "votre site actuel paraît amateur, daté ou incomplet",
      "vos prospects vous posent souvent les mêmes questions",
      "vous voulez un support crédible pour vendre, recruter ou démarcher",
    ],
    included: [
      "clarification de l'offre, des pages et du parcours de conversion",
      "structure des contenus et hiérarchie de l'information",
      "design responsive adapté à votre marque",
      "développement front-end propre, accessible et maintenable",
      "formulaire ou prise de contact sécurisée",
      "métadonnées, sitemap, performance et SEO technique initial",
      "mise en ligne et vérifications avant lancement",
      "Search Console, mesure des conversions (Rybbit) et point de suivi à 30 jours",
    ],
    formats: [
      {
        title: "Landing page",
        description:
          "Pour une offre unique, une campagne ou une action précise.",
      },
      {
        title: "Site one-page",
        description:
          "Pour une activité simple qui doit être comprise sans multiplier les pages.",
      },
      {
        title: "Site multipage",
        description:
          "Pour présenter plusieurs services, preuves, contenus ou publics.",
      },
      {
        title: "Site administrable",
        description:
          "Pour publier des projets, articles ou contenus réguliers après la mise en ligne.",
      },
    ],
    steps: [
      "cadrage de l'activité, des objectifs et des contenus disponibles",
      "proposition de structure et de parcours",
      "design des sections clés et des versions responsive",
      "développement, accessibilité, performance et SEO technique",
      "recette, mise en ligne et prise en main",
    ],
    proof: {
      projectId: "le-fellic",
      text: "Le Fellic illustre un site vitrine compact, pensé pour clarifier une activité B2B et faciliter la prise de contact sans alourdir le parcours.",
    },
    relatedServices: [
      "creation-site-internet-artisan",
      "creation-site-internet-professionnel",
      "refonte-site-internet",
    ],
    faq: [
      {
        question: "Combien de pages faut-il prévoir ?",
        answer:
          "Cela dépend de votre offre. Une activité simple peut tenir sur une page, tandis qu'une offre plus riche mérite souvent plusieurs pages pour mieux guider le visiteur.",
      },
      {
        question: "Pouvez-vous m'aider à structurer les contenus ?",
        answer:
          "Oui. Le cadrage sert justement à clarifier les messages, les sections utiles et l'ordre des informations avant de passer au design.",
      },
      {
        question: "Le référencement est-il compris ?",
        answer:
          "J'intègre une base SEO technique propre : titres, descriptions, structure HTML, performance, sitemap et indexation. Le contenu éditorial ou une stratégie SEO continue peuvent demander un périmètre dédié.",
      },
      {
        question: "Pourrai-je modifier le site après la livraison ?",
        answer:
          "Oui si le projet prévoit une partie administrable. Sinon, je peux aussi intervenir ponctuellement pour les évolutions.",
      },
    ],
  },
  {
    slug: "refonte-site-internet",
    rootPath: "/refonte-site-internet/",
    navLabel: "Refonte site internet",
    title: "Refonte de site internet",
    seoTitle: "Refonte de site internet freelance - William De Azevedo",
    description:
      "Refonte de site internet pour clarifier votre offre, moderniser votre interface et améliorer performance, SEO technique et conversion.",
    eyebrow: "Refonte web",
    h1: "Votre site ne reflète plus la qualité que vous proposez",
    heroPillPhrases: ["qualité"],
    intro:
      "Je vous aide à comprendre ce qui crée de l'hésitation sur votre site actuel, puis à reconstruire une expérience plus claire, plus rapide et plus crédible.",
    capabilities: [
      { icon: "search", label: "Audit existant", tone: "sky" },
      { icon: "ux", label: "Structure des pages", tone: "violet" },
      { icon: "refonte", label: "Design modernisé", tone: "cyan" },
      { icon: "touch", label: "Mobile & accessibilité", tone: "teal" },
      { icon: "performance", label: "Performance", tone: "green" },
      { icon: "deploy", label: "SEO préservé", tone: "orange" },
      { icon: "web", label: "Redirections utiles", tone: "blue" },
      { icon: "conversion", label: "Parcours de contact", tone: "indigo" },
    ],
    serviceType: "Refonte de site internet",
    problem: {
      title: "Votre site ne reflète plus la qualité que vous proposez",
      items: [
        "le design ne correspond plus à votre activité",
        "l'offre est difficile à comprendre",
        "le site est lent ou inconfortable sur mobile",
        "les visiteurs consultent mais ne prennent pas contact",
        "les contenus sont difficiles à modifier",
        "les pages se sont ajoutées sans vraie cohérence",
      ],
    },
    diagnostic: {
      title: "Ce qu'on clarifie avec la refonte",
      description:
        "On part de ce qui crée de l'hésitation, puis on remet de l'ordre dans le message, le parcours et la base technique.",
      beforeItems: [
        "le design ne correspond plus à votre activité",
        "l'offre est difficile à comprendre",
        "le site est lent ou inconfortable sur mobile",
        "les visiteurs consultent mais ne prennent pas contact",
        "les contenus sont difficiles à modifier",
        "les pages se sont ajoutées sans vraie cohérence",
      ],
      afterItems: [
        "analyse de l'existant et des pages à conserver",
        "réorganisation des contenus et des parcours",
        "modernisation visuelle et responsive",
        "développement d'une base plus rapide et maintenable",
        "préparation des redirections utiles",
        "contrôle des métadonnées, formulaires, performances et conversions",
        "mise en ligne progressive lorsque le contexte le demande",
        "Search Console, mesure des conversions et point de suivi à 30 jours",
      ],
    },
    fit: [
      "vous avez déjà un site mais il ne vous représente plus",
      "vous préparez une nouvelle offre, cible ou identité visuelle",
      "vous voulez améliorer la clarté avant d'investir dans l'acquisition",
      "vous devez préserver des contenus ou URLs déjà utiles",
      "vous hésitez entre quelques corrections et une refonte complète",
    ],
    included: [
      "analyse de l'existant et des pages à conserver",
      "réorganisation des contenus et des parcours",
      "modernisation visuelle et responsive",
      "développement d'une base plus rapide et maintenable",
      "préparation des redirections utiles",
      "contrôle des métadonnées, formulaires, performances et conversions",
      "mise en ligne progressive lorsque le contexte le demande",
      "Search Console, mesure des conversions (Rybbit) et point de suivi à 30 jours",
    ],
    formats: [
      {
        title: "Refonte visuelle",
        description:
          "Moderniser l'interface et l'expérience mobile sans tout reconstruire.",
      },
      {
        title: "Refonte structurelle",
        description:
          "Repenser les pages, les contenus et le parcours de conversion.",
      },
      {
        title: "Refonte complète",
        description:
          "Revoir la structure, le design, le développement et la base SEO technique.",
      },
    ],
    steps: [
      "audit rapide de l'existant, des contenus et des points de friction",
      "décision sur ce qui doit être conservé, amélioré ou supprimé",
      "nouvelle structure des pages et des messages",
      "design, développement et migration des contenus utiles",
      "redirections, tests et contrôle après mise en ligne",
    ],
    proof: {
      projectId: "persistance",
      text: "Persistance montre comment un site peut devenir un support éditorial plus clair, administrable et cohérent avec une identité créative.",
    },
    relatedServices: [
      "creation-site-vitrine",
      "creation-site-internet-professionnel",
      "developpeur-web-freelance",
    ],
    faq: [
      {
        question: "Vais-je perdre mon référencement ?",
        answer:
          "L'objectif est justement de limiter ce risque : inventaire des pages utiles, conservation des contenus importants, URLs cohérentes et redirections lorsque nécessaire.",
      },
      {
        question: "Faut-il forcément tout refaire ?",
        answer:
          "Non. Une refonte commence par identifier ce qui fonctionne déjà. Parfois quelques pages ou sections prioritaires suffisent.",
      },
      {
        question:
          "Pouvez-vous reprendre un site fait par un autre prestataire ?",
        answer:
          "Oui, si l'accès au projet et l'état technique permettent une reprise propre. Sinon, je vous indique clairement les limites avant de chiffrer.",
      },
      {
        question: "Le site doit-il être coupé pendant la refonte ?",
        answer:
          "Dans la plupart des cas, le nouveau site se prépare à côté de l'ancien puis remplace l'existant au moment de la mise en ligne.",
      },
    ],
  },
  {
    slug: "developpeur-web-freelance",
    navLabel: "Développeur web freelance",
    title: "Développeur web freelance",
    seoTitle: "Développeur web freelance front-end - William De Azevedo",
    description:
      "Développeur web freelance front-end pour sites vitrines, interfaces produit et intégrations rapides, accessibles et maintenables.",
    eyebrow: "Renfort front-end",
    h1: "Développeur front-end freelance pour rendre vos interfaces plus claires",
    heroPillPhrases: ["front-end freelance", "interfaces"],
    intro:
      "J'interviens comme renfort front-end autonome pour intégrer vos maquettes, améliorer vos interfaces existantes et livrer des composants propres, accessibles et maintenables.",
    capabilities: [
      { icon: "ux", label: "Intégration Figma", tone: "violet" },
      { icon: "cms", label: "Composants front-end", tone: "slate" },
      { icon: "web", label: "React / Next.js", tone: "blue" },
      { icon: "touch", label: "Responsive & mobile", tone: "teal" },
      { icon: "performance", label: "Performance", tone: "green" },
      { icon: "conversion", label: "États d'interface", tone: "indigo" },
      { icon: "ia", label: "IA utile", tone: "pink" },
      { icon: "deploy", label: "Mise en ligne", tone: "orange" },
    ],
    serviceType: "Développement front-end freelance",
    problem: {
      title:
        "Un renfort front-end doit comprendre ce que l'interface doit résoudre",
      items: [
        "intégrer une maquette sans casser l'expérience responsive",
        "penser les états d'interaction, de chargement et d'erreur",
        "livrer des composants lisibles et maintenables",
        "respecter la direction design sans sacrifier l'accessibilité",
        "collaborer simplement avec une équipe produit, design ou agence",
      ],
    },
    diagnostic: {
      title: "Ce qu'un renfort front-end peut débloquer",
      description:
        "On part d'une maquette, d'une interface ou d'un backlog pour livrer des composants plus justes et plus maintenables.",
      beforeItems: [
        "les maquettes sont prêtes mais l'intégration manque de précision",
        "le responsive casse sur certains écrans ou composants",
        "les états de chargement, d'erreur ou d'interaction sont incomplets",
        "le code front-end devient difficile à relire ou à faire évoluer",
        "les détails visuels s'éloignent de la direction design",
        "l'équipe manque ponctuellement de capacité pour avancer proprement",
      ],
      afterItems: [
        "des écrans intégrés avec soin à partir des maquettes Figma",
        "des composants responsives, lisibles et maintenables",
        "des interactions, états et transitions plus cohérents",
        "une interface plus accessible, rapide et confortable sur mobile",
        "une collaboration claire avec tickets, revues et livraisons régulières",
        "une base front-end plus simple à reprendre par l'équipe",
      ],
    },
    fit: [
      "vous avez déjà des maquettes à intégrer",
      "votre équipe manque ponctuellement de capacité front-end",
      "une interface existante doit être améliorée",
      "vous cherchez un profil autonome sur Astro, React, Next.js ou TypeScript",
      "vous voulez un regard sensible au design et au produit",
    ],
    included: [
      "intégration de maquettes Figma",
      "développement de composants et sections responsives",
      "correction de problèmes mobile, accessibilité ou performance",
      "animations sobres et utiles",
      "collaboration via GitHub, tickets, revues et points réguliers",
      "documentation légère lorsque la reprise par l'équipe le nécessite",
    ],
    steps: [
      "reprise du contexte, des maquettes et du projet existant",
      "découpage du travail en livraisons concrètes",
      "développement front-end et échanges réguliers",
      "recette responsive, accessibilité et ajustements visuels",
      "transmission, documentation et suite éventuelle",
    ],
    proof: {
      projectId: "motivai",
      text: "Motivai démontre une capacité à transformer une idée produit en interface complète, avec authentification, génération IA et parcours utilisateur.",
    },
    relatedServices: [
      "creation-site-vitrine",
      "refonte-site-internet",
      "creation-site-internet-professionnel",
    ],
    faq: [
      {
        question: "Travaillez-vous avec des équipes existantes ?",
        answer:
          "Oui. Je peux intervenir avec un designer, une équipe produit, une agence ou directement avec un fondateur selon le contexte.",
      },
      {
        question: "Pouvez-vous intégrer une maquette Figma ?",
        answer:
          "Oui, à condition que le périmètre, les états principaux et les versions responsive soient suffisamment clairs ou cadrés au démarrage.",
      },
      {
        question: "Intervenez-vous sur un projet React ou Next.js existant ?",
        answer:
          "Oui, après lecture rapide du projet pour vérifier que l'intervention peut se faire proprement.",
      },
      {
        question: "Faites-vous seulement du développement ?",
        answer:
          "Je peux intervenir uniquement en développement, mais mon intérêt est aussi d'aider à repérer les détails UX, responsive et accessibilité qui fragilisent souvent une interface.",
      },
    ],
  },
  {
    slug: "creation-site-internet-artisan",
    rootPath: "/creation-site-internet-artisan/",
    navLabel: "Site artisan",
    title: "Création de site internet artisan",
    seoTitle: "Création de site internet artisan - William De Azevedo",
    description:
      "Création de site internet pour artisan : site vitrine rapide, mobile, rassurant, avec réalisations, zone d'intervention, formulaire et base SEO locale.",
    eyebrow: "Site artisan",
    h1: "Création de site internet artisan pour inspirer confiance avant le premier appel",
    heroPillPhrases: ["artisan", "confiance"],
    intro:
      "Je vous aide à transformer votre savoir-faire, vos chantiers et votre zone d'intervention en un site clair, rapide et rassurant, pensé pour déclencher l'appel ou la demande de devis.",
    capabilities: [
      { icon: "web", label: "Site vitrine", tone: "blue" },
      { icon: "ux", label: "Savoir-faire clair", tone: "violet" },
      { icon: "refonte", label: "Réalisations valorisées", tone: "cyan" },
      { icon: "search", label: "SEO local", tone: "sky" },
      { icon: "touch", label: "Mobile & accessibilité", tone: "teal" },
      { icon: "form", label: "Demande de devis", tone: "pink" },
      { icon: "performance", label: "Chargement rapide", tone: "green" },
      { icon: "deploy", label: "Mise en ligne", tone: "orange" },
    ],
    serviceType: "Création de site internet artisan",
    problem: {
      title: "Un site d'artisan doit rassurer sans compliquer",
      items: [
        "montrer concrètement ce que vous réalisez, pas seulement lister des prestations",
        "expliquer votre zone d'intervention, vos méthodes et vos délais",
        "rassurer les prospects qui comparent plusieurs professionnels",
        "fonctionner parfaitement sur mobile, là où les demandes arrivent souvent",
        "poser une base SEO locale propre sans promettre de miracle",
      ],
    },
    diagnostic: {
      title: "Ce qu'un site artisan doit rendre évident",
      description:
        "On transforme votre métier, vos preuves et votre zone locale en parcours simple à comprendre et à contacter.",
      beforeItems: [
        "vos réalisations ne montrent pas assez la qualité de votre travail",
        "la zone d'intervention et les prestations restent floues",
        "les prospects comparent sans trouver de preuves rassurantes",
        "le contact ou la demande de devis demande trop d'effort",
        "le site fonctionne mal sur mobile ou paraît daté",
        "la base SEO locale ne donne pas assez de signaux clairs",
      ],
      afterItems: [
        "un site clair qui présente votre métier sans jargon",
        "des prestations et une zone d'intervention compréhensibles rapidement",
        "des réalisations, avis ou preuves mieux mis en valeur",
        "un parcours pensé pour déclencher l'appel ou la demande de devis",
        "une expérience mobile rapide et rassurante",
        "une base SEO locale propre dès la mise en ligne",
        "un formulaire ou appel à l'action adapté à votre activité",
        "un site prêt à évoluer avec de nouvelles réalisations",
      ],
    },
    fit: [
      "vous êtes artisan, maître d'oeuvre, indépendant ou dirigeant d'une petite structure locale",
      "vous avez besoin d'un support crédible avant un appel, un devis ou une recommandation",
      "vos réalisations existent mais ne sont pas assez bien présentées",
      "vous voulez clarifier vos services sans créer un site trop lourd",
      "vous partez de zéro et devez aussi cadrer les contenus, photos ou preuves",
    ],
    included: [
      "cadrage de l'activité, des prestations et de la zone d'intervention",
      "architecture des pages utiles : accueil, services, réalisations, contact",
      "mise en valeur des photos, références, avis ou preuves disponibles",
      "design responsive clair et professionnel",
      "formulaire de contact ou appel à l'action adapté",
      "SEO technique initial et structure locale propre",
      "mise en ligne et vérifications sur mobile",
      "Search Console, mesure des conversions (Rybbit) et point de suivi à 30 jours",
    ],
    formats: [
      {
        title: "Site one-page",
        description:
          "Pour présenter une activité locale, quelques prestations et un contact simple.",
      },
      {
        title: "Site avec réalisations",
        description:
          "Pour montrer vos chantiers, projets ou cas clients avec plus de contexte.",
      },
      {
        title: "Site administrable",
        description:
          "Pour ajouter vous-même de nouvelles réalisations, actualités ou contenus.",
      },
    ],
    steps: [
      "cadrage du métier, des prestations et des preuves disponibles",
      "structure des pages, des appels à l'action et de la zone d'intervention",
      "design responsive et mise en valeur des visuels",
      "développement, formulaire, performance et SEO technique",
      "mise en ligne, tests mobile et prise en main",
    ],
    proof: {
      projectId: "le-fellic",
      text: "Le Fellic montre comment un site compact peut clarifier une activité de maîtrise d'oeuvre, présenter le métier et faciliter la prise de contact.",
    },
    relatedServices: [
      "creation-site-vitrine",
      "refonte-site-internet",
      "creation-site-internet-professionnel",
    ],
    faq: [
      {
        question:
          "Je n'ai pas de logo ou de charte graphique, est-ce bloquant ?",
        answer:
          "Ce n'est pas bloquant pour démarrer, mais un site fonctionne mieux avec une base visuelle claire. Si vous partez de zéro, je peux vous orienter vers Persistance Studio pour cadrer logo, charte, supports ou photos avant le site.",
      },
      {
        question: "Est-ce utile si je travaille déjà par bouche-à-oreille ?",
        answer:
          "Oui, parce que vos recommandations ont souvent besoin d'un support crédible. Un site clair confirme le sérieux, explique votre méthode et facilite la demande de devis.",
      },
      {
        question: "Le SEO local est-il inclus ?",
        answer:
          "J'intègre les bases techniques : structure, titres, descriptions, performance, zone d'intervention et pages utiles. Une stratégie locale plus poussée peut ensuite être travaillée séparément.",
      },
      {
        question: "Puis-je ajouter des réalisations plus tard ?",
        answer:
          "Oui, si le périmètre prévoit un site administrable. Sinon, on peut garder une structure prête à évoluer avec des ajouts ponctuels.",
      },
    ],
  },
  {
    slug: "creation-site-internet-professionnel",
    rootPath: "/creation-site-internet-professionnel/",
    navLabel: "Site professionnel",
    title: "Création de site internet professionnel",
    seoTitle: "Création de site internet professionnel - William De Azevedo",
    description:
      "Création de site internet professionnel pour indépendants, petites structures et équipes produit : stratégie, design, développement front-end, performance, accessibilité et SEO technique.",
    seoDescription:
      "Création de site professionnel pour indépendants et petites structures : stratégie, design, développement et SEO technique. Parlons de votre projet.",
    eyebrow: "Site professionnel",
    h1: "Création de site internet professionnel pour transformer une présence en support de confiance",
    heroPillPhrases: ["site internet professionnel", "support de confiance"],
    intro:
      "Un site professionnel doit faire plus que présenter votre activité : il doit rendre votre offre lisible, crédible et facile à choisir dès les premières secondes.",
    capabilities: [
      { icon: "ux", label: "Offre clarifiée", tone: "violet" },
      { icon: "conversion", label: "Parcours de contact", tone: "indigo" },
      { icon: "refonte", label: "Design sur mesure", tone: "cyan" },
      { icon: "performance", label: "Performance", tone: "green" },
      { icon: "search", label: "SEO technique", tone: "sky" },
      { icon: "touch", label: "Mobile & accessibilité", tone: "teal" },
      { icon: "form", label: "Contact qualifié", tone: "pink" },
      { icon: "deploy", label: "Mise en ligne", tone: "orange" },
    ],
    serviceType: "Création de site internet professionnel",
    problem: {
      title: "Un site professionnel ne doit pas seulement être propre",
      items: [
        "l'offre doit être comprise rapidement par quelqu'un qui ne vous connaît pas",
        "le design doit inspirer confiance sans donner une impression générique",
        "le parcours doit guider vers le contact, le devis ou l'essai",
        "le site doit rester rapide, accessible et confortable sur mobile",
        "la base technique doit permettre d'évoluer sans repartir de zéro",
      ],
    },
    diagnostic: {
      title: "Ce qu'un site professionnel doit rendre plus clair",
      description:
        "On transforme une présence correcte en support crédible, lisible et prêt à évoluer avec votre activité.",
      beforeItems: [
        "votre offre existe mais elle demande trop d'explications avant d'être comprise",
        "le site ressemble à un modèle générique et ne reflète pas votre niveau de sérieux",
        "les visiteurs lisent quelques sections puis repartent sans savoir quoi faire",
        "les preuves, services et appels à l'action sont dispersés ou mal hiérarchisés",
        "l'expérience mobile, la vitesse ou les détails techniques créent de la friction",
      ],
      afterItems: [
        "une offre structurée autour des messages, objections et preuves essentielles",
        "une interface professionnelle, responsive et cohérente avec votre positionnement",
        "un parcours qui guide naturellement vers le contact, le devis ou le rendez-vous",
        "des pages prêtes à évoluer avec vos services, contenus ou futurs besoins SEO",
        "une base technique propre : performance, accessibilité, métadonnées et suivi",
      ],
    },
    fit: [
      "vous voulez lancer une présence web crédible",
      "vous avez besoin d'un site plus sérieux qu'un template générique",
      "votre offre demande de la pédagogie pour être comprise",
      "vous voulez relier contenu, design, développement et SEO technique",
      "vous cherchez un interlocuteur capable de cadrer puis de livrer",
    ],
    included: [
      "clarification de l'offre, des cibles et des objections principales",
      "architecture des pages et des parcours de conversion",
      "direction d'interface et design responsive",
      "développement front-end propre et maintenable",
      "performance, accessibilité, SEO technique et données structurées",
      "formulaire, prise de rendez-vous ou action de contact",
      "mise en ligne et vérifications post-lancement",
      "Search Console, mesure des conversions (Rybbit) et point de suivi à 30 jours",
    ],
    formats: [
      {
        title: "Site de lancement",
        description:
          "Pour poser une présence claire autour d'une activité, d'une offre ou d'un produit.",
      },
      {
        title: "Site de services",
        description:
          "Pour organiser plusieurs prestations, preuves, pages SEO et appels à l'action.",
      },
      {
        title: "Site administrable",
        description:
          "Pour publier des contenus, projets, articles ou pages après la livraison.",
      },
    ],
    steps: [
      "lecture de votre offre, de vos concurrents et des freins à lever",
      "structure des pages, messages clés et preuves nécessaires",
      "design des écrans prioritaires et des versions responsive",
      "développement, intégration, performance et accessibilité",
      "mise en ligne, contrôle SEO technique et ajustements finaux",
    ],
    proof: {
      projectId: "persistance",
      text: "Persistance illustre une présence plus complète : pages de prestations, portfolio, articles, témoignages et base administrable.",
    },
    relatedServices: [
      "creation-site-vitrine",
      "refonte-site-internet",
      "developpeur-web-freelance",
    ],
    faq: [
      {
        question: "Quelle différence avec un site vitrine classique ?",
        answer:
          "Le site vitrine présente. Le site professionnel doit aussi clarifier, rassurer, guider et tenir techniquement dans le temps. La différence se joue dans le cadrage et les détails.",
      },
      {
        question: "Peut-on partir d'un template ?",
        answer:
          "On peut s'en inspirer, mais je préfère éviter les sites interchangeables. Un bon site doit refléter votre offre, vos preuves et votre manière de travailler.",
      },
      {
        question: "Est-ce que vous faites le contenu ?",
        answer:
          "Je structure les messages, les sections et les formulations clés. Si le projet demande une identité éditoriale ou beaucoup de contenus, on peut cadrer un périmètre dédié.",
      },
      {
        question: "Que faire si je n'ai pas encore d'identité visuelle ?",
        answer:
          "On peut commencer par cadrer le besoin, mais si vous n'avez ni logo, ni charte, ni visuels, je recommande souvent de travailler avec Persistance Studio pour poser une base solide avant le site.",
      },
    ],
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}
