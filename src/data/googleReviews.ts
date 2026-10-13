/**
 * Note de la fiche Google Business Profile « William De Azevedo ».
 *
 * Valeurs relevées à la main sur la fiche réelle : ne jamais inventer ni
 * arrondir, recopier ce qu'affiche Google et mettre à jour `checkedAt` à
 * chaque relevé. `null` désactive tous les affichages de note.
 *
 * Pas de JSON-LD AggregateRating : Google n'affiche pas d'étoiles pour des avis
 * auto-déclarés par une Organization / LocalBusiness sur son propre site.
 */
export type GoogleReviewsSummary = {
  /** Date du dernier relevé sur la fiche (AAAA-MM-JJ). */
  checkedAt: string;
  /** Lien public vers la fiche Google. */
  profileUrl: string;
  /** Note moyenne affichée par Google (1 à 5). */
  rating: number;
  /** Nombre d'avis affiché par Google. */
  reviewCount: number;
};

// Relevé du 14/10/2026 (OpenSEO, fiche cid 13737868056282468024) : 5 sur 5, 2 avis.
export const googleReviews: GoogleReviewsSummary | null = {
  checkedAt: "2026-10-14",
  profileUrl: "https://www.google.com/maps?cid=13737868056282468024",
  rating: 5,
  reviewCount: 2,
};

/** Nombre minimal d'avis pour afficher la note (à valider par William). */
export const MIN_GOOGLE_REVIEWS = 1;

export function getDisplayableGoogleReviews(
  summary: GoogleReviewsSummary | null = googleReviews,
  minReviews: number = MIN_GOOGLE_REVIEWS
) {
  if (
    !summary ||
    !summary.profileUrl ||
    !summary.checkedAt ||
    !Number.isFinite(summary.rating) ||
    summary.rating < 1 ||
    summary.rating > 5 ||
    !Number.isInteger(summary.reviewCount) ||
    summary.reviewCount < minReviews
  ) {
    return null;
  }
  return summary;
}

/** Une décimale, comme sur la fiche Google (5 → « 5,0 »). */
export function formatGoogleRating(rating: number) {
  return rating.toLocaleString("fr-FR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });
}

export function formatGoogleReviewCount(count: number) {
  return `${count} avis Google`;
}
