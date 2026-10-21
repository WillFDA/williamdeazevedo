---
title: "Refonte et SEO : les contrôles à prévoir avant de changer votre site"
description: "Inventaire des pages, redirections, indexation et suivi : une checklist de refonte SEO pour limiter les risques et préserver les accès utiles à votre site."
pubDate: 2026-09-16
author: "William De Azevedo"
draft: true
tags: ["refonte", "SEO"]
image:
  src: "/articles/refonte-seo/cover.webp"
  alt: ""
---

Une refonte peut modifier les adresses, les contenus et les liens qui permettent à Google de comprendre votre site. Pour limiter les risques SEO, il faut inventorier l’existant, décider du devenir de chaque page et vérifier la version publiée. Une belle maquette ne montre pas qu’une ancienne adresse mène désormais à une erreur.

Aucune checklist ne garantit de conserver toutes vos positions. Google indique que des fluctuations sont possibles pendant une migration, le temps de réexplorer les pages et de mettre à jour son index. Le but est d’éviter les pertes dues à des erreurs identifiables, puis de disposer des données nécessaires pour réagir.

## 1. Définir ce qui change réellement

Une refonte graphique qui conserve les URL n’est pas une migration vers un nouveau domaine. Écrivez les changements prévus : design, textes, CMS, hébergement, arborescence ou nom de domaine. Cette liste détermine les contrôles nécessaires.

Google recommande de ne pas changer tous les éléments à la fois lorsque cela peut être évité. Si vous remplacez simultanément le domaine, le CMS et tous les contenus, une baisse sera plus difficile à analyser. Séparer certaines étapes peut simplifier le diagnostic, à condition de rester compatible avec le projet.

Pour une simple modernisation visuelle, conserver des adresses compréhensibles et fonctionnelles est souvent préférable à les renommer sans motif. Le [budget de refonte](/articles/prix-refonte-site-internet/) doit intégrer les vérifications et la migration éventuelle, pas seulement les nouvelles pages.

## 2. Constituer un état de référence

Avant les modifications, exportez les données disponibles dans Search Console : pages qui reçoivent des clics, requêtes, impressions et évolution dans le temps. Choisissez une période adaptée à la saisonnalité de votre activité. Une semaine calme ne représente pas forcément votre fréquentation habituelle.

Complétez avec les statistiques du site et les demandes réellement reçues. Une page avec peu de visites peut avoir un rôle commercial utile. À l’inverse, beaucoup de trafic ne signifie pas que les visiteurs trouvent l’offre qui leur convient.

Réunissez les URL depuis le CMS, les sitemaps et un outil d’exploration du site. Ajoutez les documents et les images qui comptent pour vos visiteurs. Si vous disposez de journaux serveur ou de données sur les liens externes, ils peuvent révéler des adresses oubliées dans le menu.

Conservez aussi les titres, les contenus et la structure des liens des pages prioritaires. Sans cet état de référence, il sera difficile de savoir si une information utile a disparu pendant la reprise.

## 3. Décider du devenir de chaque ancienne URL

Un tableau de correspondance doit indiquer une décision explicite : conserver, déplacer, fusionner ou supprimer. Voici des exemples fictifs pour un site de services.

| Ancienne adresse | Décision | Destination ou réponse attendue |
| --- | --- | --- |
| `/contact/` | Conserver | Même URL, réponse 200 |
| `/nos-travaux/` | Déplacer | 301 vers `/realisations/` |
| `/renovation-salle-eau/` | Fusionner | 301 vers une page couvrant réellement ce service |
| `/offre-terminee/` | Supprimer sans équivalent | Réponse 404 ou 410 |

La destination doit répondre au besoin de la personne qui suivait l’ancien lien. Rediriger toutes les anciennes pages vers l’accueil peut désorienter les visiteurs et être considéré par Google comme une erreur « soft 404 ».

Pour un déplacement permanent, Google recommande une redirection côté serveur, notamment 301 ou 308. Visez directement la destination finale plutôt qu’une succession de redirections. La méthode de configuration dépend de votre hébergeur ou de votre CMS : un fichier prévu pour Apache ne s’applique pas automatiquement à toutes les plateformes.

## 4. Tester la préproduction sans exposer le chantier

