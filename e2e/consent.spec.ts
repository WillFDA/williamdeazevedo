import { expect, test, type Page, type Request } from "@playwright/test";

// Preuve du mode « basique » : aucune requête vers Google avant un choix,
// ni après « Tout refuser ». GTM n'est chargé qu'après un accord.
const GOOGLE_HOST =
  /(?:^|\.)(?:google|googletagmanager|google-analytics|googleadservices|googlesyndication|doubleclick|gstatic)\.[a-z.]+$/;

const isGoogle = (request: Request) =>
  GOOGLE_HOST.test(new URL(request.url()).hostname);

const recordGoogleRequests = async (page: Page) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (isGoogle(request)) requests.push(request.url());
  });
  // Jamais de vrai appel à Google depuis la CI : script GTM vide.
  await page.route(
    (url) => GOOGLE_HOST.test(url.hostname),
    (route) =>
      route.fulfill({ contentType: "text/javascript", body: "/* stub */" })
  );
  return requests;
};

type DataLayerWindow = { dataLayer?: unknown[] };

const consentUpdates = (page: Page) =>
  page.evaluate(() =>
    ((window as unknown as DataLayerWindow).dataLayer ?? [])
      .filter(
        (entry) =>
          typeof entry === "object" && entry !== null && "length" in entry
      )
      .map((entry) => Array.from(entry as ArrayLike<unknown>))
      .filter((entry) => entry[0] === "consent" && entry[1] === "update")
      .map((entry) => entry[2])
  );

const dataLayerEvents = (page: Page) =>
  page.evaluate(() =>
    ((window as unknown as DataLayerWindow).dataLayer ?? []).flatMap((entry) =>
      typeof entry === "object" && entry !== null && "event" in entry
        ? [String((entry as { event: unknown }).event)]
        : []
    )
  );

const banner = (page: Page) => page.getByRole("dialog", { name: "Cookies" });

// Attend la fin de l'activité réseau (pas d'attente fixe).
const settle = (page: Page) => page.waitForLoadState("networkidle");

test("no Google request before any choice", async ({ page }) => {
  const requests = await recordGoogleRequests(page);
  for (const path of ["/", "/tarifs/", "/articles/", "/mentions-legales/"]) {
    // oxlint-disable-next-line no-await-in-loop -- pages visitées l'une après l'autre, dans le même onglet.
    await page.goto(path);
    // oxlint-disable-next-line no-await-in-loop -- idem.
    await settle(page);
  }
  await expect(banner(page)).toBeVisible();
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => document.cookie)).not.toMatch(/_ga|_gcl/);
});

test("no Google request after « Tout refuser », even on later pages", async ({
  page,
}) => {
  const requests = await recordGoogleRequests(page);
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Tout refuser" }).click();
  await expect(banner(page)).toBeHidden();
  await page.goto("/tarifs/");
  await settle(page);
  await page.reload();
  await settle(page);
  await expect(banner(page)).toBeHidden();
  expect(requests).toEqual([]);
});

test("« Tout accepter » loads GTM with both purposes granted", async ({
  page,
}) => {
  const requests = await recordGoogleRequests(page);
  await page.goto("/");
  await settle(page);
  expect(requests).toEqual([]);
  await banner(page).getByRole("button", { name: "Tout accepter" }).click();
  await expect
    .poll(() =>
      requests.some((url) => url.includes("googletagmanager.com/gtm.js"))
    )
    .toBe(true);
  const update = await page.evaluate(() =>
    (window as unknown as { dataLayer: IArguments[] }).dataLayer
      .map((entry) => Array.from(entry as ArrayLike<unknown>))
      .find((entry) => entry[0] === "consent" && entry[1] === "update")
  );
  expect(update?.[2]).toMatchObject({
    analytics_storage: "granted",
    ad_storage: "granted",
  });
});

