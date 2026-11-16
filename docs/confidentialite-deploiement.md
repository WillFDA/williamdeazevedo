# Confidentialité : consentement et mesure d'audience

Ce document décrit ce que le site charge selon le choix du visiteur, le drapeau d'exemption de Rybbit et les vérifications à faire avant et après un déploiement. Un push sur `2026` déclenche le déploiement (Cloudflare Workers Builds).

## Fonctionnement

Le bandeau (`src/components/CookieBanner.astro`) propose deux finalités : « Mesure d'audience » (Rybbit et Google Analytics) et « Publicité » (Google Ads). Le choix est enregistré sous la clé `wui-consent` du `localStorage`, pendant 6 mois. « Gérer les cookies » (pied de page et `/mentions-legales/#mesure-audience`) rouvre le bandeau.

- Google Tag Manager (`src/scripts/consent.ts`) n'est chargé qu'après un accord pour au moins une finalité (Consent Mode v2, mode basique).
- Rybbit (`src/scripts/analytics.ts`) est l'instance auto-hébergée `https://analytics.williamdeazevedo.fr/api/script.js`, site `9713c4825fc7`. Par défaut, il n'est chargé qu'après un accord pour la mesure d'audience.

`applyConsent` (`consent.ts`) applique chaque choix à GTM, puis à Rybbit via `syncAudienceMeasurement` (`analytics.ts`). `restoreConsent` fait de même au chargement de la page.

### Rybbit selon le choix

| Situation | Effet |
| --- | --- |
| Aucun choix, ou choix expiré | Rybbit n'est pas chargé (sauf en exemption, sans opposition enregistrée). Les clés `rybbit-*` sont effacées, y compris un `rybbit-visitor-id` d'une visite antérieure. |
| Accord « Mesure d'audience » | Script injecté tout de suite, sans rechargement. À son démarrage, Rybbit envoie la page vue de la page courante. Les événements du site émis pendant le chargement restent en mémoire (20 au plus), puis sont transmis. Rien de ce qui précède l'accord n'est rejoué. |
| Refus | Rien n'est chargé ni émis. La file d'attente est vidée, les clés `rybbit-*` sont effacées et `localStorage["disable-rybbit"]` vaut `"wui-consent"`. |
| Retrait après un accord | Mêmes effets que le refus, puis un rechargement complet, car Rybbit ne peut pas être déchargé d'un document. Après le rechargement, rien ne tourne : pas de second rechargement. |
| Nouvel accord explicite | `disable-rybbit` est retiré s'il vaut `"wui-consent"`, puis Rybbit est chargé. Seul un accord explicite retire cette clé. Une autre valeur, posée à la main pour ne pas compter ses propres visites par exemple, n'est jamais retirée. |
| Autre onglet | L'événement `storage` sur `wui-consent` applique le même choix. Un accord charge Rybbit, un retrait recharge l'onglet. |
| Page restaurée du cache de navigation (bfcache) | Sur `pageshow` avec `persisted`, le choix enregistré est réappliqué s'il diffère de celui de la page. |

### Un seul script, une page vue par navigation

