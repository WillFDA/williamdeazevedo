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
