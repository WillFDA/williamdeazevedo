import {
  devices,
  expect,
  test,
  type Browser,
  type BrowserContextOptions,
  type Page,
  type Request,
} from "@playwright/test";

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
  // Jamais de vrai appel à Google ni à Cal.com depuis la CI : scripts vides.
  await page.route(
    (url) => GOOGLE_HOST.test(url.hostname) || url.hostname.endsWith("cal.com"),
    (route) =>
      route.fulfill({ contentType: "text/javascript", body: "/* stub */" })
  );
  return requests;
};

// Clic sur un lien sans suivre sa cible (mailto, tel).
const clickWithoutFollowing = async (page: Page, selector: string) => {
  await page.evaluate(() =>
    document.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    })
  );
  await page.locator(selector).first().dispatchEvent("click");
};

const pageViews = (page: Page) =>
  page.evaluate(() =>
    ((window as unknown as DataLayerWindow).dataLayer ?? []).filter(
      (entry): entry is Record<string, unknown> =>
        typeof entry === "object" &&
        entry !== null &&
        (entry as { event?: unknown }).event === "page_view_virtual"
    )
  );

const pageViewCount = async (page: Page) => {
  const views = await pageViews(page);
  return views.length;
};

const navigateInApp = async (page: Page) => {
  await page.locator('header a[href="/articles/"]').first().click();
  await expect(page).toHaveURL(/\/articles\/$/);
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
    // Pas de remarketing : jamais accordé, même avec « Tout accepter ».
    ad_personalization: "denied",
  });
  // Même format que l'ancien bandeau pour les déclencheurs GTM existants.
  expect(
    await page.evaluate(() =>
      (window as unknown as DataLayerWindow).dataLayer?.find(
        (entry) => (entry as { event?: unknown }).event === "consent_update"
      )
    )
  ).toEqual({
    event: "consent_update",
    consent: "granted",
    consent_analytics: "granted",
    consent_ads: "granted",
  });

  // Les deux finalités : clic email (conversion Ads) et page vue virtuelle.
  await clickWithoutFollowing(
    page,
    'footer a[href^="mailto:"]:not([data-cal-open])'
  );
  expect(await dataLayerEvents(page)).toContain("clic_email");
  await navigateInApp(page);
  await expect.poll(() => pageViewCount(page)).toBe(1);
});

test("page views only carry campaign parameters from the query string", async ({
  page,
}) => {
  await recordGoogleRequests(page);
  await page.goto("/?email=jean%40exemple.fr&utm_source=newsletter#contact");
  await banner(page).getByRole("button", { name: "Tout accepter" }).click();
  // Page vue initiale : URL nettoyée posée avant gtm.js.
  const initial = await page.evaluate(() =>
    ((window as unknown as DataLayerWindow).dataLayer ?? []).find(
      (entry) =>
        typeof entry === "object" && entry !== null && "page_location" in entry
    )
  );
  expect(initial).toEqual({
    page_location: expect.stringMatching(/\/\?utm_source=newsletter$/),
    page_path: "/?utm_source=newsletter",
  });
  await navigateInApp(page);
  await expect.poll(() => pageViewCount(page)).toBe(1);
  const [view] = await pageViews(page);
  expect(String(view.page_referrer)).toMatch(/utm_source=newsletter/);
  expect(JSON.stringify(view)).not.toMatch(/email|exemple/);
});

test("booking buttons (mailto fallback) are not counted as email clicks", async ({
  page,
}) => {
  await recordGoogleRequests(page);
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Tout accepter" }).click();
  await clickWithoutFollowing(page, '[data-cal-open][href^="mailto:"]');
  expect(await dataLayerEvents(page)).not.toContain("clic_email");
});

test("ads only: contact conversions are sent, page views are not", async ({
  page,
}) => {
  await recordGoogleRequests(page);
  await page.goto("/");
  const dialog = banner(page);
  await dialog.getByRole("button", { name: "Choisir par finalité" }).click();
  await dialog.getByRole("checkbox", { name: /Publicité/ }).check();
  await dialog.getByRole("button", { name: "Enregistrer mes choix" }).click();
  await clickWithoutFollowing(
    page,
    'footer a[href^="mailto:"]:not([data-cal-open])'
  );
  expect(await dataLayerEvents(page)).toContain("clic_email");
  await navigateInApp(page);
  await settle(page);
  expect(await pageViews(page)).toEqual([]);
});

