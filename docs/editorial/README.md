# Série éditoriale SEO / GEO

Cette série complète les pages de prestations avec des réponses pratiques aux questions de préparation, de budget et de qualité d'un site. Les contenus sont originaux ; les articles comparables servent à identifier les questions utiles, pas à reprendre leurs formulations. Les notes `recherche-*.md` recensent les lectures et sources par sujet.

## Où modifier un article ?

Le site utilise déjà les collections Astro. Les onze textes de la série, après intégration de cette PR, sont dans `src/content/articles/*.md`, les visuels de couverture dans `public/articles/<slug>/cover.webp`. Aucun CMS ni service tiers supplémentaire n'est nécessaire.

La plupart des couvertures déjà présentes sont des aplats gris provisoires. Remplacer uniquement les visuels encore provisoires par une couverture pertinente (16:9, 1600×900, WebP) et renseigner un texte alternatif fidèle au visuel ; le laisser vide seulement si l’image est décorative.

Le frontmatter contient le titre, la description SEO, la date, les tags, l'auteur et le visuel. Le corps est du Markdown : titres `##`, listes, liens, tableaux et images. Ne pas ajouter de titre `#` dans le corps : le modèle de page génère déjà le H1.

- `draft: true` exclut l'article du build de production, du listing et du sitemap.
- `draft: false` et une `pubDate` atteinte rendent l'article publiable au prochain build.
- En développement, les brouillons et les dates futures sont visibles pour relecture.
- Une date future ne programme pas un déploiement : il faut un nouveau build après cette date.

`tester-accessibilite-site-web` est publié le 28 septembre 2026 et `mentions-legales-site-internet-professionnel` le 2 octobre 2026. Les neuf autres articles sont en `draft: true` et restent hors du site. Pour publier l'un d'eux : passer `draft` à `false`, mettre sa `pubDate` au jour de publication et retirer une `updatedDate` antérieure à cette date. Le site est reconstruit à chaque push sur `2026`. Éviter des liens vers des articles encore masqués.

## Ciblage

Volumes estimés mensuels France/français provenant de la recherche OpenSEO réalisée dans cette conversation. Ce ne sont ni des promesses de trafic ni des données Search Console : cette dernière n'était pas connectée au projet. Ne pas additionner les variantes proches. Une difficulté basse fournie par un outil ne suffit pas à prévoir un classement.

La requête ajoutée dans cette PR n’a pas de mesure : OpenSEO a renvoyé `INSUFFICIENT_CREDITS` le 29 septembre 2026 et le projet disponible n’avait ni domaine ni contexte métier. « Non mesuré » ne signifie pas volume nul ; ne pas attribuer à ce sujet une intention ou une demande validée par l’outil.

| Slug                                         | Requête principale                           | Volume estimé | Intention / distinction                                                                  |
| -------------------------------------------- | -------------------------------------------- | ------------: | ---------------------------------------------------------------------------------------- |
| prix-site-vitrine                            | prix site internet vitrine                   |           320 | Budget et périmètre concret ; complète l'essai existant sur les offres à 600/2 000 euros |
| cout-site-internet-par-mois                  | combien coûte un site internet par mois      |            90 | Frais récurrents, pas prix de création                                                   |
| prix-refonte-site-internet                   | refonte site internet prix                   |           110 | Arbitrage réparation / refonte, pas landing de prestation                                |
| refonte-seo                                  | refonte seo                                  |           320 | Préserver les acquis lors d'une migration                                                |
| cahier-des-charges-site-internet             | cahier des charges site internet             |           320 | Préparer le projet avec un modèle utilisable                                             |
| exemples-sites-vitrines                      | site vitrine exemple                         |           320 | Analyse qualitative des projets réels, sans gains inventés                               |
| site-internet-artisan-contenus               | création site internet artisan               |           140 | Guide des pages et contenus ; renvoi vers la landing commerciale                         |
| creer-site-internet-ia                       | créer un site web gratuit avec ia            |           260 | Capacités et limites ; audience gratuite moins proche d'un achat                         |
| tester-accessibilite-site-web                | test accessibilité site web                  |           140 | Premiers tests, distincts d'un audit de conformité                                       |
| referencement-chatgpt                        | référencement chatgpt                        |           210 | Conditions et limites de visibilité, aucune garantie de citation                         |
| mentions-legales-site-internet-professionnel | mentions légales site internet professionnel |    non mesuré | Checklist éditoriale par statut et fonctionnalités ; demande OpenSEO non validée         |
| audit-seo                                    | audit seo                                    |         1 600 | Méthode d’auto-audit d’un site vitrine en une heure ; secondaire « audit seo technique » (480) |

## Vérification avant fusion

```sh
bun install --frozen-lockfile
bun run build
node scripts/check-editorial.mjs
bun run lint
```

Le contrôle éditorial vérifie que les brouillons restent hors du build et, pour chaque article publié, sa présence dans le listing et le sitemap, le H1, la canonical, les données structurées, la couverture Open Graph, les images WebP et les liens locaux du HTML généré. Ce contrôle technique ne remplace pas la relecture humaine du contenu et des sources.

Les essais de navigation doivent être faits sur une prévisualisation locale, en bloquant les requêtes de mesure externes pour ne pas créer de fausses visites ou conversions de production. Ne pas envoyer de formulaire ni réserver de rendez-vous réel.

## Relecture métier et suivi

Avant fusion, relire notamment les indications de prix et de périmètre, la description des réalisations et le ton employé sous le nom de William. Les illustrations pédagogiques ne sont pas des graphiques de résultats clients. Aucun résultat commercial ni promesse de classement ne doit être ajouté sans preuve.

Après publication : connecter Search Console, contrôler l'indexation, distinguer les requêtes informatives des requêtes de prestation, puis suivre les demandes de contact réelles. Les pages tarifaires et la landing artisan peuvent partager un vocabulaire avec les articles : vérifier leurs requêtes d'entrée avant de créer de nouvelles variantes.
