import { expect, test } from "bun:test";

import {
  cleanPageUrl,
  isWithdrawal,
  parseStoredConsent,
  serializeConsent,
  toConsentModeUpdate,
  toConsentUpdateEvent,
} from "../src/scripts/consent";

const now = new Date("2026-10-23T12:00:00.000Z").getTime();
const recent = "2026-10-01T12:00:00.000Z";

test("a stored choice round-trips per purpose", () => {
  const raw = serializeConsent(
    { analytics: true, ads: false },
    new Date(recent)
  );
  expect(parseStoredConsent(raw, now)).toEqual({ analytics: true, ads: false });
});

test("a legacy refusal is kept, a legacy global consent is asked again", () => {
  expect(
    parseStoredConsent(JSON.stringify({ value: "granted", at: recent }), now)
  ).toBeNull();
  expect(
    parseStoredConsent(JSON.stringify({ value: "denied", at: recent }), now)
  ).toEqual({ analytics: false, ads: false });
});

test("invalid or tampered values are rejected", () => {
  for (const raw of [
    null,
    "",
    "not json",
    "null",
    "42",
    '"granted"',
    "[]",
    JSON.stringify({ value: "granted" }),
    JSON.stringify({ value: "granted", at: "yesterday" }),
    JSON.stringify({ value: "yes", at: recent }),
    JSON.stringify({ analytics: "true", ads: false, at: recent }),
    JSON.stringify({ analytics: true, at: recent }),
  ]) {
    expect(parseStoredConsent(raw, now)).toBeNull();
  }
});

test("a choice expires after 6 months", () => {
  const raw = serializeConsent(
    { analytics: true, ads: true },
    new Date("2026-04-22T12:00:00.000Z")
  );
  expect(parseStoredConsent(raw, now)).toBeNull();
  const fresh = serializeConsent(
    { analytics: true, ads: true },
    new Date("2026-04-24T12:00:00.000Z")
  );
  expect(parseStoredConsent(fresh, now)).not.toBeNull();
});

test("Consent Mode signals follow each purpose separately", () => {
  expect(toConsentModeUpdate({ analytics: true, ads: false })).toEqual({
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  // Publicité = mesure des contacts issus des annonces, jamais le remarketing.
  expect(toConsentModeUpdate({ analytics: false, ads: true })).toEqual({
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
});

test("consent_update keeps the legacy string and adds each purpose", () => {
  // Déclencheurs GTM existants : « consent égale granted ».
  expect(toConsentUpdateEvent({ analytics: true, ads: true })).toEqual({
    event: "consent_update",
    consent: "granted",
    consent_analytics: "granted",
    consent_ads: "granted",
  });
  expect(toConsentUpdateEvent({ analytics: true, ads: false })).toEqual({
    event: "consent_update",
    consent: "denied",
    consent_analytics: "granted",
    consent_ads: "denied",
  });
  expect(toConsentUpdateEvent({ analytics: false, ads: false })).toMatchObject({
    consent: "denied",
  });
});

test("page URLs only keep campaign parameters", () => {
  const url = cleanPageUrl(
    "https://www.williamdeazevedo.fr/articles/?search=jean%40exemple.fr&utm_source=newsletter&gclid=abc#top"
  );
  expect(url.href).toBe(
    "https://www.williamdeazevedo.fr/articles/?utm_source=newsletter&gclid=abc"
  );
  expect(cleanPageUrl("https://www.williamdeazevedo.fr/?q=1#a").href).toBe(
    "https://www.williamdeazevedo.fr/"
  );
});

test("withdrawing a purpose granted earlier requires a full reload", () => {
  const both = { analytics: true, ads: true };
  const none = { analytics: false, ads: false };
  expect(isWithdrawal(undefined, none)).toBe(false);
  expect(isWithdrawal(none, both)).toBe(false);
  expect(isWithdrawal({ analytics: true, ads: false }, both)).toBe(false);
  expect(isWithdrawal(both, none)).toBe(true);
  expect(isWithdrawal(both, { analytics: true, ads: false })).toBe(true);
  expect(isWithdrawal(both, { analytics: false, ads: true })).toBe(true);
});
