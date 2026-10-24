import { expect, test, type Page } from "@playwright/test";

import { dismissCookieBanner, stubThirdParties } from "./helpers";

const EMBED = "https://app.cal.com/embed/embed.js";
const calRequests = (requests: string[]) =>
  requests.filter((url) => url.includes("cal.com"));
// Indices de connexion vers Cal.com (preconnect, dns-prefetch) dans le DOM.
const calHints = (page: Page) =>
  page.locator(
    'link[rel="preconnect"][href*="cal.com"], link[rel="dns-prefetch"][href*="cal.com"]'
  );
const drawerOf = (page: Page) =>
  page.getByRole("dialog", { name: "Planifier un créneau" });
const regionOf = (page: Page) =>
  drawerOf(page).getByRole("region", {
    name: "Réserver un appel avec William De Azevedo",
  });

// embed.js de test : déclenche les écouteurs « linkReady » mis en file par le
// snippet, comme Cal.com le fait quand le calendrier est prêt.
const READY_EMBED = `for (const [action, options] of window.Cal.q) {
  if (action === "on" && options.action === "linkReady") options.callback();
}`;

let requests: string[] = [];

test.beforeEach(async ({ page }) => {
  // Interceptions posées avant toute navigation : les appels faits au
  // chargement sont comptés et aucun tiers n'est réellement contacté.
  requests = await stubThirdParties(page);
});

test.describe("sans consentement cookies", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await dismissCookieBanner(page);
  });

  test("le tiroir Cal.com ne charge rien avant l'intention, s'ouvre et se ferme", async ({
    page,
  }) => {
    await page.waitForLoadState("networkidle");
    expect(calRequests(requests)).toEqual([]);
    await expect(calHints(page)).toHaveCount(0);

    // Souris posée sur le bouton : toujours aucun appel à Cal.com.
    const open = page.locator("[data-cal-open]").first();
    await open.scrollIntoViewIfNeeded();
    await open.hover();
    await page.waitForTimeout(600);
    expect(calRequests(requests)).toEqual([]);
    await expect(calHints(page)).toHaveCount(0);

    const drawer = drawerOf(page);
    await open.click();
    await expect(drawer).toBeVisible();
    await expect.poll(() => requests.includes(EMBED)).toBe(true);
    await expect(page.locator("html")).toHaveClass(/cal-drawer-open/);
    // embed.js intercepté : le squelette reste affiché, la région est occupée.
    await expect(drawer.locator("[data-cal-skeleton]")).toBeVisible();
    await expect(regionOf(page)).toHaveAttribute("aria-busy", "true");

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
    await expect(calHints(page)).toHaveCount(0);

    // Entrée sur le bouton ouvre bien le tiroir (et charge Cal.com).
    await open.focus();
    await page.keyboard.press("Enter");
    await expect(drawerOf(page)).toBeVisible();
    await expect.poll(() => requests.includes(EMBED)).toBe(true);
  });

  test("un appui suivi d'un glissement charge Cal.com sans ouvrir le tiroir", async ({
    page,
  }) => {
    const open = page.locator('[data-cal-location="hero"]');
    await open.scrollIntoViewIfNeeded();
    const box = await open.boundingBox();
    if (!box) throw new Error("bouton de réservation sans boîte");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect.poll(() => requests.includes(EMBED)).toBe(true);
    // Relâché hors du bouton : pas de clic, donc pas de tiroir.
    await page.mouse.move(box.x + box.width / 2, box.y - 120, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    await expect(drawerOf(page)).toBeHidden();

    // Le clic suivant ouvre le tiroir sans monter l'embed une seconde fois.
    await open.click();
    await expect(drawerOf(page)).toBeVisible();
    expect(requests.filter((url) => url === EMBED)).toHaveLength(1);
    const inlineCalls = await page.evaluate(
      () =>
        (window as Window & { Cal?: { q?: unknown[][] } }).Cal?.q?.filter(
          ([action]) => action === "inline"
        ).length
    );
    expect(inlineCalls).toBe(1);
  });

  test("Espace sur un bouton charge Cal.com dès l'appui de la touche", async ({
    page,
  }) => {
    const open = page.locator('[data-cal-location="hero"]');
    await open.focus();
    await page.keyboard.down("Space");
    await expect.poll(() => requests.includes(EMBED)).toBe(true);
    // Un <button> s'active au relâchement de la touche.
    await expect(drawerOf(page)).toBeHidden();
    await page.keyboard.up("Space");
    await expect(drawerOf(page)).toBeVisible();
  });

  test("le squelette laisse la place au calendrier quand Cal.com est prêt", async ({
    page,
  }) => {
    await page.route(EMBED, (route) =>
      route.fulfill({ body: READY_EMBED, contentType: "text/javascript" })
    );
    await page.locator('[data-cal-location="hero"]').click();
    await expect(drawerOf(page)).toBeVisible();
    await expect(regionOf(page)).toHaveAttribute("aria-busy", "false");
    await expect(drawerOf(page).locator("[data-cal-skeleton]")).toBeHidden();
  });

  test("le squelette disparaît si embed.js ne se charge pas", async ({
    page,
  }) => {
    await page.route(EMBED, (route) => route.abort());
    await page.locator('[data-cal-location="hero"]').click();
    await expect(drawerOf(page)).toBeVisible();
    await expect(regionOf(page)).toHaveAttribute("aria-busy", "false");
    await expect(drawerOf(page).locator("[data-cal-skeleton]")).toBeHidden();
  });
});

test.describe("consentement cookies déjà donné", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "wui-consent",
        JSON.stringify({ at: new Date().toISOString(), value: "granted" })
      );
    });
    await page.goto("/");
  });

  test("le consentement ne déclenche aucun préchargement : rien au survol ni au focus, Cal.com à l'appui", async ({
    page,
  }) => {
    await page.waitForLoadState("networkidle");
    expect(calRequests(requests)).toEqual([]);
    await expect(calHints(page)).toHaveCount(0);

    const open = page.locator('[data-cal-location="hero"]');
    await open.scrollIntoViewIfNeeded();

    // Souris arrêtée sur le bouton, puis focus clavier qui y reste.
    await open.hover();
    await page.waitForTimeout(600);
    await open.focus();
    await page.waitForTimeout(600);
    expect(calRequests(requests)).toEqual([]);
    await expect(calHints(page)).toHaveCount(0);
    await expect(drawerOf(page)).toBeHidden();

    // L'appui charge Cal.com ; le clic ouvre le tiroir, sans double chargement.
    await open.click();
    await expect(drawerOf(page)).toBeVisible();
    await expect.poll(() => requests.includes(EMBED)).toBe(true);
    expect(requests.filter((url) => url === EMBED)).toHaveLength(1);
  });
});
