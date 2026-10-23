import { expect, test } from "@playwright/test";

import { dismissCookieBanner, stubThirdParties } from "./helpers";

const EMBED = "https://app.cal.com/embed/embed.js";

test("le tiroir Cal.com précharge au survol, s'ouvre et se ferme", async ({
  page,
}) => {
  const requests = await stubThirdParties(page);
  await page.goto("/");
  await dismissCookieBanner(page);
  await page.waitForTimeout(500);
  expect(requests.filter((url) => url.includes("cal.com"))).toEqual([]);

  const open = page.locator("[data-cal-open]").first();
  await open.scrollIntoViewIfNeeded();
  await open.hover();
  await expect.poll(() => requests.includes(EMBED)).toBe(true);

  const drawer = page.getByRole("dialog", { name: "Planifier un créneau" });
  await open.click();
  await expect(drawer).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/cal-drawer-open/);

  await drawer.getByRole("button", { name: "Fermer" }).click();
  await expect(drawer).toBeHidden();
  await expect(page.locator("html")).not.toHaveClass(/cal-drawer-open/);

  await open.click();
  await expect(drawer).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
});