test("a legacy global consent (before per-purpose choice) is asked again", async ({
  page,
}) => {
  const requests = await recordGoogleRequests(page);
  await page.addInitScript(() =>
    localStorage.setItem(
      "wui-consent",
      JSON.stringify({ value: "granted", at: new Date().toISOString() })
    )
  );
  await page.goto("/");
  await settle(page);
  await expect(banner(page)).toBeVisible();
  expect(requests).toEqual([]);
});

test("withdrawing audience deletes its cookies and keeps the ads ones", async ({
  page,
  context,
  baseURL,
}) => {
  await recordGoogleRequests(page);
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Tout accepter" }).click();
  await context.addCookies(
    ["_ga", "_ga_TEST", "_gcl_au"].map((name) => ({
      name,
      value: "1",
      url: baseURL ?? "http://127.0.0.1:4329",
    }))
  );
  await page.getByRole("button", { name: "Gérer les cookies" }).click();
  const dialog = banner(page);
  await dialog.getByRole("checkbox", { name: /Mesure d'audience/ }).uncheck();
  await Promise.all([
    page.waitForEvent("load"),
    dialog.getByRole("button", { name: "Enregistrer mes choix" }).click(),
  ]);
  const cookies = await context.cookies();
  const names = cookies.map((cookie) => cookie.name);
  expect(names).not.toContain("_ga");
  expect(names).not.toContain("_ga_TEST");
  expect(names).toContain("_gcl_au");
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

  // Audience seule : les conversions Google Ads (clic contact) ne partent pas,
  // les pages vues virtuelles si.
  await clickWithoutFollowing(
    page,
    'footer a[href^="mailto:"]:not([data-cal-open])'
  );
  expect(await dataLayerEvents(page)).not.toContain("clic_email");
  await navigateInApp(page);
  await expect.poll(() => pageViewCount(page)).toBe(1);

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
  // Le retrait recharge la page de lui-même.
  await Promise.all([
    page.waitForEvent("load"),
    dialog.getByRole("button", { name: "Enregistrer mes choix" }).click(),
  ]);
  requests.length = 0;
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

// Zones réellement visibles dans le navigateur (descripteurs Playwright, barres
// d'adresse déduites), animations réduites pour mesurer l'état final.
const phones = [
  "iPhone 13 Mini",
  "iPhone 14",
  "iPhone 15 Pro Max",
  "Galaxy S24",
  "Pixel 7",
  "Pixel 9 Pro",
] as const;

const openHome = async (
  browser: Browser,
  baseURL: string | undefined,
  options: BrowserContextOptions
) => {
  const context = await browser.newContext({
    ...options,
    baseURL,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(banner(page)).toBeVisible();
  return { context, page };
};

for (const name of phones) {
  test(`on ${name} the banner stays compact (one block at the bottom)`, async ({
    browser,
    baseURL,
  }) => {
    const { defaultBrowserType: _, ...device } = devices[name];
    const { context, page } = await openHome(browser, baseURL, device);
    const box = await banner(page).boundingBox();
    const viewport = page.viewportSize();
    expect(box && viewport).toBeTruthy();
    if (box && viewport) {
      expect(box.height).toBeLessThanOrEqual(180);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    }
    await context.close();
  });
}

// Le bouton du hero reste visible au-dessus du bandeau là où la hauteur le
// permet (≥ 800 px visibles). Sur les écrans plus courts (iPhone, Galaxy S24),
// il passe sous le bandeau : resserrer le hero est hors de cette PR.
for (const name of ["Pixel 7", "Pixel 9 Pro"] as const) {
  test(`on ${name} the hero call to action stays above the banner`, async ({
    browser,
    baseURL,
  }) => {
    const { defaultBrowserType: _, ...device } = devices[name];
    const { context, page } = await openHome(browser, baseURL, device);
    const cta = page
      .locator("main :is(a, button)", { hasText: "Parlons de votre projet" })
      .first();
    const [bannerBox, ctaBox] = await Promise.all([
      banner(page).boundingBox(),
      cta.boundingBox(),
    ]);
    expect(bannerBox && ctaBox).toBeTruthy();
    if (bannerBox && ctaBox) {
      expect(ctaBox.y + ctaBox.height).toBeLessThanOrEqual(bannerBox.y);
    }
    await context.close();
  });
}

test("in landscape on a phone the banner stays compact", async ({
  browser,
  baseURL,
}) => {
  const { defaultBrowserType: _, ...device } = devices["iPhone 14 landscape"];
  const { context, page } = await openHome(browser, baseURL, device);
  const box = await banner(page).boundingBox();
  const viewport = page.viewportSize();
  expect(box && viewport).toBeTruthy();
  if (box && viewport) {
    expect(box.height).toBeLessThanOrEqual(viewport.height * 0.4);
  }
  await context.close();
});
