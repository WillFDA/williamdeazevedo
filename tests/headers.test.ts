import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dir, "..");
const headersFile = readFileSync(path.join(root, "public/_headers"), "utf-8");

// Lit public/_headers : un chemin en début de ligne, puis ses en-têtes indentés.
const parseHeaders = (source: string): Map<string, Map<string, string>> => {
  const rules = new Map<string, Map<string, string>>();
  let current: Map<string, string> | undefined;
  for (const line of source.split("\n")) {
    if (line.trim() === "" || line.trimStart().startsWith("#")) {
      continue;
    }
    if (/^\S/u.test(line)) {
      current = new Map();
      rules.set(line.trim(), current);
      continue;
    }
    const separator = line.indexOf(":");
    current?.set(
      line.slice(0, separator).trim().toLowerCase(),
      line.slice(separator + 1).trim()
    );
  }
  return rules;
};

const parseCsp = (policy: string): Map<string, string[]> =>
  new Map(
    policy
      .split(";")
      .map((directive) => directive.trim().split(/\s+/u))
      .filter((parts) => parts[0])
      .map(([name = "", ...sources]) => [name, sources])
  );

// Vrai si une source CSP (origine exacte ou https://*.domaine) couvre l'URL.
const allows = (sources: string[], url: string): boolean => {
  const { host, protocol } = new URL(url);
  return sources.some((source) => {
    if (!source.startsWith(`${protocol}//`)) {
      return false;
    }
    const sourceHost = source.slice(protocol.length + 2);
    return sourceHost.startsWith("*.")
      ? host.endsWith(sourceHost.slice(1))
      : host === sourceHost;
  });
};

const listFiles = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(?:astro|ts)$/u.test(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name));

const allHeaders = parseHeaders(headersFile).get("/*");
const reportOnly = parseCsp(
  allHeaders?.get("content-security-policy-report-only") ?? ""
);

describe("public/_headers", () => {
  test("serves the security headers on every path", () => {
    expect(allHeaders?.get("strict-transport-security")).toBe(
      "max-age=31536000"
    );
    expect(allHeaders?.get("x-content-type-options")).toBe("nosniff");
    expect(allHeaders?.get("referrer-policy")).toBe(
      "strict-origin-when-cross-origin"
    );
    expect(allHeaders?.get("x-frame-options")).toBe("DENY");
    expect(allHeaders?.get("permissions-policy")).toContain("camera=()");
  });

  test("enforces frame-ancestors outside the Report-Only policy", () => {
    expect(allHeaders?.get("content-security-policy")).toBe(
      "frame-ancestors 'none'"
    );
  });

  test("Report-Only policy covers the third-party scripts the site loads", () => {
    const scriptSrc = reportOnly.get("script-src") ?? [];
    for (const url of [
      "https://www.googletagmanager.com/gtm.js?id=GTM-TCZVQQ29",
      "https://app.cal.com/embed/embed.js",
      "https://analytics.williamdeazevedo.fr/api/script.js",
    ]) {
      expect(allows(scriptSrc, url)).toBe(true);
    }
    expect(
      allows(
        reportOnly.get("frame-src") ?? [],
        "https://app.cal.com/william/rdv"
      )
    ).toBe(true);
    expect(
      allows(
        reportOnly.get("connect-src") ?? [],
        "https://region1.google-analytics.com/g/collect"
      )
    ).toBe(true);
  });

  test("img-src covers every remote image referenced in src/", () => {
    const imgSrc = reportOnly.get("img-src") ?? [];
    const remoteImages = listFiles(path.join(root, "src")).flatMap((file) =>
      [
        ...readFileSync(file, "utf-8").matchAll(
          /["'`](?<url>https:\/\/[^"'`\s]+\.(?:avif|gif|jpe?g|png|svg|webp))["'`]/gu
        ),
      ].map((match) => match.groups?.url ?? "")
    );
    for (const url of remoteImages) {
      expect({ url, allowed: allows(imgSrc, url) }).toEqual({
        url,
        allowed: true,
      });
    }
  });
});
