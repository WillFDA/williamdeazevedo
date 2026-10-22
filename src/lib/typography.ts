const nbsp = "\u00A0";

/**
 * Espaces insécables à la française, pour éviter un « ? » ou un « € » seul en
 * début de ligne : avant ? ! ; : et », après «, dans les milliers (2 000) et
 * entre un nombre et son unité (2 000 €). Le texte ne change pas autrement.
 */
export const withFrenchSpacing = (text: string) =>
  text
    .replaceAll(/ (?=[?!;:»])/g, nbsp)
    .replaceAll("« ", `«${nbsp}`)
    .replaceAll(/(?<=\d) (?=\d{3}\b)/g, nbsp)
    .replaceAll(/(?<=\d) (?=[€%])/g, nbsp);
