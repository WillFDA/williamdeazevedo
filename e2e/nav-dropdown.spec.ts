import { expect, test } from "@playwright/test";

import { dismissCookieBanner, stubThirdParties } from "./helpers";

test.use({ viewport: { height: 900, width: 1280 } });

test.beforeEach(async ({ page }) => {
  await stubThirdParties(page);
  await page.goto("/");
  await dismissCookieBanner(page);
});

const dropdown = "[data-nav-dropdown]";

test("Échap referme le menu Services ouvert au survol", async ({ page }) => {
  const trigger = page.locator(`${dropdown} .nav-link--dropdown`);
  const panel = page.locator(`${dropdown} .nav-dropdown__panel`);

  await trigger.hover();
  await expect(panel).toHaveCSS("opacity", "1");
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCSS("opacity", "0");

  // Il se rouvre au survol suivant.
  await page.mouse.move(640, 600);
  await trigger.hover();
  await expect(panel).toHaveCSS("opacity", "1");
});

test("Échap referme le menu Services ouvert au clavier et rend le focus", async ({
  page,
}) => {
  const trigger = page.locator(`${dropdown} .nav-link--dropdown`);
  const panel = page.locator(`${dropdown} .nav-dropdown__panel`);

  await page.mouse.move(640, 600);
  await trigger.focus();
  await page.keyboard.press("Tab");
  await expect(panel).toHaveCSS("opacity", "1");
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCSS("opacity", "0");
  await expect(trigger).toBeFocused();
});
