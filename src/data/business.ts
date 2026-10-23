// Coordonnées publiques de l'activité, reprises par les données structurées.
// Le téléphone est déjà affiché dans le header et les mentions légales.
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

// Centre de la commune d'Achères (Base Adresse Nationale, code INSEE 78005),
// arrondi à 3 décimales : on situe la ville, pas le domicile.
export const businessGeo = {
  "@type": "GeoCoordinates",
  latitude: 48.971,
  longitude: 2.08,
} as const;

// Libellé local repris dans les titres et les H1.
export const localAreaLabel = "Achères (78), Yvelines";
