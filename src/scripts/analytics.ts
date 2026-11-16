// Mesure d'audience Rybbit (instance auto-hébergée), rattachée à la finalité
// « Mesure d'audience » du bandeau cookies : src/scripts/consent.ts appelle
// syncAudienceMeasurement à chaque choix appliqué (chargement de la page,
// bandeau, autre onglet).

export type TrackingProperties = Record<string, string | number>;
type AnalyticsWindow = Window & {
  rybbit?: { event?: (name: string, properties: TrackingProperties) => void };
  /** Mesure autorisée dans ce document (accord, ou exemption sans refus). */
  __wuiAudienceAllowed?: boolean;
  /**
   * Script Rybbit injecté dans ce document. Sur window, comme __wuiGtmLoaded :
   * le ClientRouter garde le même document d'une page à l'autre, et une page
   * issue d'un nouveau déploiement apporte une autre copie de ce module.
   */
  __wuiRybbitLoaded?: boolean;
};

// Exemption de consentement (CNIL) : ne l'activer qu'après avoir documenté que
// la configuration déployée en remplit les conditions
// (docs/confidentialite-deploiement.md). Le drapeau seul ne l'établit pas.
// Il ne change que l'état avant tout choix : un refus de la mesure d'audience
// dans le bandeau reste respecté.
export const isAudienceExempt =
  import.meta.env.PUBLIC_RYBBIT_EXEMPT_AUDIENCE === "true";

const rybbitScriptUrl = "https://analytics.williamdeazevedo.fr/api/script.js";
// Le script Rybbit ne fait rien si cette clé existe, quelle que soit sa valeur.
// Notre valeur la distingue d'une désinscription posée à la main (pour ne pas
// compter ses propres visites, par exemple), que le site ne retire jamais.
const OPT_OUT_KEY = "disable-rybbit";
const OPT_OUT_VALUE = "wui-consent";

let pendingEvents: { name: string; properties: TrackingProperties }[] = [];
const getAnalyticsWindow = () => window as AnalyticsWindow;

