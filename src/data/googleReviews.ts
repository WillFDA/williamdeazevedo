/**
 * Note Google Business Profile affichée sur le site.
 *
 * DÉSACTIVÉ tant que ces valeurs ne sont pas renseignées à la main à partir de
 * la fiche Google réelle (aucune fiche trouvée en octobre 2026). Ne jamais
 * inventer ni arrondir une note : recopier exactement ce qu'affiche Google,
 * et mettre à jour `checkedAt` à chaque vérification.
 *
 * Pas de JSON-LD AggregateRating : Google n'affiche pas d'étoiles pour des avis
 * auto-déclarés par une Organization / LocalBusiness sur son propre site.
 */
export type GoogleReviewsSummary = {
  /** Date de la dernière vérification sur la fiche (AAAA-MM-JJ). */
  checkedAt: string | null;
  /** Lien public vers la fiche Google (ex. https://g.page/r/...). */
  profileUrl: string | null;
  /** Note moyenne affichée par Google, ex. 5 ou 4.8. */
  rating: number | null;
  /** Nombre d'avis affiché par Google. */
  reviewCount: number | null;
};

export const googleReviews: GoogleReviewsSummary = {
  checkedAt: null,
  profileUrl: null,
  rating: null,
  reviewCount: null,
};

/** Seuil minimal d'avis avant d'afficher le bloc. */
export const MIN_GOOGLE_REVIEWS = 3;

export function getDisplayableGoogleReviews(summary = googleReviews) {
  const { profileUrl, rating, reviewCount } = summary;
  if (
    !profileUrl ||
    rating === null ||
    reviewCount === null ||
    rating < 1 ||
    rating > 5 ||
    reviewCount < MIN_GOOGLE_REVIEWS
  ) {
    return null;
  }
  return { profileUrl, rating, reviewCount };
}
