// Consentement aux cookies Google, en mode « basique » de Consent Mode v2 :
// Google Tag Manager n'est chargé qu'après un accord, pour au moins une
// finalité. Avant tout choix, ou après « Tout refuser », aucune requête ne
// part vers Google.
// Docs : https://developers.google.com/tag-platform/security/concepts/consent-mode
// (« Basic consent mode : Google tags are blocked until user interaction »).

export const CONSENT_STORAGE_KEY = "wui-consent";
export const CONSENT_DURATION_MONTHS = 6;
const GTM_ID = "GTM-TCZVQQ29";

/** Choix par finalité : mesure d'audience et publicité, séparées (CNIL). */
export type ConsentChoice = {
  analytics: boolean;
  ads: boolean;
};

type StoredConsent = ConsentChoice & { at: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isValidDate = (value: unknown): value is string =>
  typeof value === "string" && !Number.isNaN(new Date(value).getTime());

/**
 * Lit la valeur stockée sans lui faire confiance (stockage modifiable par
 * n'importe quel script ou par l'utilisateur). Accepte l'ancien format
 * `{ value: "granted" | "denied", at }` pour ne pas redemander le choix.
 * Renvoie null si la valeur est invalide ou a expiré.
 */
export const parseStoredConsent = (
  raw: string | null,
  now: number = Date.now()
): ConsentChoice | null => {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(parsed) || !isValidDate(parsed.at)) return null;

  const expiry = new Date(parsed.at);
  expiry.setMonth(expiry.getMonth() + CONSENT_DURATION_MONTHS);
  if (now >= expiry.getTime()) return null;

  if (typeof parsed.analytics === "boolean" && typeof parsed.ads === "boolean")
    return { analytics: parsed.analytics, ads: parsed.ads };

  if (parsed.value === "granted") return { analytics: true, ads: true };
  if (parsed.value === "denied") return { analytics: false, ads: false };
  return null;
};

export const serializeConsent = (
  choice: ConsentChoice,
  at: Date = new Date()
): string =>
  JSON.stringify({
    analytics: choice.analytics,
    ads: choice.ads,
    at: at.toISOString(),
  } satisfies StoredConsent);

const state = (granted: boolean) => (granted ? "granted" : "denied");

/** Signaux Consent Mode v2 correspondant au choix. */
export const toConsentModeUpdate = (choice: ConsentChoice) => ({
  ad_storage: state(choice.ads),
  ad_user_data: state(choice.ads),
  ad_personalization: state(choice.ads),
  analytics_storage: state(choice.analytics),
});

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  __wuiGtmLoaded?: boolean;
};

const gtagWindow = () => window as GtagWindow;

const ensureGtag = () => {
  const w = gtagWindow();
  w.dataLayer ??= [];
  if (!w.gtag) {
    // Forme imposée par Google : gtag.js lit l'objet `arguments` tel quel.
    w.gtag = function gtag() {
      // oxlint-disable-next-line prefer-rest-params -- forme imposée par Google.
      w.dataLayer?.push(arguments);
    };
  }
  return w.gtag;
};

/** Charge GTM une seule fois, consentement par défaut « denied » posé avant. */
const loadGoogleTagManager = (choice: ConsentChoice) => {
  const w = gtagWindow();
  if (w.__wuiGtmLoaded) return;
  w.__wuiGtmLoaded = true;
  const gtag = ensureGtag();
  gtag(
    "consent",
    "default",
    toConsentModeUpdate({ analytics: false, ads: false })
  );
  gtag("consent", "update", toConsentModeUpdate(choice));
  w.dataLayer?.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.append(script);
};

/** Retire les cookies Google déjà posés (domaine courant et parent). */
const clearCookies = (pattern: RegExp) => {
  const domain = window.location.hostname.replace(/^www\./, "");
  for (const entry of document.cookie.split(";")) {
    const name = entry.split("=")[0].trim();
    if (!pattern.test(name)) continue;
    for (const scope of ["", `;domain=${domain}`, `;domain=.${domain}`]) {
      // oxlint-disable-next-line unicorn/no-document-cookie -- Cookie Store API absente de Firefox < 140 et Safari < 18.4 : document.cookie reste le seul moyen d'effacer _ga partout.
      document.cookie = `${name}=;max-age=0;path=/${scope}`;
    }
  }
};

export const readConsent = (): ConsentChoice | null => {
  try {
    return parseStoredConsent(localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
};

/** Applique un choix (nouveau ou restauré) sans l'enregistrer. */
export const applyConsent = (choice: ConsentChoice) => {
  const w = gtagWindow();
  if (choice.analytics || choice.ads) {
    if (w.__wuiGtmLoaded)
      w.gtag?.("consent", "update", toConsentModeUpdate(choice));
    else loadGoogleTagManager(choice);
  } else if (w.__wuiGtmLoaded) {
    // Retrait du consentement après un accord dans la même page.
    w.gtag?.("consent", "update", toConsentModeUpdate(choice));
  }
  if (!choice.analytics) clearCookies(/^(?:_ga|_gid|_gat)/);
  if (!choice.ads) clearCookies(/^(?:_gcl|_gac)/);
};

export const saveConsent = (choice: ConsentChoice) => {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, serializeConsent(choice));
  } catch {
    // Stockage indisponible (navigation privée) : le choix vaut pour cette page.
  }
  applyConsent(choice);
  gtagWindow().dataLayer?.push({ event: "consent_update", consent: choice });
};
