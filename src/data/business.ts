// Coordonnées publiques de l'activité : seule source du téléphone (header,
// mentions légales, données structurées).
export const businessPhone = {
  display: "07 62 74 60 21",
  e164: "+33762746021",
} as const;

export const businessAddress = {
  "@type": "PostalAddress",
  addressCountry: "FR",
  addressLocality: "Achères",
  addressRegion: "Île-de-France",
  postalCode: "78260",
} as const;

// Centre de la commune d'Achères, arrondi à 3 décimales : on situe la ville,
// pas le domicile. Source : https://geo.api.gouv.fr/communes/78005?fields=centre
// (48.9817, 2.1095, vérifié le 23 octobre 2026).
export const businessGeo = {
  "@type": "GeoCoordinates",
  latitude: 48.982,
  longitude: 2.11,
} as const;

// Libellé local repris dans les H1.
export const localAreaLabel = "Achères (78), Yvelines";
// Version courte pour les <title>, que Google tronque vers 60 caractères.
export const localAreaShortLabel = "Achères (78)";
