# Recherche éditoriale : brief, exemples et contenus artisans

Consultation et reprise : 16 septembre 2026. Périmètre : les trois articles `cahier-des-charges-site-internet`, `exemples-sites-vitrines` et `site-internet-artisan-contenus`.

## Méthode et récupération de la recherche interrompue

Le journal `/home/agent/.hermes/cache/delegation/live/deleg_05b001ea/task-1.log` confirme les premières recherches des trois sujets, une extraction groupée France Num, la lecture HubSpot, les lectures CNIL, Google et deux inspections des captures. Il confirme également l'écriture des deux premiers articles. Ses résultats sont abrégés : toutes les URL du lot initial ne peuvent pas être reconstituées. Les textes existants ont été préservés ; les sources identifiables ont été relues et les lectures manquantes complétées, plutôt que de prétendre avoir récupéré leur intégralité.

Les pages ci-dessous ont été effectivement consultées par extraction, pas seulement repérées dans les résultats de recherche. Certaines extractions comportaient des coupures : Websual a été relu en HTML complet et le passage Google sur les pages satellites vérifié directement dans le HTML. Les tentatives HTTP directes supplémentaires sur HubSpot et le formulaire CNIL ont renvoyé 403 ; leurs extractions accessibles et le journal antérieur ont été conservés comme base, sans prétendre à un audit exhaustif de ces sites.

Les contenus comparables servent à identifier des questions et des angles. Ils ne prouvent pas leurs propres promesses commerciales. Les faits sur les projets proviennent du dépôt ; les précautions RGPD, légales et SEO renvoient aux organismes concernés. Aucun volume de recherche, taux de conversion, résultat client ou souvenir personnel n'a été inventé.

## 1. Cahier des charges de site internet

### Articles français lus

