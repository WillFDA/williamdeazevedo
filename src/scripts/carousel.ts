import EmblaCarousel from "embla-carousel";

type CarouselState = {
  cleanup: Array<() => void>;
  destroyed: boolean;
  started: boolean;
  wrapperNode: HTMLElement;
};

const windowWithCarousel = window as Window & {
  __wuiCarouselStates?: Set<CarouselState>;
};
const activeCarouselStates =
  windowWithCarousel.__wuiCarouselStates ?? new Set<CarouselState>();

windowWithCarousel.__wuiCarouselStates = activeCarouselStates;

const carouselStateByRoot = new WeakMap<HTMLElement, CarouselState>();

const pauseVideo = (video: HTMLVideoElement) => {
  video.dataset.carouselActive = "false";
  video.pause();
  video.currentTime = 0;
  video.preload = "none";
};

// Un rejet de `video.play()` (autoplay bloqué) ou de `animation.finished`
// (animation annulée) est attendu : le carrousel reste utilisable sans.
const ignoreExpectedRejection = () => {
  // Rejet attendu, rien à faire.
};

// Remplacé par les vraies fonctions une fois l'autoplay configuré.
const noop = () => {
  // Rien à faire tant que l'autoplay n'est pas prêt.
};

const isInViewport = (entry: IntersectionObserverEntry | undefined) =>
  Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.2);

function destroyCarousel(state: CarouselState) {
  if (state.destroyed) return;

  state.destroyed = true;
  state.cleanup.splice(0).forEach((cleanup) => cleanup());
  state.wrapperNode
    .querySelectorAll<HTMLVideoElement>("video")
    .forEach(pauseVideo);
  state.wrapperNode
    .querySelector<HTMLElement>(".embla__viewport")
    ?.classList.remove("is-ready");
  delete state.wrapperNode.dataset.initialized;
  delete state.wrapperNode.dataset.carouselAutoplayVisible;
  carouselStateByRoot.delete(state.wrapperNode);
  activeCarouselStates.delete(state);
}

export function resetCarousels() {
  Array.from(activeCarouselStates).forEach(destroyCarousel);
}

