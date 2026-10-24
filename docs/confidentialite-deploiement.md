# Confidentialité : déploiement sans bandeau

La PR n'ajoute aucun bandeau, panneau de préférences, cookie de consentement ni bouton « Gérer mes cookies ». Elle enrichit les mentions, garde les événements en mémoire plutôt qu'en sessionStorage, nettoie les URL des événements manuels et ne charge Cal.com qu'au moment où le visiteur appuie sur un bouton de réservation (souris, doigt, stylet, Entrée ou Espace), jamais au chargement de la page, au survol ou au focus.

## Avant fusion vers 2026

`2026` déclenche le déploiement. La PR reste en brouillon car l'exemption de consentement de la configuration Rybbit actuelle n'est pas établie. Aucun réglage de production n'est modifié par cette PR.

### Rybbit

Par défaut, le code ne charge pas Rybbit et ne transmet pas d'événements. Une fois l'exemption documentée, `PUBLIC_RYBBIT_EXEMPT_AUDIENCE=true` au build permet d'activer la mesure sans bandeau. Ce drapeau n'est ni une certification ni une preuve d'exemption ; ne pas l'activer avec la configuration actuelle sans vérification.

Avant activation :

- Justifier le périmètre limité à la mesure d'audience pour le compte exclusif de l'éditeur, les statistiques anonymes, l'absence de recoupement et de suivi entre sites.
- Examiner l'identifiant persistant créé dans localStorage par le script servi. Supprimer les stockages inutiles et documenter la durée/l'usage de tout identifiant conservé. Une rotation quotidienne du hachage IP/navigateur ne résout pas à elle seule toutes les conditions.
- Vérifier IP brutes, hébergeur, pays, contrats, conservation et purge. Compléter les mentions publiques avec les valeurs réelles et la base légale applicable.
- Limiter les captures automatiques aux besoins : examiner copies, formulaires, erreurs, clics et paramètres d'URL. Le nettoyage du code ne concerne que les événements manuels et ne remplace pas les réglages serveur.
- Garder l'enregistrement des sessions désactivé.

### Google et Cloudflare

Le nouveau code ne charge plus Zaraz manuellement et n'appelle plus `zaraz.track()`. **L'injection automatique publiée dans Cloudflare reste indépendante du dépôt.** Avant fusion, désactiver Auto-inject script et les outils GA4/Ads si l'objectif est un site sans collecte Google ni bandeau. Ne pas considérer que le retrait du code empêche les pages vues automatiques côté Cloudflare.

Search Console peut rester utilisée pour les rapports de recherche/indexation ; elle est distincte de ces outils de suivi. Les anciennes variables `PUBLIC_ZARAZ_AUDIENCE_PURPOSE` et `PUBLIC_ZARAZ_MARKETING_PURPOSE` ne sont plus utilisées.

### Données de contact et services tiers

Confirmer les durées email/rendez-vous et les garanties de transfert des prestataires. Les critères généraux sont décrits dans les mentions mais les détails opérationnels restent à compléter. Examiner les requêtes et traceurs Cal.com : un clic pour réserver n'autorise pas les traceurs facultatifs. Si nécessaires, remplacer l'intégration par un lien externe informé ou adapter son fonctionnement.

## Vérification

- `bun test tests/analytics.test.ts` et `PUBLIC_RYBBIT_EXEMPT_AUDIENCE=true bun test tests/analytics.test.ts` : aucun chargement par défaut ; chargement unique et file en mémoire lorsque l'activation est explicite ; URL sans paramètres/fragments.
- `bun run lint`, `bun run build`, `git diff --check`.
- Vérifier le build par défaut dans un navigateur : aucune interface de consentement et aucun script Rybbit/Zaraz/Cal chargé initialement par le code.
- Après réglage Cloudflare, répéter sur une prévisualisation distante : vérifier réseau, stockages et événements serveur. Les tests locaux ne prouvent pas que les réglages de production sont corrects.
- Aucun email ou rendez-vous de test réel envoyé.

## Sources

- [CNIL — Conditions de l'exemption de mesure d'audience](https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience)
- [CNIL — Cookies et autres traceurs](https://cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi)
- [Rybbit — Réglages de site](https://rybbit.com/docs/site-settings)
- [Cloudflare — Injection automatique et chargement manuel](https://developers.cloudflare.com/zaraz/advanced/load-zaraz-manually/)

L'[audit initial](audit-confidentialite-2026-09-30.md) décrit la production observée avant cette PR. Il ne conclut pas que tout usage de Rybbit impose un bandeau.

## Capture locale

![Mentions améliorées sans bandeau](screenshots/privacy/sans-bandeau.jpg)
