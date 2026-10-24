// Choix du bandeau cookies (CookieBanner.astro). Il est aussi relu tôt par le
// script inline de tracking/GoogleTagManager.astro : garder la clé et la durée
// de validité alignées avec ce fichier.
export type ConsentValue = "granted" | "denied";

export const CONSENT_STORAGE_KEY = "wui-consent";
const CONSENT_VALIDITY_MONTHS = 6;

// Renvoie le choix encore valide, ou null s'il est absent, expiré ou illisible.
export const readConsent = (): ConsentValue | null => {
  try {
    const stored = JSON.parse(
      localStorage.getItem(CONSENT_STORAGE_KEY) ?? "null"
    );
    if (stored?.value !== "granted" && stored?.value !== "denied") return null;
    const expiry = new Date(stored.at);
    expiry.setMonth(expiry.getMonth() + CONSENT_VALIDITY_MONTHS);
    return Date.now() < expiry.getTime() ? stored.value : null;
  } catch {
    return null;
  }
};