export function initCarousel(wrapperNode: HTMLElement) {
  if (carouselStateByRoot.has(wrapperNode)) return;
  if (wrapperNode.dataset.initialized === "true") return;

  const viewportNode =
    wrapperNode.querySelector<HTMLElement>(".embla__viewport");
  const prevButtonNode = wrapperNode.querySelector(".embla__prev");
  const nextButtonNode = wrapperNode.querySelector(".embla__next");
  const autoplayButtonNode = wrapperNode.querySelector<HTMLButtonElement>(
    "[data-carousel-autoplay-toggle]"
  );
  const progressNode = wrapperNode.querySelector<HTMLElement>(
    "[data-carousel-progress]"
  );

  if (!viewportNode || !prevButtonNode || !nextButtonNode) return;

  const slides = wrapperNode.querySelectorAll<HTMLElement>(".embla__slide");
  const videos = wrapperNode.querySelectorAll<HTMLVideoElement>("video");

  wrapperNode.dataset.initialized = "true";
  const state: CarouselState = {
    cleanup: [],
    destroyed: false,
    started: true,
    wrapperNode,
  };

  carouselStateByRoot.set(wrapperNode, state);
  activeCarouselStates.add(state);

  const emblaApi = EmblaCarousel(viewportNode, {
    loop: true,
    align: "center",
  });
  state.cleanup.push(() => emblaApi.destroy());
  let lastDispatchedIndex = emblaApi.selectedScrollSnap();
  let isSettled = true;
  let canUpdateVideos = true;
  let scheduleAutoplay = noop;
  let cancelAutoplay = noop;

  const syncSlideAccessibility = () => {
    const activeIndex = emblaApi.selectedScrollSnap();

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.toggleAttribute("inert", !isActive);
    });
  };

  syncSlideAccessibility();
  state.cleanup.push(() => {
    slides.forEach((slide) => {
      slide.removeAttribute("aria-hidden");
      slide.removeAttribute("inert");
    });
  });

  const playVideo = (video: HTMLVideoElement) => {
    video.dataset.carouselActive = "true";
    video.preload = "auto";

    const play = () => {
      if (video.dataset.carouselActive !== "true") return;

      void video.play().catch(ignoreExpectedRejection);
    };

    if (video.readyState < 2 && video.dataset.carouselPlayQueued !== "true") {
      video.dataset.carouselPlayQueued = "true";
      video.addEventListener(
        "loadeddata",
        () => {
          delete video.dataset.carouselPlayQueued;
          play();
        },
        { once: true }
      );
      video.load();
    }

    window.requestAnimationFrame(play);
  };

  function dispatchSlideChange() {
    const activeIndex = emblaApi.selectedScrollSnap();

    if (activeIndex !== lastDispatchedIndex) {
      const previousIndex = emblaApi.previousScrollSnap();
      const snapCount = emblaApi.scrollSnapList().length;
      const delta = (activeIndex - previousIndex + snapCount) % snapCount;
      const direction = delta <= snapCount / 2 ? "next" : "prev";

      lastDispatchedIndex = activeIndex;
      wrapperNode.dispatchEvent(
        new CustomEvent("carousel:select", {
          bubbles: true,
          detail: { direction, index: activeIndex },
        })
      );
    }
  }

  function updateVideos() {
    const activeSlide = slides[emblaApi.selectedScrollSnap()];

    videos.forEach((video) => {
      if (activeSlide?.contains(video)) {
        playVideo(video);
        return;
      }

      pauseVideo(video);
    });
  }

  emblaApi.on("select", () => {
    isSettled = false;
    syncSlideAccessibility();
    dispatchSlideChange();
  });
  emblaApi.on("settle", () => {
    isSettled = true;
    if (canUpdateVideos) updateVideos();
    scheduleAutoplay();
  });

  emblaApi.on("init", () => viewportNode.classList.add("is-ready"));

  const shouldAutoplay =
    wrapperNode.dataset.carouselAutoplay === "true" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  canUpdateVideos = !shouldAutoplay;
  if (!shouldAutoplay && "IntersectionObserver" in window) {
    canUpdateVideos = false;

    const videoObserver = new IntersectionObserver(
      (entries) => {
        canUpdateVideos = isInViewport(entries[0]);

        if (canUpdateVideos) {
          updateVideos();
        } else {
          videos.forEach(pauseVideo);
        }
      },
      { threshold: [0, 0.2] }
    );

    videoObserver.observe(wrapperNode);
    state.cleanup.push(() => videoObserver.disconnect());
  } else if (canUpdateVideos) {
    updateVideos();
  }

  const scrollPrev = () => {
    cancelAutoplay();
    emblaApi.scrollPrev();
  };
  const scrollNext = () => {
    cancelAutoplay();
    emblaApi.scrollNext();
  };
  const pauseForFocus = () => cancelAutoplay();
  const resumeAfterFocus = (event: FocusEvent) => {
    if (
      event.relatedTarget instanceof Node &&
      wrapperNode.contains(event.relatedTarget)
    ) {
      return;
    }

    scheduleAutoplay();
  };

  prevButtonNode.addEventListener("click", scrollPrev);
  nextButtonNode.addEventListener("click", scrollNext);
  wrapperNode.addEventListener("focusin", pauseForFocus);
  wrapperNode.addEventListener("focusout", resumeAfterFocus);
  state.cleanup.push(() => {
    prevButtonNode.removeEventListener("click", scrollPrev);
    nextButtonNode.removeEventListener("click", scrollNext);
    wrapperNode.removeEventListener("focusin", pauseForFocus);
    wrapperNode.removeEventListener("focusout", resumeAfterFocus);
  });

  if (shouldAutoplay) {
    let isInAutoplayZone = false;
    let isPaused = false;
    let progressAnimation: Animation | undefined;
    let progressRun = 0;
    let autoplayTimeout: number | undefined;
    const delay = Number(wrapperNode.dataset.carouselAutoplayDelay) || 4500;

    const resetProgress = () => {
      progressRun += 1;
      window.clearTimeout(autoplayTimeout);
      autoplayTimeout = undefined;
      progressAnimation?.cancel();
      progressAnimation = undefined;
      if (progressNode) progressNode.style.transform = "scaleX(0)";
    };

    const startProgress = () => {
      if (!isInAutoplayZone || isPaused) return;

      resetProgress();
      const currentRun = progressRun;

      const scrollIfCurrent = () => {
        if (
          state.destroyed ||
          currentRun !== progressRun ||
          !document.contains(wrapperNode) ||
          !isInAutoplayZone ||
          isPaused
        ) {
          return;
        }

        if (progressNode) progressNode.style.transform = "scaleX(1)";
        emblaApi.scrollNext();
      };

      if (!progressNode) {
        autoplayTimeout = window.setTimeout(scrollIfCurrent, delay);
        return;
      }

      progressAnimation = progressNode.animate(
        [
          { transform: "scaleX(0)", offset: 0 },
          { transform: "scaleX(1)", offset: 0.94 },
          { transform: "scaleX(1)", offset: 1 },
        ],
        {
          duration: delay,
          easing: "linear",
          fill: "forwards",
        }
      );

      progressAnimation.finished.then(scrollIfCurrent).catch(ignoreExpectedRejection);
    };

    const syncPausedUi = () => {
      autoplayButtonNode?.setAttribute("aria-pressed", String(isPaused));
      autoplayButtonNode?.setAttribute(
        "aria-label",
        isPaused ? "Relancer le carousel" : "Mettre le carousel en pause"
      );
    };

    const clearAutoplay = () => {
      resetProgress();
    };
    const toggleUserPaused = () => {
      isPaused = !isPaused;
      scheduleAutoplay();
    };

    scheduleAutoplay = () => {
      syncPausedUi();
      if (state.destroyed || !isInAutoplayZone || isPaused) {
        clearAutoplay();
        return;
      }

      startProgress();
    };
    cancelAutoplay = clearAutoplay;
    emblaApi.on("pointerDown", cancelAutoplay);

    const autoplayObserver = new IntersectionObserver(
      (entries) => {
        const nextIsInAutoplayZone = isInViewport(entries[0]);

        if (nextIsInAutoplayZone === isInAutoplayZone) return;

        isInAutoplayZone = nextIsInAutoplayZone;
        canUpdateVideos = isInAutoplayZone;
        wrapperNode.dataset.carouselAutoplayVisible = String(isInAutoplayZone);

        if (isInAutoplayZone) {
          updateVideos();
          if (isSettled) scheduleAutoplay();
        } else {
          clearAutoplay();
          videos.forEach(pauseVideo);
        }
      },
      { threshold: [0, 0.2] }
    );

    autoplayObserver.observe(wrapperNode);
    syncPausedUi();
    state.cleanup.push(() => {
      autoplayObserver.disconnect();
      resetProgress();
    });

    autoplayButtonNode?.addEventListener("click", toggleUserPaused);
    state.cleanup.push(() => {
      autoplayButtonNode?.removeEventListener("click", toggleUserPaused);
    });
  }
}
