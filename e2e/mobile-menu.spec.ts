import { expect, test } from "@playwright/test";

import { dismissCookieBanner, stubThirdParties } from "./helpers";

test.use({ viewport: { height: 812, width: 375 } });

test.beforeEach(async ({ page }) => {
  await stubThirdParties(page);
  await page.goto("/");
  await dismissCookieBanner(page);
});

test("le lien d'appel reste visible dans la barre mobile", async ({ page }) => {
  const call = page.locator('[data-analytics-location="mobile-header-bar"]');
  await expect(call).toBeVisible();
  await expect(call).toHaveAttribute("href", /^tel:\+33\d{9}$/);
  await expect(call).toHaveAccessibleName(/Appeler William/);
});

test("le menu s'ouvre, se ferme au clic puis avec Échap", async ({ page }) => {
  const button = page.locator("[data-mobile-menu-button]");
  const menu = page.locator("[data-mobile-menu]");

  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(menu).toBeVisible();
  await expect(menu).toHaveJSProperty("style.height", "auto");

  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeHidden();

  await button.click();
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(button).toBeFocused();
});

test("le menu se ferme même sans transitionend (repli)", async ({ page }) => {
  // Sans transition CSS, transitionend ne se déclenche jamais : seul le
  // délai de repli peut terminer l'ouverture et la fermeture.
  await page.addStyleTag({
    content: ".mobile-menu { transition: none !important; }",
  });
  const button = page.locator("[data-mobile-menu-button]");
  const menu = page.locator("[data-mobile-menu]");

  await button.click();
  await expect(menu).toHaveJSProperty("style.height", "auto");
  await button.click();
  await expect(menu).toBeHidden({ timeout: 2000 });
});