- Un seul script par document : drapeau `window.__wuiRybbitLoaded`, sur le modèle de `__wuiGtmLoaded`. Il est sur `window` plutôt que dans le module, car une page issue d'un nouveau déploiement apporte une autre copie du module dans le même document. L'ancien garde (`script[data-wui-rybbit]` dans le `<head>`) disparaissait à chaque navigation, quand le ClientRouter remplace le `<head>`. `data-astro-transition-persist` ne suffirait pas : Astro ne garde un élément du `<head>` que si la nouvelle page contient le même, ce qui n'est jamais le cas d'un script injecté.
- Pas de page vue manuelle sur `astro:page-load`. Avec `trackSpaNavigation: true` (configuration distante de l'instance), Rybbit compte une page vue 500 ms après chaque `pushState`, `replaceState`, `popstate` ou `hashchange`.
- Le ClientRouter d'Astro appelle `history.replaceState` à chaque fin de défilement pour ranger la position (`onScrollEnd` dans `astro/dist/transitions/router.js`), et avant chaque navigation. Rybbit aurait compté une page vue à chaque défilement. Avant d'injecter Rybbit, `analytics.ts` filtre donc `replaceState` : seuls les appels qui changent de chemin atteignent les fonctions installées par-dessus (Rybbit, et GTM s'il en installe une après). Les autres vont directement à la fonction d'origine. Le filtre est installé une seule fois par document (`window.__wuiReplaceStateFiltered`), même après un échec de chargement suivi d'un nouvel accord.
  - Limite : une navigation `navigate(url, { history: "replace" })` vers le même chemin ne serait pas comptée. Le site n'en fait pas.
  - Dépendance : le filtre suppose que Rybbit remplace `history.replaceState` sur l'objet `history` (vrai pour le script servi le 16/11/2026). Une version qui toucherait `History.prototype` le contournerait sans erreur visible : refaire la vérification navigateur après une mise à jour de l'instance.
  - Effet sur GTM : une fois Rybbit chargé, un déclencheur « Historique » de GTM ou la mesure améliorée de GA4 ne voit plus les `replaceState` qui ne changent pas de chemin. Le site pousse lui-même `page_view_virtual` à chaque navigation, donc rien ne manque.
- La recherche libre de `/articles/` n'est plus écrite dans l'URL (`src/lib/articleFilters.ts`) : Rybbit envoie la chaîne de requête courante avec chaque événement (`trackUrlParams: true`), page vue ou non. Un ancien lien `?search=` applique la recherche, puis le paramètre est retiré de l'URL. Le filtre par tag reste dans l'URL.

## Drapeau d'exemption `PUBLIC_RYBBIT_EXEMPT_AUDIENCE`

La variable est lue au build : Vite remplace sa valeur dans le bundle. Seule la valeur exacte `true` active le mode exemption. Une valeur vide ou absente, `1`, `TRUE` ou ` true` laissent le mode consentement. Voir `.env.example`.

Effets du mode exemption :

- Rybbit est chargé avant tout choix. GTM reste soumis à l'accord.
- Refuser « Mesure d'audience » vaut opposition : mêmes effets qu'un refus en mode consentement, avec rechargement puisque Rybbit tournait.
- L'opposition dure : à l'expiration du choix (6 mois), `disable-rybbit` reste en place et Rybbit n'est pas rechargé. Seul un accord explicite la retire.
- Le bandeau et `/mentions-legales/` affichent les textes du mode exemption.

Le drapeau n'est ni une certification ni une preuve d'exemption. D'après l'analyse du 16/11/2026, la configuration actuelle ne remplit pas les conditions de la CNIL. Ne l'activer qu'après avoir fait et documenté les points suivants :

1. Dans Rybbit, désactiver `trackUrlParams`, `trackCopy` et `trackFormInteractions`. Pour `trackErrors`, le désactiver ou vérifier que les messages ne contiennent pas de saisie. Exclure côté serveur `search`, `utm_*`, `gclid` et `fbclid`.
2. Activer « User ID Salting » et vérifier que « Track IP Address » est désactivé.
3. Fixer la conservation des statistiques (25 mois au plus ; 13 suffisent pour comparer d'une année sur l'autre) et vérifier la purge effective.
4. Vérifier si l'instance suit d'autres sites et si le hachage IP + navigateur contient un élément propre au site.
5. Documenter l'hébergeur, le pays, les contrats (hébergeur, Cloudflare) et les journaux qui contiennent des adresses IP, avec leur durée.
6. Vérifier que l'instance n'envoie pas de télémétrie à l'éditeur de Rybbit.
7. Désactiver ou restreindre les vues individuelles (Users, Profils, Sessions, Journeys). À défaut, documenter une analyse d'anonymat.
8. Donner une durée de vie de 13 mois au plus à `rybbit-visitor-id`, ou s'en passer. Le script servi ne lui en fixe aucune.
9. Remplir la grille d'auto-évaluation CNIL (juillet 2025) pour la configuration réelle, la dater et la réexaminer chaque année.
10. Relire les textes du mode exemption (bandeau, mentions) et traiter les `TODO(William)` de `src/pages/mentions-legales.astro`.
11. Garder l'enregistrement des sessions désactivé.

Activation : définir `PUBLIC_RYBBIT_EXEMPT_AUDIENCE` à `true` dans les variables de build Cloudflare Workers Builds de la branche `2026`, puis relancer un build. Un redéploiement sans build ne suffit pas. En local, utiliser un fichier `.env` (ignoré par git).

## À compléter (informations manquantes dans les mentions)

Ces points n'étaient pas vérifiés le 16/11/2026. `/mentions-legales/` ne les affirme donc pas (le commentaire `TODO(William)` du source renvoie ici) :

- la durée de conservation des statistiques sur le serveur Rybbit ;
- l'hébergeur et le pays du serveur `analytics.williamdeazevedo.fr` ;
- l'état de « User ID Salting » et de « Track IP Address », donc ce qui est conservé de l'adresse IP ;
- la liste des captures automatiques, à mettre à jour si la configuration de Rybbit change ;
- avant l'exemption : la relecture des textes du mode exemption et une durée de vie pour `rybbit-visitor-id`.

### Minimisation recommandée, aussi en mode consentement

Le consentement ne dispense pas de la minimisation (RGPD, art. 5.1.c et 25). Dans le tableau de bord Rybbit, recommandé dès maintenant : désactiver `trackCopy`, `trackFormInteractions` et `trackErrors` (ou vérifier leurs contenus), `trackUrlParams` si les paramètres de campagne ne sont pas utiles, activer « User ID Salting » et vérifier « Track IP Address ». Ces réglages ne sont pas dans le dépôt ; une fois changés, mettre à jour la liste des données de `/mentions-legales/`.

### Limites connues

- Le clic sur « Tout refuser » ou « Enregistrer mes choix » est envoyé à Rybbit (capture automatique des clics, en phase de capture) juste avant que le refus s'applique. Le script n'a pas d'attribut pour exclure un bouton. En exemption, l'opposition elle-même est donc mesurée.

## Vérification

Avant de pousser : `bun run check:repo`, `bun run lint`, `bun run format:check`, `bun run typecheck`, `bun run build`, `bun run check:editorial`.

Dans un navigateur, intercepter les requêtes vers `analytics.williamdeazevedo.fr` : chaque `POST /api/track` réel crée une visite.

1. Sans choix : aucune requête vers `analytics.williamdeazevedo.fr` ni vers Google, aucune clé `rybbit-*`.
2. « Tout accepter » : sans rechargement, `GET /api/script.js`, `GET /api/site/tracking-config/9713c4825fc7`, puis un `POST /api/track` de type `pageview` pour la page courante.
3. Trois navigations ClientRouter avec défilement : un seul `GET /api/script.js` ; un `pageview` par navigation, aucun au défilement ni pendant une recherche dans `/articles/`, et aucun événement ne contient le texte recherché.
4. Retour arrière : un `pageview`.
5. Retrait avec « Gérer les cookies » : un seul rechargement. Ensuite, `disable-rybbit` vaut `"wui-consent"`, `rybbit-visitor-id` est absent et aucune requête Rybbit ne part.
6. Nouvel accord : `disable-rybbit` est retiré et Rybbit se charge sans rechargement.
7. Deux onglets : un accord dans l'un charge Rybbit dans l'autre ; un retrait dans l'un recharge l'autre.
8. En production : un bundle `/_astro/*.js` contient `analytics.williamdeazevedo.fr`, `/mentions-legales/` décrit Rybbit et la visite apparaît dans la vue temps réel de Rybbit.

## Google et Cloudflare

Le code ne charge pas Zaraz et n'appelle pas `zaraz.track()`. Le 16/11/2026, le HTML publié ne contenait aucune trace de Zaraz. L'injection automatique de Zaraz se règle dans Cloudflare, hors du dépôt : si elle était réactivée avec GA4 ou Ads, ces outils partiraient sans passer par le bandeau. Les anciennes variables `PUBLIC_ZARAZ_AUDIENCE_PURPOSE` et `PUBLIC_ZARAZ_MARKETING_PURPOSE` ne sont plus utilisées.

Search Console peut rester utilisée pour les rapports de recherche et d'indexation. Elle est distincte de ces outils de suivi.

## Données de contact et services tiers

Confirmer les durées email/rendez-vous et les garanties de transfert des prestataires. Les critères généraux sont décrits dans les mentions mais les détails opérationnels restent à compléter. Examiner les requêtes et traceurs Cal.com : un clic pour réserver n'autorise pas les traceurs facultatifs. Si nécessaires, remplacer l'intégration par un lien externe informé ou adapter son fonctionnement.

## Sources

- [CNIL — Conditions de l'exemption de mesure d'audience](https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience)
- [CNIL — Outil d'auto-évaluation des solutions de mesure d'audience (juillet 2025)](https://www.cnil.fr/sites/default/files/2025-07/outil_d_auto-evaluation_mesure_d_audience.pdf)
- [CNIL — Cookies et autres traceurs](https://cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi)
- [Rybbit — Réglages de site](https://rybbit.com/docs/site-settings)
- [Rybbit — Script de suivi](https://rybbit.com/docs/script)
- [Cloudflare — Injection automatique et chargement manuel](https://developers.cloudflare.com/zaraz/advanced/load-zaraz-manually/)

Diagnostic Rybbit et analyse CNIL du 16/11/2026 : rapports hors dépôt, à l'origine de ce fonctionnement.

L'[audit initial](audit-confidentialite-2026-09-30.md) décrit la production observée avant le bandeau. Il ne conclut pas que tout usage de Rybbit impose un bandeau.

## Capture de la version sans bandeau (septembre 2026)

![Mentions améliorées sans bandeau](screenshots/privacy/sans-bandeau.jpg)
