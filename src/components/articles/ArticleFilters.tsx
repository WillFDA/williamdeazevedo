import { useEffect, useRef, useState } from "react";

import { getTagIconSvg } from "@/lib/articleTagIcons";

const ALL_VALUE = "all";
const COMBINING_MARKS = /[\u0300-\u036F]/g;
const COLLAPSED_TAG_COUNT = 4;
const TAG_LIST_ID = "article-tag-list";

type Props = {
  pageSize: number;
  tags: string[];
};

const normalize = (value: string) =>
  value.toLowerCase().normalize("NFD").replaceAll(COMBINING_MARKS, "");

const tagButtonBaseClass =
  "pill article-tag-pill relative isolate cursor-pointer bg-transparent transition-colors duration-300 ease-out before:absolute before:inset-0 before:-z-10 before:rounded-xl before:transition-transform before:duration-500 before:ease-out hover:before:scale-[1.06] focus-visible:before:scale-[1.06] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-500";
const tagButtonActiveClass = "text-snow-50 before:bg-blue-500";
const tagButtonInactiveClass = "before:bg-snow-50";

const getAllowedValue = (value: string | null, allowedValues: string[]) =>
  value && allowedValues.includes(value) ? value : ALL_VALUE;

const getFiltersFromUrl = (tags: string[]) => {
  const params = new URLSearchParams(window.location.search);

  return {
    search: params.get("search") ?? "",
    tag: getAllowedValue(params.get("tag"), tags),
  };
};

const matchesFilters = (
  item: HTMLElement,
  query: string,
  selectedTag: string
) => {
  const title = normalize(item.dataset.title ?? "");
  const description = normalize(item.dataset.description ?? "");
  const itemTags = (item.dataset.tags ?? "").split("|").map(normalize);
  const matchesQuery =
    query.length === 0 ||
    title.includes(query) ||
    description.includes(query) ||
    itemTags.join(" ").includes(query);

  return (
    matchesQuery && (selectedTag.length === 0 || itemTags.includes(selectedTag))
  );
};

