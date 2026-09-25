import React, { useEffect, useMemo, useState } from "react";
import { Building2, BedDouble, Bath, Car, Ruler, Maximize2, Calendar } from "lucide-react";
import { api, API_BASE_URL } from "../../api.js";

const PROPERTY_IMAGE_FALLBACK = "/properties/origin.jpg";

const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;
  return url;
};

const getCardsPerPage = (width) => {
  if (width >= 1280) return 3;
  if (width >= 768) return 2;
  return 1;
};

const PropertyCard = ({ p }) => {
  const [imageSrc, setImageSrc] = useState(() => resolveUrl(p.image || p.fallbackImage || PROPERTY_IMAGE_FALLBACK));

  useEffect(() => {
    setImageSrc(resolveUrl(p.image || p.fallbackImage || PROPERTY_IMAGE_FALLBACK));
  }, [p.image, p.fallbackImage]);

  const handleImageError = (event) => {
    const fallbackSrc = resolveUrl(p.fallbackImage || PROPERTY_IMAGE_FALLBACK);
    if (event.currentTarget.src !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      return;
    }

    if (fallbackSrc !== resolveUrl(PROPERTY_IMAGE_FALLBACK)) {
      setImageSrc(resolveUrl(PROPERTY_IMAGE_FALLBACK));
    }
  };

  const Stat = ({ icon: Icon, label, value }) => (
    <div className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-2.5 px-4 py-3.5 text-left">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] leading-tight text-gray-500">{label}</div>
        <div className="break-words text-sm font-semibold leading-tight text-gray-900">{value ?? "—"}</div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm animate-fadeInUp">
      <div className="h-[260px] w-full overflow-hidden bg-gray-100">
        <img src={imageSrc} alt={p.address} className="h-full w-full object-cover" onError={handleImageError} />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="text-center text-[15px] font-semibold leading-snug text-gray-900 md:text-base">
          {p.address}
        </div>

        <div className="mt-4 flex-1">
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200">
              <Stat icon={Building2} label="Type" value={p.type} />
              <Stat icon={BedDouble} label="Bedrooms" value={p.bedrooms} />
            </div>
            <div className="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200">
              <Stat icon={Bath} label="Bathrooms" value={p.bathrooms} />
              <Stat icon={Car} label="Parking" value={p.parking} />
            </div>
            <div className="grid grid-cols-2 divide-x divide-gray-200">
              <Stat icon={Ruler} label="Square Feet" value={p.squareFeet} />
              <Stat icon={Maximize2} label="Lot Size" value={p.lotSize} />
            </div>
          </div>
        </div>

        <div className="mt-5 text-center">
          <a
            href={`/${p.slug}`}
            className="inline-block rounded bg-black px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            View More
          </a>
        </div>
      </div>
    </div>
  );
};

// Green status pill + acquired-date pill shown under the strategy label
const PropertyBadges = ({ p }) => {
  if (!p?.holdingStatus && !p?.acquiredLabel) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-2 pb-1">
      {p.holdingStatus ? (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1 text-[12px] font-medium text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          {p.holdingStatus}
        </span>
      ) : null}
      {p.acquiredLabel ? (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[12px] font-medium text-gray-700">
          <Calendar className="h-3.5 w-3.5" />
          Acquired {p.acquiredLabel}
        </span>
      ) : null}
    </div>
  );
};

