import { expect, test } from "@playwright/test";

import { dismissCookieBanner, stubThirdParties } from "./helpers";

const EMBED = "https://app.cal.com/embed/embed.js";
const calRequests = (requests: string[]) =>
  requests.filter((url) => url.includes("cal.com"));

let requests: string[] = [];

test.beforeEach(async ({ page }) => {
  // Interceptions posées avant toute navigation : les appels faits au
  // chargement sont comptés et aucun tiers n'est réellement contacté.
  requests = await stubThirdParties(page);
  await page.goto("/");
  await dismissCookieBanner(page);
});

test("le tiroir Cal.com ne charge rien avant le clic, s'ouvre et se ferme", async ({
  page,
}) => {
  await page.waitForLoadState("networkidle");
  expect(calRequests(requests)).toEqual([]);

  // Souris posée sur le bouton : toujours aucun appel à Cal.com.
  const open = page.locator("[data-cal-open]").first();
  await open.scrollIntoViewIfNeeded();
  await open.hover();
  await page.waitForTimeout(600);
  expect(calRequests(requests)).toEqual([]);

  const drawer = page.getByRole("dialog", { name: "Planifier un créneau" });
  await open.click();
  await expect(drawer).toBeVisible();
  await expect.poll(() => requests.includes(EMBED)).toBe(true);
  await expect(page.locator("html")).toHaveClass(/cal-drawer-open/);

  await drawer.getByRole("button", { name: "Fermer" }).click();
  await expect(drawer).toBeHidden();
  await expect(page.locator("html")).not.toHaveClass(/cal-drawer-open/);
  await expect(open).toBeFocused();

  await open.click();
  await expect(drawer).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(open).toBeFocused();
});

test("un simple passage de la souris ou du clavier ne contacte pas Cal.com", async ({
  page,
}) => {
  const open = page.locator("[data-cal-open]").first();
  await open.scrollIntoViewIfNeeded();

  // Passage rapide : la souris traverse le bouton sans s'y arrêter.
  const box = await open.boundingBox();
  if (!box) throw new Error("bouton de réservation sans boîte");
  await page.mouse.move(box.x - 40, box.y + box.height / 2);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.move(box.x + box.width + 40, box.y + box.height / 2);

  // Focus clavier sur le bouton, sans l'activer.
  await open.focus();

  // Survol d'un autre lien que les boutons de réservation.
  await page.locator("header nav a:visible").first().hover();

  await page.waitForTimeout(600);
  expect(calRequests(requests)).toEqual([]);

  // Entrée sur le bouton ouvre bien le tiroir (et charge Cal.com).
  await open.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("dialog", { name: "Planifier un créneau" })
  ).toBeVisible();
  await expect.poll(() => requests.includes(EMBED)).toBe(true);
});
