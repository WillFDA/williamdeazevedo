---
title: "Tester l’accessibilité d’un site web : un premier contrôle concret"
seoTitle: "Tester l’accessibilité d’un site web"
description: "Clavier, formulaires, contrastes, zoom : repérez les obstacles de votre site et distinguez un contrôle rapide d’un véritable audit d’accessibilité."
pubDate: 2026-09-28
updatedDate: 2026-11-12
author: "William De Azevedo"
draft: false
tags: ["accessibilité", "site vitrine"]
image:
  src: "/articles/tester-accessibilite-site-web/cover.webp"
  alt: "Quatre cartes résument les contrôles du guide : clavier (touches Tab et Maj), formulaires (message d’erreur sous un champ e-mail), contrastes (ratio de 6,15:1 réussi) et zoom à 200 %."
---

Un site peut sembler simple à utiliser avec une souris et devenir impraticable au clavier. Un formulaire peut fonctionner visuellement sans annoncer correctement ses champs à un lecteur d’écran. Tester l’accessibilité consiste à chercher ces obstacles, pas seulement à obtenir un bon score.

Ce guide propose un premier contrôle pour un site vitrine. Il permet de préparer des corrections concrètes, mais ne remplace ni un audit complet ni des tests avec des personnes en situation de handicap. Les repères techniques cités proviennent des WCAG du W3C ; ils ne constituent pas une conclusion sur les obligations juridiques de votre entreprise.

## Définir ce que vous allez tester

Ne vous limitez pas à la page d’accueil. Choisissez une page de prestation, une page contenant plusieurs images et le parcours de contact. Ajoutez les composants partagés : menu, fenêtre de consentement, pied de page, prise de rendez-vous externe si elle fait partie du parcours.

Pour chaque test, notez l’adresse, le navigateur, la taille d’affichage et l’état de l’interface. Un menu fermé et le même menu ouvert ne constituent pas le même cas de test. Prévoyez une colonne « résultat attendu » et une colonne « obstacle observé ».

Une observation exploitable ressemble à ceci : « Sur la page de contact, après ouverture du calendrier, impossible de rejoindre le bouton de fermeture au clavier. » C’est plus utile à corriger que « le calendrier n’est pas accessible ».

## Faire le parcours sans souris

Placez la souris de côté. Utilisez Tab pour avancer entre les éléments interactifs et Maj + Tab pour revenir. Entrée active généralement les liens et les boutons ; Espace sert notamment aux boutons et aux cases à cocher. Certains composants utilisent aussi les flèches.

Vérifiez successivement :

- la possibilité d’atteindre le menu et ses liens ;
- la présence d’un repère visible indiquant l’élément sélectionné ;
- un ordre de déplacement cohérent avec le contenu ;
- l’ouverture, l’utilisation et la fermeture des fenêtres ;
- l’absence d’endroit dont vous ne pouvez plus sortir au clavier.

Le texte ordinaire n’a pas à recevoir le focus à chaque paragraphe. Ce test porte notamment sur les commandes, les liens et les champs, pas sur la transformation de toute la page en étapes de tabulation.

