const observerByDocument = new WeakMap<Document, IntersectionObserver>();

function secondsToMs(value: string) {
  const trimmed = value.trim();
  if (trimmed.endsWith("ms")) return Number.parseFloat(trimmed);
  if (trimmed.endsWith("s")) return Number.parseFloat(trimmed) * 1000;
  return Number.parseFloat(trimmed) || 0;
}

function getLongestTransitionMs(element: HTMLElement) {
  const styles = window.getComputedStyle(element);
  const durations = styles.transitionDuration.split(",").map(secondsToMs);
  const delays = styles.transitionDelay.split(",").map(secondsToMs);
  let longest = 0;

  for (let index = 0; index < durations.length; index += 1) {
    const duration = durations[index] ?? 0;
    const delay = delays[index] ?? delays.at(-1) ?? 0;
    longest = Math.max(longest, duration + delay);
  }

  return longest;
}

function completeReveal(element: HTMLElement) {
  element.classList.add("is-reveal-complete");
}

function revealElement(element: HTMLElement) {
  element.classList.add("is-visible");

  const longestTransitionMs = getLongestTransitionMs(element);

  if (longestTransitionMs <= 0) {
    completeReveal(element);
    return;
  }

  const timeout = window.setTimeout(
    () => completeReveal(element),
    longestTransitionMs + 80
  );

  element.addEventListener(
    "transitionend",
    (event) => {
      if (event.target !== element) return;
      window.clearTimeout(timeout);
      completeReveal(element);
    },
    { once: true }
  );
}

export function initFadeInAnimations(root: Document) {
  if (!("IntersectionObserver" in window)) {
    root
      .querySelectorAll<HTMLElement>("[data-reveal-on-scroll]")
      .forEach(revealElement);
    return;
  }

  let observer = observerByDocument.get(root);

  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;
          revealElement(element);
          observer?.unobserve(element);
        });
      },
      { rootMargin: "0px 0px 10% 0px", threshold: 0.01 }
    );

    observerByDocument.set(root, observer);
  }

  root
    .querySelectorAll<HTMLElement>("[data-reveal-on-scroll]:not(.is-visible)")
    .forEach((element) => observer.observe(element));
}

// An IntersectionObserver holds strong references to every element it observes.
// Below-the-fold reveals that never intersected are still observed when the page
// is swapped out, so without this the observer would retain detached nodes from
// every visited page. Disconnect on astro:before-swap; initFadeInAnimations
// recreates a fresh observer on the next astro:page-load.
export function resetFadeInAnimations(root: Document) {
  const observer = observerByDocument.get(root);
  if (!observer) return;

  observer.disconnect();
  observerByDocument.delete(root);
}
