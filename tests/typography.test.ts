import { expect, test } from "bun:test";

import { withFrenchSpacing } from "../src/lib/typography";

const nbsp = "\u00A0";

test("keeps French punctuation and amounts on the same line", () => {
  expect(
    withFrenchSpacing("Est-ce qu'un site à 2 000 € suffit toujours ?")
  ).toBe(`Est-ce qu'un site à 2${nbsp}000${nbsp}€ suffit toujours${nbsp}?`);
  expect(withFrenchSpacing("le site livré : chaque avis")).toBe(
    `le site livré${nbsp}: chaque avis`
  );
  expect(withFrenchSpacing("« Merci ! »")).toBe(
    `«${nbsp}Merci${nbsp}!${nbsp}»`
  );
});

test("leaves ordinary spaces and short numbers untouched", () => {
  const text = "Livré en 10 jours à 5 semaines selon périmètre";
  expect(withFrenchSpacing(text)).toBe(text);
});
