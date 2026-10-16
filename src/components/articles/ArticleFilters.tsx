import { useEffect, useRef, useState } from "react";

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

type TagIconProps = {
  className?: string;
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

function BadgeDollarIcon({ className }: TagIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="currentColor">
        <path
          d="m9.001,16.999c-1.0972,0-2.1138-.5674-2.7065-1.4644-1.0518.2148-2.1738-.1021-2.9497-.8784-.7754-.7754-1.0928-1.8955-.8779-2.9497-.8975-.5933-1.4648-1.6094-1.4648-2.7065s.5674-2.1138,1.4648-2.707c-.2148-1.0537.1025-2.1738.8779-2.9492.7759-.7769,1.897-1.0938,2.9497-.8784.5933-.897,1.6099-1.4644,2.7065-1.4644s2.1138.5674,2.7065,1.4644c1.0542-.2144,2.1743.1021,2.9497.8784.7754.7754,1.0928,1.8955.8779,2.9497.8975.5933,1.4648,1.6094,1.4648,2.7065s-.5674,2.1138-1.4644,2.7065c.2153,1.0537-.1025,2.1738-.8784,2.9497s-1.8965,1.0923-2.9497.8779c-.5933.8975-1.6094,1.4648-2.7065,1.4648Z"
          opacity=".4"
        />
        <path d="m11.75,10.375c0-1.1719-.9531-2.125-2.125-2.125h-1.25c-.3447,0-.625-.2803-.625-.625s.2803-.625.625-.625h2.375c.4141,0,.75-.3359.75-.75s-.3359-.75-.75-.75h-1v-.25c0-.4141-.3359-.75-.75-.75s-.75.3359-.75.75v.2627c-1.1127.0659-2,.9832-2,2.1123,0,1.1719.9531,2.125,2.125,2.125h1.25c.3447,0,.625.2803.625.625s-.2803.625-.625.625h-2.375c-.4141,0-.75.3359-.75.75s.3359.75.75.75h1v.25c0,.4141.3359.75.75.75s.75-.3359.75-.75v-.2627c1.1128-.0659,2-.9832,2-2.1123Z" />
      </g>
    </svg>
  );
}

function BoltSpeedIcon({ className }: TagIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="currentColor">
        <path d="M4.00012 9.75H0.750122C0.336122 9.75 0.00012207 9.414 0.00012207 9C0.00012207 8.586 0.336122 8.25 0.750122 8.25H4.00012C4.41412 8.25 4.75012 8.586 4.75012 9C4.75012 9.414 4.41412 9.75 4.00012 9.75Z" />
        <path d="M5.25012 6.5H3.25012C2.83612 6.5 2.50012 6.164 2.50012 5.75C2.50012 5.336 2.83612 5 3.25012 5H5.25012C5.66412 5 6.00012 5.336 6.00012 5.75C6.00012 6.164 5.66412 6.5 5.25012 6.5Z" />
        <path d="M5.25012 13H3.25012C2.83612 13 2.50012 12.664 2.50012 12.25C2.50012 11.836 2.83612 11.5 3.25012 11.5H5.25012C5.66412 11.5 6.00012 11.836 6.00012 12.25C6.00012 12.664 5.66412 13 5.25012 13Z" />
        <path
          d="M17.2231 7.53106C17.0491 7.20306 16.7101 7.00006 16.3401 7.00006H12.4301L13.1481 2.15406C13.2171 1.69406 12.9611 1.25506 12.5281 1.08606C12.0941 0.919057 11.6101 1.07006 11.3491 1.45506L5.9521 9.44306C5.7451 9.75006 5.72409 10.1451 5.89909 10.4721C6.07309 10.7991 6.41111 11.0021 6.78211 11.0021H10.6921L9.9731 15.8501C9.9061 16.3101 10.1611 16.7491 10.5951 16.9171C10.7131 16.9631 10.8351 16.9851 10.9551 16.9851C11.2751 16.9851 11.5831 16.8281 11.7721 16.5481L17.1681 8.56206C17.3761 8.25506 17.3971 7.86006 17.2231 7.53306V7.53106Z"
          fillOpacity=".4"
        />
      </g>
    </svg>
  );
}