test("per-purpose choice: audience only, then withdrawn from the footer", async ({
  page,
}) => {
  const requests = await recordGoogleRequests(page);
  await page.goto("/");
  const dialog = banner(page);
  await dialog.getByRole("button", { name: "Choisir par finalité" }).click();
  const audience = dialog.getByRole("checkbox", { name: /Mesure d'audience/ });
  const ads = dialog.getByRole("checkbox", { name: /Publicité/ });
  await expect(audience).not.toBeChecked();
  await expect(ads).not.toBeChecked();
  await audience.check();
  await dialog.getByRole("button", { name: "Enregistrer mes choix" }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => requests.length).toBeGreaterThan(0);
  const updates = await consentUpdates(page);
  expect(updates.at(-1)).toMatchObject({
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  // Audience seule : les conversions Google Ads (clic contact) ne partent pas.
  await page.evaluate(() =>
    document.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    })
  );
  await page
    .locator('footer a[href^="mailto:"]')
    .first()
    .dispatchEvent("click");
  expect(await dataLayerEvents(page)).not.toContain("clic_email");

  const stored = await page.evaluate(() => localStorage.getItem("wui-consent"));
  expect(JSON.parse(stored ?? "{}")).toMatchObject({
    analytics: true,
    ads: false,
  });

  // Réouverture : les cases reflètent le choix en cours.
  await page.getByRole("button", { name: "Gérer les cookies" }).click();
  await expect(dialog).toBeVisible();
  await expect(audience).toBeChecked();
  await expect(ads).not.toBeChecked();
  await audience.uncheck();
  await dialog.getByRole("button", { name: "Enregistrer mes choix" }).click();

  // Après retrait complet, un nouveau chargement ne contacte plus Google.
  requests.length = 0;
  await page.reload();
  await settle(page);
  expect(requests).toEqual([]);
});

test("withdrawing after « Tout accepter » unloads GTM without a manual reload", async ({
  page,
}) => {
  const requests = await recordGoogleRequests(page);
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Tout accepter" }).click();
  await expect.poll(() => requests.length).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Gérer les cookies" }).click();
  const dialog = banner(page);
  await dialog.getByRole("checkbox", { name: /Mesure d'audience/ }).uncheck();
  await dialog.getByRole("checkbox", { name: /Publicité/ }).uncheck();
  await Promise.all([
    page.waitForEvent("load"),
    dialog.getByRole("button", { name: "Enregistrer mes choix" }).click(),
  ]);
  await settle(page);
  requests.length = 0;

  // Navigation ClientRouter (même document) : plus aucune balise Google.
  await page.locator('header a[href="/articles/"]').first().click();
  await expect(page).toHaveURL(/\/articles\/$/);
  await settle(page);
  expect(requests).toEqual([]);
  expect(await page.evaluate(() => "__wuiGtmLoaded" in window)).toBe(false);
  expect(await dataLayerEvents(page)).not.toContain("page_view_virtual");
});

test("the GTM noscript iframe is gone", async ({ page }) => {
  await page.goto("/");
  expect(await page.content()).not.toContain("googletagmanager.com/ns.html");
});

// Écrans de téléphones courants : iPhone 12/13 mini (375×812), iPhone 14
// (390×844), Pixel 7 (412×915). Sur les écrans plus étroits ou plus courts
// (360×780, 375×667), le bouton du hero descend trop bas pour qu'un bandeau
// tienne dessous : c'est la mise en page du hero, hors de cette PR.
const phones = [
  { name: "375×812", width: 375, height: 812 },
  { name: "390×844", width: 390, height: 844 },
  { name: "412×915", width: 412, height: 915 },
];

for (const phone of phones) {
  test(`on mobile (${phone.name}) the banner stays compact and leaves the hero call to action visible`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: phone.width, height: phone.height },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto("/");
    const dialog = banner(page);
    await expect(dialog).toBeVisible();
    const cta = page
      .locator("main :is(a, button)", { hasText: "Parlons de votre projet" })
      .first();
    const [bannerBox, ctaBox] = await Promise.all([
      dialog.boundingBox(),
      cta.boundingBox(),
    ]);
    expect(bannerBox && ctaBox).toBeTruthy();
    if (bannerBox && ctaBox) {
      expect(bannerBox.height).toBeLessThan(240);
      expect(ctaBox.y + ctaBox.height).toBeLessThanOrEqual(bannerBox.y);
    }
    await context.close();
  });
}
