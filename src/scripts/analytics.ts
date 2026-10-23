export type TrackingProperties = Record<string, string | number>;
type AnalyticsWindow = Window & {
  rybbit?: { event?: (name: string, properties: TrackingProperties) => void };
};

// Enable only after documenting that the deployed configuration meets the
// CNIL audience-measurement exemption. The flag alone does not establish it.
export const isAudienceMeasurementEnabled =
  import.meta.env.PUBLIC_RYBBIT_EXEMPT_AUDIENCE === "true";

const rybbitScriptUrl = "https://analytics.williamdeazevedo.fr/api/script.js";
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

export const initAnalytics = () => {
  if (
    !isAudienceMeasurementEnabled ||
    document.querySelector("script[data-wui-rybbit]")
  )
    return;
  const analyticsWindow = getAnalyticsWindow();
  const script = document.createElement("script");
  script.src = rybbitScriptUrl;
  script.async = true;
  script.dataset.siteId = "9713c4825fc7";
  script.dataset.wuiRybbit = "";
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
      script.remove();
    },
    { once: true }
  );
  document.head.append(script);
};

export const trackAnalytics = (
  name: string,
  properties: TrackingProperties = {}
) => {
  if (!isAudienceMeasurementEnabled) return;
  initAnalytics();
  const safeProperties = sanitizeTrackingProperties(properties);
  const analyticsWindow = getAnalyticsWindow();
  if (typeof analyticsWindow.rybbit?.event === "function") {
    analyticsWindow.rybbit.event(name, safeProperties);
  } else {
    pendingEvents = [
      ...pendingEvents,
      { name, properties: safeProperties },
    ].slice(-20);
  }
};
