/**
 * Sérialise un objet JSON-LD pour `<script type="application/ld+json" set:html>`.
 *
 * `JSON.stringify` seul laisse passer `</script>` : un titre ou une réponse de
 * FAQ qui contiendrait cette suite fermerait la balise et injecterait du HTML.
 * On échappe donc `<`, `>` et `&` en séquences Unicode, ainsi que U+2028 et
 * U+2029. Le JSON reste identique une fois parsé.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replaceAll("<", String.raw`\u003c`)
    .replaceAll(">", String.raw`\u003e`)
    .replaceAll("&", String.raw`\u0026`)
    .replaceAll("\u2028", String.raw`\u2028`)
    .replaceAll("\u2029", String.raw`\u2029`);
}
