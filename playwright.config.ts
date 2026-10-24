import { defineConfig, devices } from "@playwright/test";

// Tests de bout en bout sur le site construit (`bun run build` d'abord).
// - chromium : servi par `astro preview` ; aucune requête réelle vers Google
//   ni Cal.com, les specs interceptent et comptent les appels.
// - cloudflare : servi par `wrangler dev` (runtime Workers local), seul à
//   appliquer dist/_redirects et dist/_headers comme en production.
const port = 4329;
const workersPort = 8799;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      testIgnore: /redirects\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "cloudflare",
      testMatch: /redirects\.spec\.ts/,
      use: { baseURL: `http://127.0.0.1:${workersPort}` },
    },
  ],
  webServer: [
    {
      command: `bun x astro preview --host 127.0.0.1 --port ${port}`,
      url: `http://127.0.0.1:${port}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: `bun x wrangler dev -c wrangler.e2e.jsonc --local --ip 127.0.0.1 --port ${workersPort}`,
      env: { WRANGLER_SEND_METRICS: "false" },
      url: `http://127.0.0.1:${workersPort}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