Le W3C rappelle dans sa présentation de la [compatibilité avec le clavier](https://www.w3.org/WAI/perspective-videos/keyboard/fr) que les fonctionnalités ne doivent pas nécessiter une souris. Les éléments HTML natifs offrent une base utile, mais un composant personnalisé doit être vérifié dans son fonctionnement réel.

## Comprendre et remplir les formulaires

Chaque champ doit avoir un intitulé compréhensible. « E-mail pour recevoir la réponse » renseigne mieux qu’un simple exemple d’adresse affiché à l’intérieur du champ. Le texte indicatif, ou placeholder, disparaît pendant la saisie : ce n’est pas une bonne manière de remplacer un libellé visible.

Le [tutoriel du W3C sur les libellés](https://www.w3.org/WAI/tutorials/forms/labels/) explique comment associer l’intitulé et son champ dans le code. Un libellé visuellement placé à côté ne suffit pas à prouver cette association. Un outil d’inspection ou un test avec lecteur d’écran permet de la contrôler.

Essayez ensuite une saisie incomplète ou un format incorrect. Le message doit expliquer le problème et permettre de retrouver le champ concerné. Une bordure rouge seule ne suffit pas à informer tout le monde. Vérifiez aussi que les données déjà saisies ne disparaissent pas sans nécessité.

Pour tester l’envoi, utilisez des informations de test et prévenez le destinataire. La confirmation doit être compréhensible et accessible, pas uniquement apparaître brièvement dans un coin de l’écran.

## Mesurer les contrastes au lieu de les deviner

Un gris peut paraître lisible sur votre écran et rester insuffisant, même s’il vient de votre charte graphique : voyez comment [adapter une charte graphique au web](/articles/charte-graphique-entreprise/). Utilisez un vérificateur de contraste avec les couleurs effectives du texte et de son fond. Pour du texte sur une photographie ou un dégradé, examinez les zones réellement placées derrière les lettres.

Le [critère WCAG 2.2 1.4.3, niveau AA](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), demande notamment :

| Élément                                                | Contraste minimal |
| ------------------------------------------------------ | ----------------- |
| Texte courant                                          | 4,5:1             |
| Grand texte : au moins 18 points, ou 14 points en gras | 3:1               |

Le critère comporte des exceptions, notamment pour les logos et certains textes accessoires. Ne les étendez pas aux paragraphes ou aux mentions utiles sous prétexte qu’ils sont secondaires.

Le [critère 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) prévoit aussi un contraste d’au moins 3:1 pour les informations visuelles nécessaires à l’identification des composants, de leurs états et de certains éléments graphiques, avec ses propres exceptions. Cela ne signifie pas que chaque bouton doit obligatoirement avoir une bordure.

Vérifiez les liens, les messages d’erreur et les états de focus, pas seulement les grands titres. Ne faites pas reposer une information uniquement sur une couleur : ajoutez un texte, une forme ou un autre indice pertinent.

## Agrandir et regarder ce qui disparaît

Augmentez le zoom du navigateur jusqu’à 200 %. Les textes doivent rester lisibles et les fonctions utilisables, sans boutons tronqués ni contenu superposé. Le [critère 1.4.4 sur le redimensionnement du texte](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) prévoit cet agrandissement sans perte de contenu ou de fonctionnalité, avec les exceptions définies par le critère.

Testez aussi la redistribution du contenu dans une zone étroite. Le [critère 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) prend comme référence une largeur de 320 pixels CSS pour les contenus à défilement vertical. Le W3C donne notamment l’équivalence avec une fenêtre initiale de 1 280 pixels CSS à 400 % de zoom.

Le contenu courant doit pouvoir se lire sans aller continuellement de gauche à droite. Certains éléments nécessitant une disposition en deux dimensions, comme des cartes ou des tableaux de données, bénéficient d’exceptions. Examinez aussi les bandeaux fixes : ils peuvent occuper presque tout l’écran après agrandissement.

## Compléter avec un outil automatique et un lecteur d’écran

WAVE, axe ou Lighthouse peuvent signaler des problèmes de structure, de noms accessibles ou de contraste. Lancez l’analyse sur plusieurs pages et dans les états importants, puis examinez chaque résultat.

Un outil peut détecter l’absence d’une alternative d’image. Il ne peut pas toujours décider si « photo » décrit utilement une réalisation ou si l’image est purement décorative. De même, l’absence d’erreurs détectées ne prouve pas que le parcours est utilisable.

La [documentation MDN sur les outils d’accessibilité](https://developer.mozilla.org/fr/docs/Learn_web_development/Core/Accessibility/Tooling) recommande de combiner outils, vérifications manuelles et tests utilisateurs. Un essai avec NVDA ou VoiceOver permet d’examiner les titres, les liens et l’annonce des champs, à condition d’apprendre les commandes du lecteur. Une première prise en main ne vaut pas l’expérience d’utilisateurs réguliers.

## Transformer les observations en corrections

Traitez d’abord les obstacles empêchant une action : menu inaccessible, impossibilité de fermer une fenêtre, formulaire incompréhensible. Corrigez ensuite les problèmes de lecture et de repérage, puis retestez le parcours complet. Une correction locale peut affecter un composant présent ailleurs.

Conservez ce relevé et recommencez après les modifications importantes. N’annoncez pas une conformité générale sur la seule base de ce contrôle : une évaluation formelle nécessite un périmètre, une méthode et des compétences adaptés. Les obligations applicables en France dépendent notamment de l’organisme et du service concerné ; elles doivent être examinées séparément. Le [champ d’application présenté sur le site officiel du RGAA](https://accessibilite.numerique.gouv.fr/obligations/champ-application/) constitue un point de départ pour l’article 47 de la loi de 2005, pas une réponse exhaustive à toutes les réglementations sectorielles.

Si ces obstacles s’accumulent dans votre site actuel, préparez votre [projet de refonte](/refonte-site-internet/) avec les adresses et les étapes qui posent problème. Cette liste permettra de distinguer les corrections ciblées d’une reconstruction réellement nécessaire.

## Questions fréquentes

### L’accessibilité d’un site web est-elle obligatoire pour une entreprise ?

Cela dépend de l’entreprise et de ce que fait le site. Depuis le 28 juin 2025, certains services doivent être accessibles, dont le commerce électronique, la banque et le transport. Les prestataires de services de moins de 10 salariés, avec un chiffre d’affaires ou un bilan inférieur à 2 millions d’euros, en sont dispensés. Un site vitrine sans vente en ligne ne figure pas dans cette liste. La loi de 2005 vise, elle, les organismes publics et les entreprises à partir de 250 millions d’euros de chiffre d’affaires.

### Quelle différence entre le RGAA et les WCAG ?

Les WCAG sont les règles internationales d’accessibilité publiées par le W3C. Le RGAA est la méthode française qui permet de vérifier qu’une page les respecte : 106 critères de contrôle, avec des tests détaillés, pour les 50 critères de succès des niveaux A et AA des WCAG 2.1 retenus par la norme européenne. Les WCAG disent quoi atteindre, le RGAA précise comment le contrôler. Une version 5 du RGAA est en cours de rédaction, annoncée pour fin 2026.

### Combien coûte un audit d’accessibilité RGAA ?

Un audit de conformité RGAA coûte en général entre 2 000 et 5 000 € HT pour un site vitrine (relevé en novembre 2026). Le prix dépend du nombre de pages à tester, des composants, comme les menus, les formulaires ou les carrousels, et des parcours à suivre de bout en bout, comme une prise de rendez-vous. Un site avec espace client ou une application mobile coûte davantage. L’audit mesure le niveau d’accessibilité : les corrections se chiffrent à part.

### Existe-t-il un test d’accessibilité gratuit en ligne ?

Oui. [PageSpeed Insights](https://pagespeed.web.dev/), l’outil gratuit de Google, affiche un score « Accessibilité » calculé par Lighthouse : il suffit de saisir l’adresse d’une page. [WAVE](https://wave.webaim.org/), de l’organisme WebAIM, analyse aussi une page à partir de son adresse. Ces tests repèrent des erreurs techniques, comme un bouton ou un lien sans intitulé. Mais les vérifications manuelles ne comptent pas dans le score de Lighthouse : un bon score ne prouve pas que le site est utilisable.

## Sources

- [DGCCRF : la directive européenne « Accessibilité »](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/la-nouvelle-directive-europeenne-accessibilite-pour-des-produits-et-des-services-accessibles-aux-personnes-en-situation) : produits et services concernés depuis le 28 juin 2025, exemption des entreprises de moins de 10 salariés et 2 millions d’euros.
- [Service Public : directive « Accessibilité », demander une exemption en ligne](https://entreprendre.service-public.gouv.fr/actualites/A18669) (publié le 27 novembre 2025) : services concernés et cas d’exemption.
- [RGAA : rappel du champ d’application](https://accessibilite.numerique.gouv.fr/obligations/champ-application/) : organismes visés par l’article 47 de la loi de 2005, dont les entreprises à partir de 250 millions d’euros de chiffre d’affaires.
- [RGAA : introduction à la méthode technique](https://accessibilite.numerique.gouv.fr/methode/introduction/) : 106 critères, correspondance avec les WCAG 2.1 niveaux A et AA, RGAA 5 en préparation.
- [Chrome for Developers : score d’accessibilité Lighthouse](https://developer.chrome.com/docs/lighthouse/accessibility/scoring?hl=fr) : calcul du score, audits manuels exclus.
- [Google : à propos de PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about?hl=fr) : catégorie Accessibilité analysée avec Lighthouse.
- [WebAIM : WAVE](https://wave.webaim.org/) : test en ligne à partir de l’adresse d’une page, en anglais.
- Repères de prix (relevés le 12/11/2026) : [DesignGouv, prestations accessibilité numérique](https://design.numerique.gouv.fr/accessibilite-numerique/prestations-accessibilite-numerique/) (page de l’État, non datée : audit RGAA entre 2 000 et 5 000 € HT), [Allyos, audit RGAA](https://allyos.fr/audit-accessibilite-numerique) (octobre 2026 : dès 3 500 € HT pour un site de contenu, dès 6 000 € HT avec espace connecté), [WebGazelle, audit RGAA](https://www.webgazelle.net/audit-rgaa.php) (2025 : 1 990 € HT), [RGAA Audit, test de l’accessibilité RGAA](https://www.rgaa-audit.com/test-accessibilite-rgaa-site-web) (2025 : dès 1 300 € HT), [RGAA Checker, prix d’un audit RGAA](https://rgaa-checker.com/prix-audit-rgaa) (tarifs 2026 : 1 500 à 5 000 € pour un freelance).
