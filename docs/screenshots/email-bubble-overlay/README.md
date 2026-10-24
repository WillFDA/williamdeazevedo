# Correctif overlay mobile après #83

Les captures `home-390.png` (390×844, scrollY 3055) et `home-320.png` (320×844, scrollY 3238) montrent l'accueil au bloc « Hello moi c'est William ». Captures agent-browser/Chromium, inspectées visuellement : largeur originale et cercle flottant, sans rail. Le cercle peut temporairement recouvrir une petite zone de contenu.

Vérifications réalisées :

- Build réussi.
- Oxlint ciblé réussi ; lint global : 15 erreurs préexistantes, sortie identique à la base avant #83.
- `node scripts/check-floating-email-mobile.mjs http://127.0.0.1:4334/ http://127.0.0.1:4335/` réussi. La seconde URL sert le build de `24829e0^`, avant #83. Comparaison des largeurs main/sections à 320, 390 et 1440 px ; parcours de l'accueil par pas de 300 px ; mobile visible hors footer ; menu réel ouvert/fermé, dialogue natif ouvert/fermé. Le test a d'abord échoué sur la largeur 244 au lieu de 320, puis sur la disparition mobile, avant correction.
- Contrôle complémentaire Playwright consigné dans `routes.jsonl` : toutes les 18 routes à 320 et 390 px et 15 routes à 768 px terminées (largeurs comparées à la base et positions haut/milieu/bas).

Limites : campagne complémentaire interrompue sur une différence de visibilité tablette à `/services/` au milieu de page (candidat masqué, base visible), non diagnostiquée ; pas de validation exhaustive desktop/tablette revendiquée. Le comportement de collision desktop n'a pas été modifié. Les animations de page nécessitent un temps de stabilisation ; aucune validation Safari/iPhone physique. Les anciens résultats dans `../email-bubble-mobile/` décrivent #83 rejetée et ne constituent pas une preuve de ce correctif.