export default function ArticleFilters({ pageSize, tags }: Props) {
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState(ALL_VALUE);
  const [limit, setLimit] = useState(pageSize);
  const [isUrlReady, setIsUrlReady] = useState(false);
  const [isTagListExpanded, setIsTagListExpanded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  // Index du premier article révélé par « Voir plus », à focaliser.
  const focusIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const syncFromUrl = () => {
      const filters = getFiltersFromUrl(tags);

      setSearch(filters.search);
      setTag(filters.tag);
      setIsUrlReady(true);
    };

    syncFromUrl();

    window.addEventListener("popstate", syncFromUrl);

    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [tags]);

  useEffect(() => {
    if (!isUrlReady) return;

    const url = new URL(window.location.href);

    if (search.trim()) {
      url.searchParams.set("search", search.trim());
    } else {
      url.searchParams.delete("search");
    }

    if (tag === ALL_VALUE) {
      url.searchParams.delete("tag");
    } else {
      url.searchParams.set("tag", tag);
    }

    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextUrl !== currentUrl) {
      window.history.replaceState({}, "", nextUrl);
    }
  }, [isUrlReady, search, tag]);

  useEffect(() => {
    const root = formRef.current?.closest<HTMLElement>("[data-articles-page]");
    if (!root) return;

    const empty = root.querySelector<HTMLElement>("[data-article-empty]");
    const more = root.querySelector<HTMLElement>("[data-article-more]");
    const items = [...root.querySelectorAll<HTMLElement>("[data-article]")];
    const query = normalize(search.trim());
    const selectedTag = tag === ALL_VALUE ? "" : normalize(tag);
    // Une recherche affiche tous les résultats ; sinon on pagine.
    const max = query.length > 0 ? Number.POSITIVE_INFINITY : limit;
    let matchCount = 0;
    let revealedCount = 0;

    for (const item of items) {
      const isMatch = matchesFilters(item, query, selectedTag);
      const isVisible = isMatch && matchCount < max;
      // `data-article-overflow` masque en CSS les articles hors première page
      // avant l'hydratation ; `hidden` prend le relais.
      const wasHidden =
        item.hidden || Object.hasOwn(item.dataset, "articleOverflow");

      item.hidden = !isVisible;
      delete item.dataset.articleOverflow;

      if (isMatch && matchCount === focusIndexRef.current) {
        item.querySelector("a")?.focus();
      }
      if (isMatch) matchCount += 1;

      // Seuls les articles qui apparaissent sont animés.
      if (!(isVisible && wasHidden)) continue;

      item.style.setProperty("--article-index", String(revealedCount));
      item.classList.remove("is-filtered-in");
      void item.offsetWidth;
      item.classList.add("is-filtered-in");
      revealedCount += 1;
    }

    focusIndexRef.current = null;
    empty?.classList.toggle("hidden", matchCount > 0);
    if (more) more.hidden = matchCount <= max;
  }, [limit, search, tag]);

  useEffect(() => {
    const more = formRef.current
      ?.closest<HTMLElement>("[data-articles-page]")
      ?.querySelector<HTMLElement>("[data-article-more]");
    if (!more) return;

    const showMore = () =>
      setLimit((current) => {
        focusIndexRef.current = current;
        return current + pageSize;
      });

    more.addEventListener("click", showMore);

    return () => more.removeEventListener("click", showMore);
  }, [pageSize]);

  // Le tag actif reste visible même quand la liste est repliée.
  const visibleTags = isTagListExpanded
    ? tags
    : tags.filter(
        (tagName, index) => index < COLLAPSED_TAG_COUNT || tagName === tag
      );
  const hiddenTagCount = tags.length - visibleTags.length;
  const hasToggle = isTagListExpanded || hiddenTagCount > 0;

  return (
    <form
      aria-label="Filtrer les articles"
      className="mb-10 grid w-full max-w-4xl gap-4"
      onSubmit={(event) => event.preventDefault()}
      ref={formRef}
    >
      <div className="w-full max-w-[28rem]">
        <label className="sr-only" htmlFor="article-search">
          Rechercher un article
        </label>
        <input
          className="h-11 w-full rounded-xl bg-snow-50 px-3 text-sm font-light text-gray-900 shadow-pill placeholder:text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          id="article-search"
          name="search"
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Rechercher"
          type="search"
          value={search}
        />
      </div>
      <fieldset
        aria-label="Filtrer par tag"
        className="flex max-w-4xl min-w-0 flex-wrap gap-2"
        id={TAG_LIST_ID}
      >
        <legend className="sr-only">Filtrer par tag</legend>
        {visibleTags.map((tagName) => {
          const isActive = tag === tagName;

          return (
            <button
              aria-pressed={isActive}
              className={`${tagButtonBaseClass} ${
                isActive ? tagButtonActiveClass : tagButtonInactiveClass
              }`}
              key={tagName}
              onClick={() => setTag(isActive ? ALL_VALUE : tagName)}
              type="button"
            >
              <span
                className={`pill-icon article-tag-pill__icon ${
                  isActive ? "text-snow-50" : ""
                }`}
                // oxlint-disable-next-line react/no-danger -- SVG statiques du dépôt, pas de contenu utilisateur
                dangerouslySetInnerHTML={{ __html: getTagIconSvg(tagName) }}
              />
              {tagName}
            </button>
          );
        })}
        {hasToggle && (
          <button
            aria-controls={TAG_LIST_ID}
            aria-expanded={isTagListExpanded}
            className={`${tagButtonBaseClass} ${tagButtonInactiveClass}`}
            onClick={() => setIsTagListExpanded((isExpanded) => !isExpanded)}
            type="button"
          >
            {isTagListExpanded ? (
              "Moins"
            ) : (
              <>
                +{hiddenTagCount}
                <span className="sr-only">
                  {hiddenTagCount > 1 ? " tags" : " tag"}
                </span>
              </>
            )}
          </button>
        )}
      </fieldset>
      <style>
        {`
          .article-tag-pill__icon {
            transform-origin: 50% 55%;
          }

          @media (hover: hover) {
            .article-tag-pill:hover .article-tag-pill__icon {
              animation: article-tag-icon-jitter 620ms cubic-bezier(0.22, 1.16, 0.36, 1) both;
            }
          }

          .article-tag-pill:focus-visible .article-tag-pill__icon {
            animation: article-tag-icon-jitter 620ms cubic-bezier(0.22, 1.16, 0.36, 1) both;
          }

          @keyframes article-tag-icon-jitter {
            0%, 100% {
              transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
            }
            16% {
              transform: translate3d(0.5px, -0.5px, 0) rotate(-5deg) scale(1.04);
            }
            32% {
              transform: translate3d(-0.5px, 0.5px, 0) rotate(4deg) scale(1.02);
            }
            48% {
              transform: translate3d(0.35px, 0, 0) rotate(-3deg) scale(1.03);
            }
            68% {
              transform: translate3d(-0.2px, -0.2px, 0) rotate(2deg) scale(1.01);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .article-tag-pill::before {
              transition: none;
            }

            .article-tag-pill:hover .article-tag-pill__icon,
            .article-tag-pill:focus-visible .article-tag-pill__icon {
              animation: none;
            }
          }
        `}
      </style>
    </form>
  );
}