1. [France Num — Bâtir le cahier des charges du site internet de son entreprise : les 10 points clés](https://www.francenum.gouv.fr/guides-et-conseils/developpement-commercial/site-web/batir-le-cahier-des-charges-du-site-internet).
   - Apports : hiérarchiser les objectifs, définir les publics, séparer les fonctionnalités indispensables des options, expliquer le parcours et le calendrier.
   - Limite : guide large qui couvre aussi des projets complexes. Ses délais indicatifs ne deviennent pas des engagements de William. Article signé par une professionnelle sur le portail public, pas une norme obligatoire.
2. [France Num — Modèles de cahiers des charges pour un site internet d'entreprise](https://www.francenum.gouv.fr/guides-et-conseils/developpement-commercial/site-web/modeles-de-cahiers-des-charges-pour-un-site).
   - Apports : contexte, structure, fonctionnalités, outils tiers, livrables, budget ; intérêt d'un document commun pour obtenir des propositions comparables.
   - Limite : sélection de trames ; aucun modèle lié n'est présenté comme téléchargé ou intégralement audité. Les deux lectures sont deux articles distincts du même éditeur.

### Source primaire complémentaire

[CNIL — Exemples de mentions d'information](https://www.cnil.fr/fr/rgpd-exemples-de-mentions-dinformation) : la CNIL précise qu'il s'agit d'illustrations à adapter ou compléter, et non de modèles valables dans toutes les hypothèses. Soutient le paragraphe sur la collecte de données et la recette des formulaires.

### Différenciation retenue

Un brief directement copiable pour une TPE, avec champs « à définir ensemble », exclusions, responsabilité des contenus, coûts initiaux/récurrents et tests observables avant livraison. Pas de catalogue technique ni de modèle contractuel présenté comme universel. Le corps existant est conservé. Corrections limitées au tag `tpe` en minuscules et à l'alternative de couverture exacte du manifeste.

## 2. Exemples de sites vitrines

### Articles français lus

1. [Wix — Site vitrine : exemples inspirants pour créer le vôtre](https://fr.wix.com/blog/exemples-sites-vitrines).
   - Apports : observer les exemples par secteur, lisibilité de la navigation, identité, photographies et chemins vers le contact.
   - Limite : contenu commercial de Wix mêlant grandes marques et petites activités, parfois avec e-commerce. Ses affirmations de conversion ne sont pas reprises comme résultats démontrés.
2. [HubSpot — Exemples de sites vitrine](https://blog.hubspot.fr/website/site-vitrine).
   - Apports : rôle de présentation, informations pratiques, portfolio et contact ; distinction entre présenter une activité et effectuer une transaction.
   - Limite : promotion du CMS/CRM HubSpot. Les prix, gains de visibilité et performances évoqués ne servent pas de références factuelles pour notre analyse. Le titre retourné par extraction mentionne 2025 alors que certains résultats de recherche mentionnent 2026 ; aucun millésime n'est imposé dans notre lien public.

### Sources primaires dans le dépôt

- `src/data/projects.ts` : LE FELLIC, site one-page de maîtrise d'œuvre à Rennes ; Persistance, site vitrine éditorial administrable via Sanity ; Motivai, application SaaS avec authentification et base de données.
- `src/content/realisations/le-fellic.mdx` : contexte, parcours, projets témoins, zone d'intervention, formulaire sécurisé ; attribution explicite du logo et de l'identité à Persistance Studio.
- `src/content/realisations/persistance.mdx` : offres, projets, articles, témoignages, formulaire et administration des contenus.
- `src/assets/projects/lefellic-home.webp` et `src/assets/projects/persistance-home.webp` : captures du portfolio inspectées visuellement. Les titres, boutons, navigation et photographies décrits concordent avec les fichiers. Elles ne prouvent ni une performance technique, ni une accessibilité complète, ni un gain commercial.

### Vérification et provenance des captures publiques

Les chemins Markdown existaient mais les fichiers publics manquaient à la reprise. Copies strictement identiques des captures du dépôt ajoutées sous `public/articles/exemples-sites-vitrines/` :

| Fichier | SHA-256 identique source/copie |
| --- | --- |
| `lefellic-home.webp` | `40853873845b31dcd0af4b81444a8ac9f9eaf30beaba8cde29860059c7cc3e1b` |
| `persistance-home.webp` | `b7e2900bcd186bc21bc880aab3e56dec3b8953b215b2e33b36b0132dd400ca74` |

Il s'agit de captures existantes, pas d'une nouvelle observation des sites externes au jour de publication. La couverture est une illustration pédagogique schématique distincte des deux captures ; son alternative reprend exactement le manifeste.

### Différenciation retenue

Deux projets réels commentés en profondeur, au lieu d'un palmarès de marques. Séparation explicite entre observation visuelle et périmètre documenté. Analyse du choix one-page/site éditorial, contraintes de mise à jour et limites de transposition. Motivai est cité pour expliquer pourquoi une application ne se compare pas à un site vitrine. Aucun résultat chiffré ni retour d'expérience ajouté. Corps existant préservé.

## 3. Site d'artisan : pages et contenus

### Articles français lus

1. [Agence Impulsion — Créer un site web pour artisan : guide complet](https://impulsion-agence.com/creation-site-web-artisan-guide-complet/).
   - Apports : prestations compréhensibles, photos réelles de chantiers, avis et contact, consultation mobile.
   - Limite : approche commerciale, nombre de pages présenté comme indispensable, promesses d'appels, statistiques et prix sans preuves adaptées à notre article. Ces affirmations ne sont pas reprises.
2. [Websual — Site vitrine artisan ou TPE : les 5 pages qui suffisent](https://websual.fr/blog/site-vitrine-artisan-tpe-5-pages).
   - Apports : rôle précis de chaque rubrique, démarrage honnête sans références inventées, coordonnées et informations légales, extensions progressives.
   - Limite : ni cinq pages ni une fréquence mensuelle de blog ne sont des obligations universelles. Notre guide n'adopte pas ces prescriptions ni les formules chiffrées de rapidité de conversion.

### Sources primaires lues

- [Google Search Central — Règles concernant le spam, pages satellites](https://developers.google.com/search/docs/essentials/spam-policies?hl=fr#doorway-abuse) : vise les pages conçues pour des recherches similaires qui canalisent vers une destination et apportent peu d'utilité. Le passage sur les villes a été lu directement dans le HTML après une extraction trop courte. Notre texte n'affirme pas que toute page locale est interdite ou que toute duplication provoque une sanction automatique.
- [CNIL — Exemples de mentions d'information](https://www.cnil.fr/fr/rgpd-exemples-de-mentions-dinformation) et [exemples de formulaires](https://www.cnil.fr/fr/exemples-de-formulaire-de-collecte-de-donnees-caractere-personnel) : information des personnes, mentions adaptées au traitement ; pas de modèle RGPD universel ni de case de consentement prescrite pour tout formulaire.
- [Service Public Entreprendre — Mentions obligatoires d'un site d'entrepreneur individuel](https://entreprendre.service-public.fr/vosdroits/F31228) : obligation de mentions facilement accessibles sur un site professionnel. La page concerne les entrepreneurs individuels ; l'article ne généralise pas sa liste détaillée à toutes les formes juridiques. Aucun avis juridique complet n'est prétendu.
- `src/data/services.ts`, entrée `creation-site-internet-artisan`, et `src/pages/creation-site-internet-artisan.astro` : lecture de la landing existante pour distinguer les intentions.

### Différenciation retenue

Guide de préparation éditoriale utilisable avant une prestation : tableau rubrique/question/matière, questions pour rédiger les prestations, trame de légende de chantier, exclusions, confidentialité des images, distinction entre parcours salarié et références de l'entreprise, règles de déplacement, formulaire proportionné et dossier de contenus à fournir. Les gabarits sont explicitement à remplir ; aucun exemple n'est présenté comme un client réel.

La landing explique l'accompagnement de William ; l'article aide le lecteur à préparer ses informations sans vendre une offre, citer un tarif ni promettre des demandes. Un lien contextualisé renvoie à la landing. Pas de pages locales en série, pas de blog obligatoire, pas de nombre de pages imposé.

## Contrôles locaux et réserves

- Date `2026-09-16`, auteur `William De Azevedo`, `draft: false`, trois tags maximum, minuscules hors SEO/IA.
- Alternatives et chemins de couverture comparés au manifeste ; couvertures existantes vérifiées.
- Comptage initial du corps Markdown par tokens non vides : brief 1 240, exemples 1 315, artisan 1 169. Ce comptage inclut les marqueurs/tableaux/URL Markdown ; l'article artisan respecte la cible de 850–1 300 mots, et les deux articles déjà rédigés restent préservés.
- Deux captures authentiques copiées et vérifiées par empreintes. Aucun autre projet, fichier d'article, configuration ou travail d'un autre agent modifié.
- Les conseils d'architecture et de rédaction sont des recommandations, pas des garanties de référencement ou de rentabilité. La validation métier finale de William reste souhaitable avant publication sous son nom.
