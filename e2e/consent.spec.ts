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

const banner = (page: Page) => page.getByRole("dialog", { name: "Cookies" });

const settle = (page: Page) => page.waitForTimeout(1500);

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

test("« Accepter » loads GTM with both purposes granted", async ({ page }) => {
  const requests = await recordGoogleRequests(page);
  await page.goto("/");
  await settle(page);
  expect(requests).toEqual([]);
  await banner(page).getByRole("button", { name: "Accepter" }).click();
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

test("the GTM noscript iframe is gone", async ({ page }) => {
  await page.goto("/");
  expect(await page.content()).not.toContain("googletagmanager.com/ns.html");
});

test("on mobile the banner stays compact and leaves the hero call to action visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
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
  if (!bannerBox || !ctaBox) return;
  expect(bannerBox.height).toBeLessThan(240);
  expect(ctaBox.y + ctaBox.height).toBeLessThanOrEqual(bannerBox.y);
});
