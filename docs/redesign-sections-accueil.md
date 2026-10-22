# Refonte du bas de l'accueil : avis, tarifs, FAQ, contact

Branche `redesign/galadrim-sections`. Analyse de galadrim.fr (accueil, `/contact`, `/creation-de-site-web`, `/offres/...`, `/references`, `/methode`) faite le 22 octobre 2026 en 1280 px et 390 px, puis traduction dans l'identité du site (Geist, bleu `#3e60d4`, coffee `#222a37`, coins arrondis).

## Ce qui fait la qualité de Galadrim

- **Deux voix typographiques.** Une linéale (Jost) pour titres et textes, une mono (Fira Mono, 12 px, capitales) réservée aux libellés de section, tags, dates, auteurs, étapes (« ÉTAPE 01 », « 01/06 »). La mono signale « métadonnée » et n'est jamais utilisée pour du texte courant.
- **Hiérarchie stricte et répétée.** Chaque bloc suit le même ordre : libellé mono → titre (40 px, interlignage 1, approche -0,02 em) → texte gris clair. En desktop, titre à gauche et texte d'introduction dans la colonne de droite.
- **Rythme vertical constant.** `--block-vertical-spacing: 100px` en haut et en bas de chaque section, soit ~200 px entre deux contenus ; 50 px en mobile. 40 px entre un titre et son contenu, 10 px entre titre et sous-titre.
- **Une grille visible.** Colonne de 1 208 px bornée par des filets pointillés, séparateurs pointillés entre les éléments de liste. Les listes priment sur les cartes : peu d'ombres, peu de couleurs, surfaces planes.
- **Avis.** Grande citation courte, puis un filet, puis la personne (nom, poste, entreprise) en petit, photo dans son cadrage naturel (pas de rond).
- **FAQ.** Titre à gauche, questions à droite séparées par des filets, la première réponse ouverte, bouton carré `+` / `×`.
- **Contact.** Bloc en deux colonnes : promesse et réassurance à gauche, action à droite, libellés de champ en mono.
- Pas de prix publics : rien à reprendre côté tarifs, sinon la sobriété.

## Traduction pour williamdeazevedo.fr

- `Geist Mono` (`@fontsource-variable/geist-mono`) branché sur `--font-mono` : libellés de section, numéros, prix, nom / entreprise / projet des avis.
- Tokens Tailwind v4 dans `src/styles/global.css` :
  - `--spacing-section` : 112 px (390 px) → 192 px (1 280 px), fluide entre les deux (`gap-section`, `pt-section`…) ;
  - `--spacing-section-content` : 40 → 64 px entre en-tête et contenu ;
  - `.section-shell` : colonne commune (992 px de contenu max, alignée sur les visuels du carrousel de réalisations) pour aligner les bords des cinq sections ;
  - `.section-title` : titre éditorial aligné à gauche.
- `SectionEyebrow` (libellé mono + repère bleu) et `SectionHeader` (libellé, titre, description à droite en desktop) partagés par les cinq sections.
- Ordre du bas de page : Réalisations, Avis, Tarifs, FAQ, Contact.

## Ce qui n'est volontairement pas repris

Filets pointillés en cadre de page, crochets autour des libellés, palette crème / vert, formulaire de contact : le site garde son système de prise de rendez-vous Cal.com et ses propres couleurs.

## Garde-fous de contenu

Aucun prix, avis, client ou délai inventé : les offres et options viennent de l'ancien `PricingPreview.astro` (déplacées dans `src/data/pricing.ts`), les avis de `src/data/temoignage.ts`, les questions de l'ancienne FAQ.
