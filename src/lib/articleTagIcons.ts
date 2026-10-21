import accessibility from "@/components/icons/nucleo/accessibility-fill.svg?raw";
import badgeDollar from "@/components/icons/nucleo/badge-dollar-fill.svg?raw";
import clipboardCheck from "@/components/icons/nucleo/clipboard-check-fill.svg?raw";
import earth from "@/components/icons/nucleo/earth-fill.svg?raw";
import envelope from "@/components/icons/nucleo/envelope-fill.svg?raw";
import location from "@/components/icons/nucleo/location-2-fill.svg?raw";
import lock from "@/components/icons/nucleo/lock-fill.svg?raw";
import msgSmile from "@/components/icons/nucleo/msg-smile-fill.svg?raw";
import rocket from "@/components/icons/nucleo/rocket-fill.svg?raw";
import searchContent from "@/components/icons/nucleo/search-content-2-fill.svg?raw";
import shieldCheck from "@/components/icons/nucleo/shield-check-fill.svg?raw";
import shop from "@/components/icons/nucleo/shop-fill.svg?raw";
import sitemap from "@/components/icons/nucleo/sitemap-4-fill.svg?raw";
import sparkle from "@/components/icons/nucleo/sparkle-3-fill.svg?raw";
import star from "@/components/icons/nucleo/star-fill.svg?raw";
import suitcase from "@/components/icons/nucleo/suitcase-3-fill.svg?raw";
import target from "@/components/icons/nucleo/target-fill.svg?raw";
import unorderedList from "@/components/icons/nucleo/unordered-list-fill.svg?raw";
import viewAll from "@/components/icons/nucleo/view-all-fill.svg?raw";
import windowPaintbrush from "@/components/icons/nucleo/window-paintbrush-fill.svg?raw";
import windowPointer from "@/components/icons/nucleo/window-pointer-fill.svg?raw";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[̀-ͯ]/g, "");

// Clés normalisées (minuscules, sans accents). Tag absent → window-pointer.
const TAG_ICONS: Record<string, string> = {
  accessibilite: accessibility,
  arborescence: sitemap,
  "avis clients": msgSmile,
  budget: badgeDollar,
  "cahier des charges": unorderedList,
  conformite: clipboardCheck,
  conversion: target,
  "formulaire de contact": envelope,
  ia: sparkle,
  "landing page": rocket,
  motivation: star,
  "plan de site": sitemap,
  pricing: badgeDollar,
  realisations: viewAll,
  "referencement local": location,
  refonte: windowPaintbrush,
  rgpd: shieldCheck,
  securite: lock,
  seo: searchContent,
  "site vitrine": shop,
  "site web": earth,
  tpe: suitcase,
};

export const getTagIconSvg = (tag: string) =>
  TAG_ICONS[normalize(tag)] ?? windowPointer;
