// Vérifie public/_headers (ou le fichier passé en argument) : en-têtes de
// sécurité sur /*, origines du site dans la CSP Report-Only, et fichiers
// racine ciblés par une règle présents dans public/.
import { existsSync, readFileSync } from "node:fs";

const PUBLIC_DIR = new URL("../public/", import.meta.url);
const file = process.argv[2] ?? new URL("_headers", PUBLIC_DIR).pathname;

const sources = (name, csp = "") =>
  csp
    .split(";")
    .map((directive) => directive.trim().split(/\s+/))
    .find(([directive]) => directive === name)
    ?.slice(1) ?? [];
const REQUIRED_ON_ALL = {
  "Strict-Transport-Security": [
    "max-age >= 31536000; includeSubDomains",
    (v) =>
      Number(/max-age=(?<age>\d+)/i.exec(v)?.groups.age) >= 31_536_000 &&
      /\bincludeSubDomains\b/i.test(v),
  ],
  "X-Content-Type-Options": ["nosniff", (v) => v === "nosniff"],
  "Referrer-Policy": ["une valeur", Boolean],
  "Permissions-Policy": ["une valeur", Boolean],
  "X-Frame-Options": ["DENY", (v) => v === "DENY"],
  "Content-Security-Policy": [
    "frame-ancestors 'none'",
    (v) => sources("frame-ancestors", v).join(" ") === "'none'",
  ],
};
// Chargées par src/scripts/consent.ts (GTM) et src/components/CalDrawer.astro.
const SITE_ORIGINS = [
  ["script-src", "https://www.googletagmanager.com"],
  ["script-src", "https://app.cal.com"],
  ["frame-src", "https://app.cal.com"],
];

const rules = new Map();
let headers;
for (const line of readFileSync(file, "utf-8").split("\n")) {
  if (!line.trim() || line.trimStart().startsWith("#")) continue;
  if (!/^\s/.test(line)) {
    headers = rules.get(line.trim()) ?? new Map();
    rules.set(line.trim(), headers);
    continue;
  }
  const colon = line.indexOf(":");
  const name = line.slice(0, colon).trim().toLowerCase();
  const value = line.slice(colon + 1).trim();
  // Cloudflare joint par une virgule un en-tête défini deux fois.
  headers.set(name, [headers.get(name), value].filter(Boolean).join(", "));
}

const errors = [];
const all = rules.get("/*") ?? new Map();
for (const [name, [expected, isValid]] of Object.entries(REQUIRED_ON_ALL)) {
  const value = all.get(name.toLowerCase());
  if (!(value && isValid(value))) {
    errors.push(`/* ${name} : attendu ${expected}, trouvé ${value || "rien"}`);
  }
}
const reportOnly = all.get("content-security-policy-report-only");
for (const [name, origin] of SITE_ORIGINS) {
  if (!sources(name, reportOnly).includes(origin)) {
    errors.push(`/* CSP Report-Only : ${name} n'autorise pas ${origin}`);
  }
}
for (const path of rules.keys()) {
  const isRootFile = /^\/[^/*:]+$/.test(path);
  if (isRootFile && !existsSync(new URL(`.${path}`, PUBLIC_DIR))) {
    errors.push(`${path} : la règle cible public${path}, qui n'existe pas`);
  }
}

if (errors.length > 0) {
  console.error(`✗ ${file}\n  - ${errors.join("\n  - ")}`);
  process.exit(1);
}
console.log(`OK: ${file} (${rules.size} règles)`);
