---
title: "Tester l’accessibilité d’un site web : un premier contrôle concret"
seoTitle: "Tester l’accessibilité d’un site web"
description: "Clavier, formulaires, contrastes, zoom : repérez les obstacles de votre site et distinguez un contrôle rapide d’un véritable audit d’accessibilité."
pubDate: 2026-09-28
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

Un gris peut paraître lisible sur votre écran et rester insuffisant. Utilisez un vérificateur de contraste avec les couleurs effectives du texte et de son fond. Pour du texte sur une photographie ou un dégradé, examinez les zones réellement placées derrière les lettres.

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
