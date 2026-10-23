import { expect, test } from "bun:test";

import {
  parseStoredConsent,
  serializeConsent,
  toConsentModeUpdate,
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

test("the legacy all-or-nothing format is still understood", () => {
  expect(
    parseStoredConsent(JSON.stringify({ value: "granted", at: recent }), now)
  ).toEqual({ analytics: true, ads: true });
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
});