export default function PropertyColumnsSection({ data }) {
  const [properties, setProperties] = useState([]);
  const [activePropertyIndexes, setActivePropertyIndexes] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(() =>
    typeof window === "undefined" ? 3 : getCardsPerPage(window.innerWidth)
  );
  const autoScrollEnabled = data?.autoScroll === true || data?.autoScroll === "true";

  const normalizeColumnProperties = (entry, itemIndex) => {
    if (Array.isArray(entry?.properties) && entry.properties.length) {
      return entry.properties
        .map((property, propertyIndex) => ({
          id: property?.id || `${entry?.id || `property-column-${itemIndex + 1}`}-property-${propertyIndex + 1}`,
          slug: property?.slug || "",
          image: property?.image || "",
        }))
        .filter((property) => property.slug || property.image);
    }

    if (entry?.slug || entry?.image) {
      return [
        {
          id: `${entry?.id || `property-column-${itemIndex + 1}`}-property-1`,
          slug: entry?.slug || "",
          image: entry?.image || "",
        },
      ].filter((property) => property.slug || property.image);
    }

    return [];
  };

  useEffect(() => {
    api.getProperties().then(setProperties).catch(() => setProperties([]));
  }, []);

  const legacyPropertyMappings = Object.entries(data?.mapping || {});
  const configuredItems =
    Array.isArray(data?.items) && data.items.length
      ? data.items.map((item, index) => ({
          id: item?.id || `property-column-${index + 1}`,
          label: item?.label || "",
          properties: normalizeColumnProperties(item, index),
        }))
      : (data?.columns || []).map((label, index) => {
          const entry = data?.mapping?.[label] ?? legacyPropertyMappings[index]?.[1];
          const propertyEntries = Array.isArray(entry) ? entry : entry ? [entry] : [];
          return {
            id: `property-column-${index + 1}`,
            label,
            properties: propertyEntries
              .map((property, propertyIndex) => ({
                id: `property-column-${index + 1}-property-${propertyIndex + 1}`,
                slug: typeof property === "string" ? property : property?.slug || "",
                image: typeof property === "object" ? property?.image || "" : "",
              }))
              .filter((property) => property.slug || property.image),
          };
        });
  const configuredSlugs = new Set(
    configuredItems.reduce((acc, item) => {
      (item.properties || []).forEach((property) => {
        if (property.slug) {
          acc.push(property.slug);
        }
      });
      return acc;
    }, [])
  );
  const autoIncludedItems = properties
    .filter((property) => property?.slug && !configuredSlugs.has(property.slug))
    .map((property, index) => ({
      id: property._id || `auto-property-${index + 1}`,
      label: property.title || property.address || `Property ${index + 1}`,
      properties: [
        {
          id: `${property._id || `auto-property-${index + 1}`}-property-1`,
          slug: property.slug,
          image: property.heroImage || "",
        },
      ],
    }));
  const items = configuredItems.length > 0 ? [...configuredItems, ...autoIncludedItems] : autoIncludedItems;
  const totalPages = Math.max(1, Math.ceil(items.length / cardsPerPage));
  const paginatedItems = useMemo(
    () => items.slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage),
    [items, currentPage, cardsPerPage]
  );
  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  const mapProperty = (entry) => {
    const slug = typeof entry === "string" ? entry : entry?.slug;
    const imageOverride = typeof entry === "object" ? entry?.image : null;
    const p = properties.find((item) => item.slug === slug);
    if (!p) return null;
    return {
      slug: p.slug,
      image:
        imageOverride ||
        p.heroImage ||
        p.galleries?.afterImages?.[0]?.url ||
        p.galleries?.beforeImages?.[0]?.url ||
        PROPERTY_IMAGE_FALLBACK,
      fallbackImage:
        p.heroImage ||
        p.galleries?.afterImages?.[0]?.url ||
        p.galleries?.beforeImages?.[0]?.url ||
        PROPERTY_IMAGE_FALLBACK,
      address: `${p.address}, ${p.city} ${p.state} ${p.zip}`,
      type: p.type,
      bedrooms: p.beds,
      bathrooms: p.baths,
      parking: p.parking,
      squareFeet: p.sqft,
      lotSize: p.lotSqft,
      holdingStatus: p.holdingStatus,
      acquiredLabel: p.acquiredLabel,
    };
  };

  useEffect(() => {
    const updateCardsPerPage = () => {
      setCardsPerPage(getCardsPerPage(window.innerWidth));
    };

    updateCardsPerPage();
    window.addEventListener("resize", updateCardsPerPage);

    return () => {
      window.removeEventListener("resize", updateCardsPerPage);
    };
  }, []);

  useEffect(() => {
    setCurrentPage((current) => Math.min(current, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(0);
  }, [items.length]);

  const changeColumnProperty = (itemId, propertyCount, direction) => {
    if (propertyCount <= 1) return;
    setActivePropertyIndexes((current) => {
      const currentIndex = current[itemId] || 0;
      const nextIndex = (currentIndex + direction + propertyCount) % propertyCount;
      return {
        ...current,
        [itemId]: nextIndex,
      };
    });
  };

  useEffect(() => {
    if (!autoScrollEnabled || totalPages <= 1) return undefined;

    const intervalId = window.setInterval(() => {
      setCurrentPage((current) => (current + 1) % totalPages);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoScrollEnabled, totalPages]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">{data?.title || "Properties"}</h2>
        {data?.subtitle ? (
          <p className="mt-3 text-[15px] md:text-base text-gray-600 max-w-3xl">{data.subtitle}</p>
        ) : null}
        <div className="mt-5 h-px bg-gray-200" />
      </div>

      <div
        className="max-w-6xl mx-auto px-4 mt-12 pb-6"
      >
        {totalPages > 1 ? (
          <div className="mb-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage((current) => Math.max(current - 1, 0))}
              disabled={!canGoPrev}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-900 shadow-sm transition hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Show previous page of properties"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((current) => Math.min(current + 1, totalPages - 1))}
              disabled={!canGoNext}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-900 shadow-sm transition hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Show next page of properties"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {paginatedItems.map((item, index) => {
            const propertyEntries = item.properties || [];
            const activePropertyIndex = Math.min(activePropertyIndexes[item.id] || 0, Math.max(propertyEntries.length - 1, 0));
            const activePropertyEntry = propertyEntries[activePropertyIndex];
            const p = mapProperty(activePropertyEntry);
            return (
              <div
                key={item.id || `${item.label || "property-column"}-${index}`}
                className="flex h-full flex-col self-stretch"
              >
                <div className="mb-5 rounded-lg border border-gray-200 bg-white px-4 py-3 text-[13px] font-semibold text-gray-900 shadow-sm md:text-[14px] xl:text-[15px]">
                  <div className="grid min-h-[72px] grid-cols-[72px_minmax(0,1fr)_72px] items-center gap-2 md:min-h-[80px] md:grid-cols-[88px_minmax(0,1fr)_88px]">
                    <div aria-hidden="true" />
                    <span
                      className="mx-auto max-w-[24ch] text-center leading-[1.2] md:max-w-[26ch]"
                      style={{ textWrap: "balance" }}
                    >
                      {item.label}
                    </span>
                    {propertyEntries.length > 1 ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => changeColumnProperty(item.id, propertyEntries.length, -1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                          aria-label={`Show previous ${item.label} property`}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <span className="min-w-[52px] text-center text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
                          {activePropertyIndex + 1}/{propertyEntries.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeColumnProperty(item.id, propertyEntries.length, 1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                          aria-label={`Show next ${item.label} property`}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div aria-hidden="true" />
                    )}
                  </div>
                  <PropertyBadges p={p} />
                </div>
                <div className="flex-1">
                  {p ? <PropertyCard p={p} /> : null}
                </div>
              </div>
            );
          })}
        </div>
        {totalPages > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-3">
            {Array.from({ length: totalPages }, (_, index) => {
              const isActive = index === currentPage;
              return (
                <button
                  key={`property-page-${index + 1}`}
                  type="button"
                  onClick={() => setCurrentPage(index)}
                  className={[
                    "inline-flex h-10 min-w-[40px] items-center justify-center rounded-full border px-3 text-sm font-semibold transition",
                    isActive
                      ? "border-gray-700 bg-gray-700 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-100",
                  ].join(" ")}
                  aria-label={`Go to property page ${index + 1}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
      `}</style>
    </section>
  );
}
