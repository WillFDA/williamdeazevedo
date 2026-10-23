import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { dismissCookieBanner, stubThirdParties } from "./helpers";

const PAGES = [
  "/",
  "/creation-site-vitrine/",
  "/services/",
  "/articles/",
  "/articles/seo-local/",
  "/realisations/",
  "/tarifs/",
  "/about/",
  "/mentions-legales/",
  "/page-qui-n-existe-pas/",
];

const VIEWPORTS = [
  { height: 900, name: "bureau", width: 1280 },
  { height: 667, name: "375 px", width: 375 },
  { height: 640, name: "320 px", width: 320 },
];

async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    // Scènes animées des cartes Services : illustrations décoratives
    // (aria-hidden), leur micro-texte est exempté du contraste (WCAG 1.4.3).
    .exclude("[data-bento-visual]")
    .analyze();
  const summary = results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact}) : ${violation.nodes
        .slice(0, 3)
        .map((node) => node.target.join(" "))
        .join(" | ")}`
  );
  expect(summary).toEqual([]);
}

async function openPage(page: Page, path: string) {
  await stubThirdParties(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(path);
  await dismissCookieBanner(page);
}

for (const viewport of VIEWPORTS) {
  test.describe(`axe ${viewport.name}`, () => {
    test.use({ viewport: { height: viewport.height, width: viewport.width } });

    for (const path of PAGES) {
      test(`aucune violation WCAG 2.1 A/AA sur ${path}`, async ({ page }) => {
        await openPage(page, path);
        await expectNoViolations(page);
      });
    }
  });
}

test.describe("axe sur les états ouverts", () => {
  test("menu mobile ouvert (375 px)", async ({ page }) => {
    await page.setViewportSize({ height: 667, width: 375 });
    await openPage(page, "/");
    await page.locator("[data-mobile-menu-button]").click();
    await expect(page.locator("[data-mobile-menu]")).toBeVisible();
    await expectNoViolations(page);
  });

  test("menu Services ouvert (bureau)", async ({ page }) => {
    await page.setViewportSize({ height: 900, width: 1280 });
    await openPage(page, "/");
    await page.locator("[data-nav-dropdown] .nav-link--dropdown").hover();
    await expect(
      page.locator("[data-nav-dropdown] .nav-dropdown__panel")
    ).toHaveCSS("opacity", "1");
    await expectNoViolations(page);
  });

  test("tiroir Cal.com ouvert", async ({ page }) => {
    await openPage(page, "/");
    await page.locator("[data-cal-open]").first().click();
    await expect(
      page.getByRole("dialog", { name: "Planifier un créneau" })
    ).toBeVisible();
    await expectNoViolations(page);
  });
});
