import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { dismissCookieBanner, stubThirdParties } from "./helpers";

const PAGES = [
  "/",
  "/creation-site-vitrine/",
  "/articles/",
  "/articles/seo-local/",
  "/realisations/",
  "/tarifs/",
  "/about/",
];

for (const path of PAGES) {
  test(`axe : aucune violation WCAG 2.1 A/AA sur ${path}`, async ({ page }) => {
    await stubThirdParties(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await dismissCookieBanner(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const summary = results.violations.map(
      (violation) =>
        `${violation.id} (${violation.impact}) : ${violation.nodes
          .slice(0, 3)
          .map((node) => node.target.join(" "))
          .join(" | ")}`
    );
    expect(summary).toEqual([]);
  });
}
