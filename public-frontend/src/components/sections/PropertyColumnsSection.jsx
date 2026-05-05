import React, { useEffect, useMemo, useState } from "react";
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

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm animate-fadeInUp">
      <div className="h-[260px] w-full overflow-hidden bg-gray-100">
        <img src={imageSrc} alt={p.address} className="h-full w-full object-cover" onError={handleImageError} />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1 rounded bg-gray-200 px-4 py-3 text-[13px] text-gray-900 md:min-h-[250px] md:text-sm">
          <div className="font-semibold leading-snug">{p.address}</div>

          <div className="mt-2 grid grid-cols-1 gap-1">
            <div>
              <span className="font-semibold">Type:</span> {p.type}
            </div>
            <div>
              <span className="font-semibold">Bedrooms:</span> {p.bedrooms}
            </div>
            <div>
              <span className="font-semibold">Bathrooms:</span> {p.bathrooms}
            </div>
            <div>
              <span className="font-semibold">Parking:</span> {p.parking}
            </div>
            <div>
              <span className="font-semibold">Square Feet:</span> {p.squareFeet}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <a
            href={`/${p.slug}`}
            className="inline-block bg-[#b3a17a] hover:bg-[#9e8f6d] text-white px-6 py-2 text-sm rounded transition"
          >
            View More
          </a>
        </div>
      </div>
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
