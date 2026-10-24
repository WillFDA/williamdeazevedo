import { afterEach, expect, test } from "bun:test";

import { CONSENT_STORAGE_KEY, readConsent } from "../src/scripts/consent";

const store = new Map<string, string>();
Object.assign(globalThis, {
  localStorage: { getItem: (key: string) => store.get(key) ?? null },
});

const monthsAgo = (months: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString();
};

afterEach(() => store.clear());

test("no stored choice means no consent", () => {
  expect(readConsent()).toBeNull();
});

test("a recent choice is returned as stored", () => {
  store.set(
    CONSENT_STORAGE_KEY,
    JSON.stringify({ at: monthsAgo(1), value: "granted" })
  );
  expect(readConsent()).toBe("granted");
  store.set(
    CONSENT_STORAGE_KEY,
    JSON.stringify({ at: monthsAgo(5), value: "denied" })
  );
  expect(readConsent()).toBe("denied");
});

test("a choice older than six months expires", () => {
  store.set(
    CONSENT_STORAGE_KEY,
    JSON.stringify({ at: monthsAgo(7), value: "granted" })
  );
  expect(readConsent()).toBeNull();
});

test("unreadable or unexpected values never count as consent", () => {
  for (const raw of [
    "{not json",
    JSON.stringify({ at: monthsAgo(1), value: "yes" }),
    JSON.stringify({ value: "granted" }),
  ]) {
    store.set(CONSENT_STORAGE_KEY, raw);
    expect(readConsent()).toBeNull();
  }
});
