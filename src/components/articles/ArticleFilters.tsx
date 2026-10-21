import { useEffect, useRef, useState } from "react";

import { getTagIconSvg } from "@/lib/articleTagIcons";

const ALL_VALUE = "all";
const COMBINING_MARKS = /[\u0300-\u036F]/g;
const COLLAPSED_TAG_COUNT = 4;
const TAG_LIST_ID = "article-tag-list";

type FilterOption = {
  label: string;
  value: string;
};

type FilterSelectProps = {
  id: string;
  label: string;
  onValueChange: (value: string) => void;
  options: FilterOption[];
  value: string;
};

type Props = {
  tags: string[];
  years: string[];
};

const normalize = (value: string) =>
  value.toLowerCase().normalize("NFD").replaceAll(COMBINING_MARKS, "");

const filterSelectClass =
  "h-11 w-full appearance-none rounded-xl border border-gray-100 bg-snow-50 px-3 pr-10 text-left text-sm font-light text-gray-900 transition-colors hover:border-gray-200 focus-visible:border-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500";
const tagButtonBaseClass =
  "article-tag-pill relative isolate inline-flex cursor-pointer items-center gap-2 rounded-xl bg-transparent px-3.5 py-2 text-sm font-normal leading-none shadow-[0_16px_34px_-23px_rgba(34,42,55,0.58)] transition-[box-shadow,color] duration-300 ease-out before:absolute before:inset-0 before:-z-10 before:rounded-xl before:transition-transform before:duration-500 before:ease-out hover:shadow-[0_24px_48px_-26px_rgba(34,42,55,0.68)] hover:before:scale-[1.06] focus-visible:shadow-[0_24px_48px_-26px_rgba(34,42,55,0.68)] focus-visible:before:scale-[1.06] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-500";
const tagButtonActiveClass = "text-snow-50 before:bg-blue-500";
const tagButtonInactiveClass = "text-gray-900 before:bg-snow-50";

const getAllowedValue = (value: string | null, allowedValues: string[]) =>
  value && allowedValues.includes(value) ? value : ALL_VALUE;

const getFiltersFromUrl = (tags: string[], years: string[]) => {
  const params = new URLSearchParams(window.location.search);

  return {
    search: params.get("search") ?? "",
    tag: getAllowedValue(params.get("tag"), tags),
    year: getAllowedValue(params.get("year"), years),
  };
};

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function FilterSelect({
  id,
  label,
  onValueChange,
  options,
  value,
}: FilterSelectProps) {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <select
        className={filterSelectClass}
        id={id}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
        <ChevronIcon />
      </span>
    </div>
  );
}

export default function ArticleFilters({ tags, years }: Props) {
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState(ALL_VALUE);
  const [year, setYear] = useState(ALL_VALUE);
  const [isUrlReady, setIsUrlReady] = useState(false);
  const [isTagListExpanded, setIsTagListExpanded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const syncFromUrl = () => {
      const filters = getFiltersFromUrl(tags, years);

      setSearch(filters.search);
      setTag(filters.tag);
      setYear(filters.year);
      setIsUrlReady(true);
    };

    syncFromUrl();

    window.addEventListener("popstate", syncFromUrl);

    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [tags, years]);

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

    if (year === ALL_VALUE) {
      url.searchParams.delete("year");
    } else {
      url.searchParams.set("year", year);
    }

    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextUrl !== currentUrl) {
      window.history.replaceState({}, "", nextUrl);
    }
  }, [isUrlReady, search, tag, year]);

  useEffect(() => {
    const root = formRef.current?.closest<HTMLElement>("[data-articles-page]");
    if (!root) return;

    const empty = root.querySelector<HTMLElement>("[data-article-empty]");
    const items = [...root.querySelectorAll<HTMLElement>("[data-article]")];
    const query = normalize(search.trim());
    const selectedTag = tag === ALL_VALUE ? "" : normalize(tag);
    const selectedYear = year === ALL_VALUE ? "" : year;
    let visibleCount = 0;

    for (const item of items) {
      const title = normalize(item.dataset.title ?? "");
      const description = normalize(item.dataset.description ?? "");
      const itemTags = (item.dataset.tags ?? "").split("|").map(normalize);
      const searchableTags = itemTags.join(" ");
      const matchesQuery =
        query.length === 0 ||
        title.includes(query) ||
        description.includes(query) ||
        searchableTags.includes(query);
      const matchesTag =
        selectedTag.length === 0 || itemTags.includes(selectedTag);
      const matchesYear =
        selectedYear.length === 0 || item.dataset.year === selectedYear;
      const isVisible = matchesQuery && matchesTag && matchesYear;

      item.hidden = !isVisible;

      if (!isVisible) continue;

      item.style.setProperty("--article-index", String(visibleCount));
      item.classList.remove("is-filtered-in");
      void item.offsetWidth;
      item.classList.add("is-filtered-in");
      visibleCount += 1;
    }

    empty?.classList.toggle("hidden", visibleCount > 0);
  }, [search, tag, year]);

  // Le tag actif reste visible même quand la liste est repliée.
  const visibleTags = isTagListExpanded
    ? tags
    : tags.filter(
        (tagName, index) => index < COLLAPSED_TAG_COUNT || tagName === tag
      );
  const hiddenTagCount = tags.length - visibleTags.length;
  const hasToggle = isTagListExpanded || hiddenTagCount > 0;

  const yearOptions = [
    { label: "Toutes les dates", value: ALL_VALUE },
    ...years.map((yearValue) => ({ label: yearValue, value: yearValue })),
  ];

  return (
    <form
      aria-label="Filtrer les articles"
      className="mb-10 grid w-full max-w-4xl gap-4"
      onSubmit={(event) => event.preventDefault()}
      ref={formRef}
    >
      <div className="grid w-full max-w-[40.5rem] grid-cols-[minmax(0,28rem)_minmax(9.5rem,11.5rem)] gap-3">
        <div>
          <label className="sr-only" htmlFor="article-search">
            Rechercher un article
          </label>
          <input
            className="h-11 w-full rounded-xl border border-gray-100 bg-snow-50 px-3 text-sm font-light text-gray-900 transition-colors placeholder:text-gray-600 hover:border-gray-200 focus-visible:border-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            id="article-search"
            name="search"
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Rechercher"
            type="search"
            value={search}
          />
        </div>
        <FilterSelect
          id="article-year"
          label="Filtrer par date"
          onValueChange={setYear}
          options={yearOptions}
          value={year}
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
                className={`article-tag-pill__icon inline-flex size-4 shrink-0 items-center justify-center *:size-full ${
                  isActive ? "text-snow-50" : "text-blue-500"
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