La version de travail doit être séparée du site public. Une protection par authentification peut empêcher l’accès aux personnes non autorisées. Une consigne `noindex` ne constitue pas une protection de confidentialité ; elle concerne l’indexation par les moteurs qui la respectent.

Préparez une liste des réglages à retirer au lancement. Le fichier `robots.txt`, les balises `noindex` et les éventuels en-têtes `X-Robots-Tag` demandent un contrôle distinct. Bloquer l’exploration ne revient pas à demander la désindexation d’une page.

Vérifiez les contenus des pages prioritaires, leurs titres et les liens vers les services. Une réduction excessive des textes peut retirer des informations recherchées par vos futurs clients. L’objectif est de mieux organiser la lecture, pas de conserver mot pour mot des passages devenus faux.

Testez également les menus au clavier, les formulaires et la lisibilité sur mobile. Ces vérifications servent d’abord aux visiteurs. Le guide pour [tester l’accessibilité](/articles/tester-accessibilite-site-web/) complète cette étape sans se substituer à un audit.

## 5. Vérifier la version réellement mise en ligne

Un test réussi en préproduction ne suffit pas : le domaine public peut appliquer d’autres règles. Désignez la personne qui vérifie la bascule et celle qui peut corriger un blocage.

Contrôlez au minimum les points suivants :

- les pages prévues comme publiques répondent correctement et restent accessibles aux robots ;
- les anciennes URL redirigées aboutissent aux bonnes pages, sans boucle ;
- les liens internes utilisent les nouvelles adresses directement ;
- les URL canoniques désignent les bonnes pages publiques, pas la préproduction ;
- le sitemap contient les URL finales prévues pour l’indexation ;
- les formulaires et les outils de mesure fonctionnent encore.

Pour les pages prioritaires, inspectez aussi le contenu réellement rendu. Une page qui répond 200 mais n’affiche qu’un message d’erreur n’est pas validée pour autant. Envoyez le nouveau sitemap dans Search Console et utilisez l’inspection d’URL pour examiner les cas problématiques. L’envoi du sitemap ne garantit pas l’indexation.

L’outil de changement d’adresse de Search Console concerne notamment un changement de domaine ou de sous-domaine. Il n’est pas nécessaire pour une simple modification des chemins d’URL sur le même domaine.

## 6. Organiser le suivi au lieu d’attendre une alerte

Après publication, examinez les erreurs d’exploration, l’indexation et les performances des pages concernées. Comparez les anciennes et nouvelles adresses lorsqu’elles ont changé. Vérifiez que la baisse observée dans un outil ne provient pas d’un suivi statistique interrompu.

Vous pouvez prévoir des contrôles rapprochés au lancement, puis des points réguliers pendant les semaines suivantes. Cette cadence est une proposition d’organisation, pas un délai promis de stabilisation dans Google. Adaptez-la au volume de pages et à l’importance du trafic organique pour votre entreprise.

Une page prioritaire inaccessible demande une correction immédiate. Une fluctuation de position sans anomalie technique nécessite davantage de contexte : saisonnalité, contenu modifié, évolution des requêtes. Évitez de revenir à l’ancienne version sur la seule base d’une journée de données.

Google recommande de conserver les redirections aussi longtemps que possible, généralement au moins un an. Pour les utilisateurs qui suivent d’anciens liens, les maintenir plus longtemps peut rester utile. Prévoyez donc leur hébergement et leur responsabilité après la fin du projet.

## Les livrables à demander

Demandez l’inventaire des pages, le tableau des redirections, le compte rendu des tests et un calendrier de suivi avec un responsable identifié. Ces documents rendent le périmètre vérifiable.

Si vous préparez une [refonte de site internet](/refonte-site-internet/), [envoyez-moi le lien du site et les changements envisagés](mailto:william.deazevedopro@gmail.com). Le premier travail sera de distinguer ce qui peut rester en place de ce qui exige une migration.

### Sources

- [Google Search Central : migrer un site avec changement d’URL](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes?hl=fr), référence technique principale.
- [BDM : checklist SEO pour une refonte](https://www.blogdumoderateur.com/refonte-site-web-checklist-seo/), lecture comparative sur l’organisation des étapes.
- [Showit : checklist de changement de site](https://learn.showit.com/en/articles/2321993-seo-checklist-moving-to-showit-or-a-new-site-design), lecture comparative sur les URL et les contenus, spécifique à cette plateforme.
