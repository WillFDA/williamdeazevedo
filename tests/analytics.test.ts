import { expect, test } from "bun:test";

import {
  initAnalytics,
  isAudienceMeasurementEnabled,
  sanitizeTrackingProperties,
  trackAnalytics,
} from "../src/scripts/analytics";

const scripts: {
  dataset: Record<string, string>;
  listeners: Record<string, () => void>;
}[] = [];
const events: string[] = [];
const testWindow = {
  rybbit: undefined as undefined | { event: (name: string) => void },
};
Object.assign(globalThis, {
  window: testWindow,
  document: {
    querySelector: () => scripts[0],
    createElement: () => ({
      src: "",
      dataset: {},
      listeners: {} as Record<string, () => void>,
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- DOM event API test double.
      addEventListener(name: string, callback: () => void) {
        this.listeners[name] = callback;
      },
      remove() {
        scripts.length = 0;
      },
    }),
    head: {
      append: (script: (typeof scripts)[number]) => scripts.push(script),
    },
  },
});

test("measurement stays off unless explicitly enabled, without browser storage", () => {
  initAnalytics();
  initAnalytics();
  trackAnalytics("contact_email_click");
  if (isAudienceMeasurementEnabled) {
    expect(scripts).toHaveLength(1);
    testWindow.rybbit = { event: (name) => events.push(name) };
    scripts[0].listeners.load();
    expect(events).toEqual(["contact_email_click"]);
    trackAnalytics("contact_phone_click");
    expect(events).toEqual(["contact_email_click", "contact_phone_click"]);
  } else {
    expect(scripts).toHaveLength(0);
    expect(events).toHaveLength(0);
  }
});

test("outbound event URLs exclude query strings and fragments", () => {
  expect(
    sanitizeTrackingProperties({
      url: "https://example.com/contact?email=private@example.com#secret",
      location: "footer",
    })
  ).toEqual({ url: "https://example.com/contact", location: "footer" });
});

test("event properties never carry an email address or a phone number", () => {
  expect(
    sanitizeTrackingProperties({
      label: "Écrire à william.deazevedopro@gmail.com",
      location: "Appeler le 07 62 74 60 21",
      email: "someone@example.com",
      phone: "+33762746021",
      count: 3,
    })
  ).toEqual({
    label: "Écrire à [email]",
    location: "Appeler le [tel]",
    email: "[retiré]",
    phone: "[retiré]",
    count: 3,
  });
});

test("phone masking targets French numbers only, not other long numbers", () => {
  for (const phone of [
    "07 62 74 60 21",
    "07.62.74.60.21",
    "0762746021",
    "+33 7 62 74 60 21",
    "+33 (0)7 62 74 60 21",
    "0033762746021",
  ])
    expect(sanitizeTrackingProperties({ label: `Tel ${phone}` })).toEqual({
      label: "Tel [tel]",
    });
  for (const other of ["SIRET 12345678900012", "id 20261023", "1500 €"])
    expect(sanitizeTrackingProperties({ label: other })).toEqual({
      label: other,
    });
});
