import type { Page } from "@playwright/test";

// Aucun appel réel vers des tiers depuis les tests : Google et Cal.com sont
// interceptés et servis par un script vide. Renvoie les URL demandées.
const THIRD_PARTY_HOST =
  /(?:^|\.)(?:cal\.com|google|googletagmanager|google-analytics|googleadservices|doubleclick|gstatic)\.[a-z.]+$|^(?:app\.)?cal\.com$/;

export const stubThirdParties = async (page: Page) => {
  const requests: string[] = [];
  await page.route(
    (url) => THIRD_PARTY_HOST.test(url.hostname),
    (route) => {
      requests.push(route.request().url());
      return route.fulfill({
        body: "/* stub */",
        contentType: "text/javascript",
      });
    }
  );
  return requests;
};

// Ferme le bandeau cookies (refus) pour qu'il ne masque pas les éléments testés.
export const dismissCookieBanner = async (page: Page) => {
  const refuse = page.locator('[data-cookie-choice="denied"]');
  if (await refuse.isVisible()) await refuse.click();
};