function SparkleIcon({ className }: TagIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="currentColor">
        <path d="M5.65802 2.98996L4.39502 2.56894L3.97402 1.30606C3.83702 0.898061 3.16202 0.898061 3.02502 1.30606L2.60402 2.56894L1.34103 2.98996C1.13703 3.05796 0.999023 3.24896 0.999023 3.46396C0.999023 3.67896 1.13703 3.86996 1.34103 3.93796L2.60402 4.35898L3.02502 5.62198C3.09302 5.82598 3.28502 5.96396 3.50002 5.96396C3.71502 5.96396 3.90602 5.82598 3.97502 5.62198L4.39603 4.35898L5.65902 3.93796C5.86302 3.86996 6.00102 3.67896 6.00102 3.46396C6.00102 3.24896 5.86202 3.05796 5.65802 2.98996Z" />
        <path
          clipRule="evenodd"
          d="M9.50007 2C9.80783 2.00003 10.0843 2.18808 10.1975 2.47429L11.99 7.00903L16.5258 8.80255C16.812 8.91571 17 9.19224 17 9.5C17 9.80776 16.812 10.0843 16.5258 10.1975L11.99 11.9909L10.1975 16.5257C10.0843 16.8119 9.80783 17 9.50007 17C9.1923 17 8.91575 16.812 8.80256 16.5258L7.00905 11.991L2.47417 10.1974C2.18799 10.0843 2 9.80774 2 9.5C2 9.19226 2.18799 8.91575 2.47417 8.80256L7.00905 7.00903L8.80256 2.47417C8.91575 2.18797 9.1923 1.99997 9.50007 2Z"
          fillOpacity=".4"
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

function StarIcon({ className }: TagIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.963,6.786c-.088-.271-.323-.469-.605-.51l-4.62-.671L9.672,1.418c-.252-.512-1.093-.512-1.345,0l-2.066,4.186-4.62,.671c-.282,.041-.517,.239-.605,.51-.088,.271-.015,.57,.19,.769l3.343,3.258-.79,4.601c-.048,.282,.067,.566,.298,.734,.231,.167,.538,.189,.79,.057l4.132-2.173,4.132,2.173c.11,.058,.229,.086,.349,.086,.155,0,.31-.048,.441-.143,.231-.168,.347-.452,.298-.734l-.79-4.601,3.343-3.258c.205-.199,.278-.498,.19-.769Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TargetIcon({ className }: TagIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="currentColor">
        <path
          d="M8.99658 1C4.5783 1 0.996582 4.58172 0.996582 9C0.996582 13.4183 4.5783 17 8.99658 17C13.4149 17 16.9966 13.4183 16.9966 9C16.9966 4.58172 13.4149 1 8.99658 1Z"
          fillOpacity=".4"
        />
        <path d="M14.1723 0.270078C14.4253 0.329799 14.6293 0.51625 14.7115 0.762844L15.3429 2.65709L17.2372 3.2885C17.4838 3.3707 17.6702 3.57472 17.73 3.8277C17.7897 4.08068 17.7142 4.34654 17.5303 4.53034L15.0303 7.03034C14.8295 7.23122 14.5324 7.30136 14.2628 7.21153L12.4526 6.6081L9.53033 9.53033C9.23744 9.82322 8.76256 9.82322 8.46967 9.53033C8.17678 9.23744 8.17678 8.76256 8.46967 8.46967L11.3919 5.54742L10.7885 3.73719C10.6987 3.46768 10.7688 3.17056 10.9697 2.96968L13.4697 0.469685C13.6535 0.285884 13.9194 0.210358 14.1723 0.270078Z" />
        <path
          clipRule="evenodd"
          d="M9.50581 4.71456C9.52914 5.12812 9.2128 5.48228 8.79924 5.50561C6.96024 5.60933 5.5 7.1347 5.5 9.00002C5.5 10.9327 7.06723 12.5 9 12.5C10.8652 12.5 12.3906 11.0399 12.4944 9.20098C12.5177 8.78742 12.8719 8.47109 13.2855 8.49444C13.699 8.51778 14.0153 8.87196 13.992 9.28552C13.8436 11.9142 11.6654 14 9 14C6.23878 14 4 11.7611 4 9.00002C4 6.33454 6.08597 4.15626 8.71477 4.00799C9.12832 3.98466 9.48249 4.301 9.50581 4.71456Z"
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

function WindowPointerIcon({ className }: TagIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="currentColor">
        <path
          d="M17.0001 10.5205L11.8884 8.6532C9.90227 7.94296 7.92774 9.86636 8.64764 11.8856L10.1507 16H3.75006C2.23136 16 1.00006 14.7686 1.00006 13.25V7H17.0001V10.5205Z"
          fillOpacity=".4"
        />
        <path
          clipRule="evenodd"
          d="M10.0605 11.3819C9.77093 10.5695 10.574 9.7762 11.3833 10.0656L17.3221 12.2351C18.244 12.5691 18.2194 13.8877 17.2823 14.1846L14.9326 14.9364L14.1795 17.2913C13.8828 18.2069 12.5724 18.2599 12.2324 17.3269"
          fillRule="evenodd"
        />
        <path d="M14.2501 2H3.75006C2.23346 2 1.00006 3.2334 1.00006 4.75V7H17.0001V4.75C17.0001 3.2334 15.7667 2 14.2501 2ZM3.50006 5.5C2.94776 5.5 2.50006 5.0522 2.50006 4.5C2.50006 3.9478 2.94776 3.5 3.50006 3.5C4.05236 3.5 4.50006 3.9478 4.50006 4.5C4.50006 5.0522 4.05226 5.5 3.50006 5.5ZM6.50006 5.5C5.94776 5.5 5.50006 5.0522 5.50006 4.5C5.50006 3.9478 5.94776 3.5 6.50006 3.5C7.05236 3.5 7.50006 3.9478 7.50006 4.5C7.50006 5.0522 7.05226 5.5 6.50006 5.5Z" />
      </g>
    </svg>
  );
}

function getTagIcon(tag: string) {
  const normalizedTag = tag.toLowerCase();

  if (normalizedTag.includes("pricing")) return BadgeDollarIcon;
  if (normalizedTag.includes("conversion")) return TargetIcon;
  if (normalizedTag.includes("ia")) return SparkleIcon;
  if (normalizedTag.includes("motivation")) return StarIcon;
  if (normalizedTag.includes("side")) return BoltSpeedIcon;

  return WindowPointerIcon;
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
          const TagIcon = getTagIcon(tagName);

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
                className={`article-tag-pill__icon inline-flex size-4 shrink-0 items-center justify-center ${
                  isActive ? "text-snow-50" : "text-blue-500"
                }`}
              >
                <TagIcon className="size-full" />
              </span>
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
