import {
  type AnimationParams,
  createTimeline,
  onScroll,
  stagger,
  type Timeline,
  utils,
} from "animejs";

// Petite couche commune au-dessus d'anime.js (seule bibliothèque d'animation
// du site, ~7 Ko gzip contre ~44 Ko pour GSAP + ScrollTrigger).
// Chaque composant décrit ses étapes ; ce module gère l'état initial,
// le déclenchement au scroll, le nettoyage des styles inline et
// prefers-reduced-motion.

export type MotionTarget = HTMLElement | null | undefined;

export interface MotionFrom {
  filter?: string;
  opacity?: number;
  rotate?: number;
  scale?: number;
  x?: number;
  y?: number;
}

export interface MotionStep {
  /** Position de départ dans la timeline, en secondes. */
  at: number;
  /** Durée de chaque élément, en secondes. */
  duration: number;
  /** Courbe anime.js (par défaut `out(3)`, l'équivalent de power3.out). */
  ease?: string;
  /** État de départ ; l'arrivée est toujours l'état naturel de l'élément. */
  from: MotionFrom;
  /** Décalage entre deux éléments, en secondes. */
  stagger?: number;
  targets: MotionTarget | MotionTarget[];
}

const NEUTRAL: Required<Omit<MotionFrom, "filter">> & { filter: string } = {
  filter: "blur(0px)",
  opacity: 1,
  rotate: 0,
  scale: 1,
  x: 0,
  y: 0,
};

const MOTION_STYLE_PROPERTIES = [
  "opacity",
  "transform",
  "visibility",
  "filter",
  "will-change",
] as const;

/** Vrai si l'utilisateur a demandé de réduire les animations. */
export const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** `querySelectorAll` typé HTMLElement, renvoyé sous forme de tableau. */
export const queryAll = (root: ParentNode, selector: string): HTMLElement[] =>
  [...root.querySelectorAll(selector)].filter(
    (element): element is HTMLElement => element instanceof HTMLElement
  );

const toElements = (targets: MotionTarget | MotionTarget[]): HTMLElement[] =>
  (Array.isArray(targets) ? targets : [targets]).filter(
    (element): element is HTMLElement => element instanceof HTMLElement
  );

/** Retire les styles inline posés par les animations. */
export const clearMotionStyles = (elements: readonly HTMLElement[]): void => {
  for (const element of elements) {
    for (const property of MOTION_STYLE_PROPERTIES) {
      element.style.removeProperty(property);
    }
  }
};

const fromValues = (from: MotionFrom) =>
  Object.fromEntries(Object.entries(from));

const toValues = (from: MotionFrom) =>
  Object.fromEntries(
    Object.keys(from).map((key) => [key, NEUTRAL[key as keyof MotionFrom]])
  );

/**
 * Lance `play` une seule fois, quand le haut de `element` atteint 80 % de la
 * hauteur de la fenêtre (ou tout de suite s'il est déjà dépassé).
 * Renvoie une fonction qui annule l'observation.
 */
export const playOnceInView = (
  element: HTMLElement,
  play: () => void
): (() => void) => {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      const entry = entries[0];
      if (!entry) return;
      if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
        currentObserver.disconnect();
        play();
      }
    },
    { rootMargin: "0px 0px -20% 0px" }
  );
  observer.observe(element);
  return () => observer.disconnect();
};

const buildTimeline = (
  steps: readonly MotionStep[],
  options: Parameters<typeof createTimeline>[0],
  defaultEase: string
): { elements: HTMLElement[]; timeline: Timeline } => {
  const timeline = createTimeline(options);
  const elements: HTMLElement[] = [];

  for (const step of steps) {
    const targets = toElements(step.targets);
    if (targets.length === 0) continue;
    elements.push(...targets);
    utils.set(targets, fromValues(step.from));
    const params: AnimationParams = {
      duration: step.duration * 1000,
      ease: step.ease ?? defaultEase,
    };
    const to = toValues(step.from);
    for (const [key, value] of Object.entries(step.from)) {
      params[key] = [value, to[key]] as [number | string, number | string];
    }
    if (step.stagger) params.delay = stagger(step.stagger * 1000);
    timeline.add(targets, params, step.at * 1000);
  }

  return { elements, timeline };
};

export interface ScrollReveal {
  /** Arrête tout et rend aux éléments leur état naturel. */
  revert: () => void;
}

/**
 * Révélation jouée une fois à l'entrée dans la fenêtre. Les éléments restent
 * dans leur état naturel si l'utilisateur préfère réduire les animations.
 */
export const createScrollReveal = (
  root: HTMLElement,
  steps: readonly MotionStep[],
  callbacks: {
    /** Pour ajouter des étapes sur mesure (compteurs, etc.). */
    extend?: (timeline: Timeline) => void;
    onBegin?: () => void;
    onComplete?: () => void;
  } = {}
): ScrollReveal => {
  let elements: HTMLElement[] = [];
  const { elements: built, timeline } = buildTimeline(
    steps,
    {
      autoplay: false,
      onBegin: () => callbacks.onBegin?.(),
      onComplete: () => {
        clearMotionStyles(elements);
        callbacks.onComplete?.();
      },
    },
    "out(3)"
  );
  elements = built;
  callbacks.extend?.(timeline);
  const stopObserving = playOnceInView(root, () => timeline.play());

  return {
    revert: () => {
      stopObserving();
      timeline.pause();
      clearMotionStyles(elements);
    },
  };
};

/**
 * Timeline synchronisée sur le scroll (équivalent du `scrub` de GSAP).
 * `enter` et `leave` désignent la position, dans la fenêtre, du haut puis du
 * bas de `root` (ex. `enter: "82%"` = le haut de root atteint 82 % de l'écran).
 */
export const createScrubTimeline = (
  root: HTMLElement,
  steps: readonly MotionStep[],
  {
    enter,
    extend,
    leave,
  }: {
    enter: string;
    /** Pour ajouter des étapes sur mesure (barre de progression, etc.). */
    extend?: (timeline: Timeline) => void;
    leave: string;
  }
): ScrollReveal => {
  const { elements, timeline } = buildTimeline(
    steps,
    {
      autoplay: onScroll({
        enter: { container: enter, target: "top" },
        leave: { container: leave, target: "bottom" },
        sync: 0.25,
        target: root,
      }),
    },
    "linear"
  );
  extend?.(timeline);

  return {
    revert: () => {
      timeline.revert();
      clearMotionStyles(elements);
    },
  };
};
