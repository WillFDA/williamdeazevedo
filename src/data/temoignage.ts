export type Temoignage = {
  excerpt?: string;
  id: string;
  imageAlt?: string;
  imageFile?: string;
  initials: string;
  name: string;
  projectId: string;
  /** Nature du projet livré, reprise du résumé de la réalisation. */
  projectLabel: string;
  published?: boolean;
  text: string;
};

export const temoignages: Temoignage[] = [
  {
    id: "quentin-le-fellic",
    excerpt:
      "Les échanges ont toujours été fluides et constructifs, ce qui a permis d’aboutir à un site qui correspond parfaitement à mes attentes.",
    imageAlt: "Portrait de Quentin LE FELLIC",
    imageFile: "quentin-le-fellic.webp",
    initials: "QL",
    name: "Quentin LE FELLIC",
    projectId: "le-fellic",
    projectLabel: "Site vitrine one-page",
    text: "J’ai eu beaucoup de plaisir à travailler avec William pour la création de mon site internet. Son accompagnement a été à la fois professionnel, réactif et très à l’écoute de mes besoins. Les échanges ont toujours été fluides et constructifs, ce qui a permis d’aboutir à un site qui correspond parfaitement à mes attentes. Je suis très satisfait du résultat final et je recommande vivement William pour son sérieux et la qualité de son travail.",
  },
  {
    id: "cedrine-marmasse",
    excerpt:
      "Réactif, rigoureux et à l’écoute, il a su traduire mes besoins en un site clair, professionnel et fidèle à mon activité.",
    imageAlt: "Portrait de Cédrine Marmasse",
    imageFile: "persistance-cedrine-marmasse.webp",
    initials: "CM",
    name: "Cédrine Marmasse",
    projectId: "persistance",
    projectLabel: "Site vitrine administrable",
    text: "J’ai fait appel à William pour la réalisation de mon site internet. Force de conseil et de proposition, il a su me mettre en confiance dès le début du projet. Son expertise technique, associée à une approche pédagogique, m’a permis de mieux comprendre les enjeux liés à la conception du site. Réactif, rigoureux et à l’écoute, il a su traduire mes besoins en un site clair, professionnel et fidèle à mon activité. Je suis pleinement satisfait du résultat final. Le résultat final correspond parfaitement à mes attentes et reflète fidèlement l’identité de mon activité.",
  },
];