// Une adresse email ou un numéro de téléphone ne doit jamais partir dans un
// événement, même via le libellé d'un lien (« Appeler le 07 … »).
const EMAIL_PATTERN = /[^\s@<>()"']+@[^\s@<>()"']+\.[a-z]{2,}/gi;
// Numéros français (0X XX XX XX XX, +33 / 0033), isolés : un SIRET ou un
// identifiant numérique plus long n'est pas pris pour un numéro.
const PHONE_PATTERN =
  /(?<![\d+])(?:(?:\+|00)33[\s.-]*(?:\(0\)[\s.-]*)?|0)[1-9](?:[\s.-]*\d{2}){4}(?!\d)/g;

export const redactContactDetails = (value: string) =>
  value.replaceAll(EMAIL_PATTERN, "[email]").replaceAll(PHONE_PATTERN, "[tel]");

export const sanitizeTrackingProperties = (properties: TrackingProperties) =>
  Object.fromEntries(
    Object.entries(properties).map(([key, value]) => {
      if (key === "email" || key === "phone") return [key, "[retiré]"];
      if (key === "url" && typeof value === "string") {
        try {
          const url = new URL(value);
          return [key, `${url.origin}${url.pathname}`];
        } catch {
          return [key, ""];
        }
      }
      return [
        key,
        typeof value === "string" ? redactContactDetails(value) : value,
      ];
    })
  );

const changesPath = (url: string | URL | null | undefined) => {
  if (url === undefined || url === null) return false;
  try {
    return (
      new URL(url, window.location.href).pathname !== window.location.pathname
    );
  } catch {
    // URL invalide : la fonction d'origine lèvera l'erreur attendue.
    return false;
  }
};

/**
 * Rybbit remplace history.replaceState et compte une page vue à chaque appel.
 * Or le ClientRouter d'Astro l'appelle à chaque fin de défilement (position
 * rangée dans history.state), et la recherche des articles y écrit la saisie.
 * Seuls les appels qui changent de chemin passent par les fonctions installées
 * par-dessus celle d'origine ; les autres vont directement à celle-ci.
 * Chaque outil qui remplace la fonction reçoit une version filtrée de la
 * précédente : la chaîne reste complète pour les vrais changements de page.
 */
const forwardOnlyPathChanges = () => {
  const original = history.replaceState;
  const filtered =
    (next: History["replaceState"]): History["replaceState"] =>
    (...args) => {
      (changesPath(args[2]) ? next : original).apply(history, args);
    };
  let exposed = filtered(original);
  Object.defineProperty(history, "replaceState", {
    configurable: true,
    get: () => exposed,
    set: (next: History["replaceState"]) => {
      exposed = filtered(next);
    },
  });
};

/**
 * Injecte le script une seule fois par document. Rybbit envoie lui-même la
 * page vue de la page courante à son démarrage, puis suit les navigations du
 * ClientRouter (pushState, retour arrière) : pas de page vue manuelle ici.
 */
const loadRybbit = () => {
  const analyticsWindow = getAnalyticsWindow();
  if (analyticsWindow.__wuiRybbitLoaded) return;
  analyticsWindow.__wuiRybbitLoaded = true;
  forwardOnlyPathChanges();
  const script = document.createElement("script");
  script.src = rybbitScriptUrl;
  script.async = true;
  script.dataset.siteId = "9713c4825fc7";
  script.addEventListener(
    "load",
    () => {
      for (const event of pendingEvents.splice(0)) {
        analyticsWindow.rybbit?.event?.(event.name, event.properties);
      }
    },
    { once: true }
  );
  script.addEventListener(
    "error",
    () => {
      pendingEvents = [];
      analyticsWindow.__wuiRybbitLoaded = false;
      script.remove();
    },
    { once: true }
  );
  document.head.append(script);
};

/**
 * Efface les clés rybbit-* (identifiant rybbit-visitor-id compris). Après un
 * refus explicite, pose aussi la désinscription lue par le script Rybbit.
 */
const forgetRybbit = (refused: boolean) => {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("rybbit-")) localStorage.removeItem(key);
    }
    if (refused && localStorage.getItem(OPT_OUT_KEY) === null)
      localStorage.setItem(OPT_OUT_KEY, OPT_OUT_VALUE);
  } catch {
    // Stockage indisponible : Rybbit ne peut rien y avoir écrit non plus.
  }
};

const removeOwnOptOut = () => {
  try {
    if (localStorage.getItem(OPT_OUT_KEY) === OPT_OUT_VALUE)
      localStorage.removeItem(OPT_OUT_KEY);
  } catch {
    // Stockage indisponible : aucune désinscription n'a pu être posée.
  }
};

/** Script Rybbit injecté dans ce document (il ne peut plus en être retiré). */
export const isAudienceMeasurementLoaded = () =>
  getAnalyticsWindow().__wuiRybbitLoaded === true;

/**
 * Applique le choix « Mesure d'audience » : true / false, ou null tant que le
 * visiteur n'a rien choisi (Rybbit n'est alors chargé qu'en exemption).
 * Rybbit ne peut pas être déchargé d'un document : après un retrait,
 * applyConsent recharge la page.
 */
export const syncAudienceMeasurement = (analyticsChoice: boolean | null) => {
  const allowed = analyticsChoice ?? isAudienceExempt;
  getAnalyticsWindow().__wuiAudienceAllowed = allowed;
  if (allowed) {
    removeOwnOptOut();
    loadRybbit();
    return;
  }
  pendingEvents = [];
  forgetRybbit(analyticsChoice === false);
};

export const trackAnalytics = (
  name: string,
  properties: TrackingProperties = {}
) => {
  const analyticsWindow = getAnalyticsWindow();
  if (
    !analyticsWindow.__wuiAudienceAllowed ||
    !analyticsWindow.__wuiRybbitLoaded
  )
    return;
  const safeProperties = sanitizeTrackingProperties(properties);
  if (typeof analyticsWindow.rybbit?.event === "function") {
    analyticsWindow.rybbit.event(name, safeProperties);
  } else {
    pendingEvents = [
      ...pendingEvents,
      { name, properties: safeProperties },
    ].slice(-20);
  }
};
