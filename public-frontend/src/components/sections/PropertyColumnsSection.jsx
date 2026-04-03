import React, { useEffect, useRef, useState } from "react";
import { api, API_BASE_URL } from "../../api.js";

const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;
  return url;
};

const PropertyCard = ({ p }) => (
  <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden animate-fadeInUp">
    <div className="h-[260px] w-full overflow-hidden bg-gray-100">
      <img src={resolveUrl(p.image)} alt={p.address} className="h-full w-full object-cover" />
    </div>

    <div className="p-5">
      <div className="bg-gray-200 px-4 py-3 text-gray-900 text-[13px] md:text-sm rounded">
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

export default function PropertyColumnsSection({ data }) {
  const [properties, setProperties] = useState([]);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    api.getProperties().then(setProperties).catch(() => setProperties([]));
  }, []);

  const legacyPropertyMappings = Object.entries(data?.mapping || {});
  const items =
    Array.isArray(data?.items) && data.items.length
      ? data.items.map((item, index) => ({
          id: item?.id || `property-column-${index + 1}`,
          label: item?.label || "",
          slug: item?.slug || "",
          image: item?.image || "",
        }))
      : (data?.columns || []).map((label, index) => {
          const entry = data?.mapping?.[label] ?? legacyPropertyMappings[index]?.[1];
          return {
            id: `property-column-${index + 1}`,
            label,
            slug: typeof entry === "string" ? entry : entry?.slug || "",
            image: typeof entry === "object" ? entry?.image || "" : "",
          };
        });

  const mapProperty = (entry) => {
    const slug = typeof entry === "string" ? entry : entry?.slug;
    const imageOverride = typeof entry === "object" ? entry?.image : null;
    const p = properties.find((item) => item.slug === slug);
    if (!p) return null;
    return {
      slug: p.slug,
      image:
        imageOverride ||
        p.galleries?.afterImages?.[0]?.url ||
        p.galleries?.beforeImages?.[0]?.url ||
        "",
      address: `${p.address}, ${p.city} ${p.state} ${p.zip}`,
      type: p.type,
      bedrooms: p.beds,
      bathrooms: p.baths,
      parking: p.parking,
      squareFeet: p.sqft,
    };
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const updateScrollState = () => {
      const maxScrollLeft = track.scrollWidth - track.clientWidth;
      const overflow = maxScrollLeft > 8;
      setHasOverflow(overflow);
      setCanScrollPrev(track.scrollLeft > 8);
      setCanScrollNext(track.scrollLeft < maxScrollLeft - 8);
    };

    updateScrollState();
    track.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [items.length, properties.length]);

  const scrollTrack = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.max(track.clientWidth * 0.92, 320),
      behavior: "smooth",
    });
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">{data?.title || "Properties"}</h2>
        {data?.subtitle ? (
          <p className="mt-3 text-[15px] md:text-base text-gray-600 max-w-3xl">{data.subtitle}</p>
        ) : null}
        <div className="mt-5 h-px bg-gray-200" />
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12 pb-6">
        {hasOverflow ? (
          <div className="mb-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => scrollTrack(-1)}
              disabled={!canScrollPrev}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-900 shadow-sm transition hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Show previous properties"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollTrack(1)}
              disabled={!canScrollNext}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-900 shadow-sm transition hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Show next properties"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : null}

        <div
          ref={trackRef}
          className="property-columns-track flex gap-8 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory"
        >
          {items.map((item, index) => {
            const p = mapProperty(item);
            return (
              <div
                key={item.id || `${item.label || "property-column"}-${index}`}
                className="w-[86%] min-w-[86%] flex-none snap-start md:w-[calc((100%-2rem)/2)] md:min-w-[calc((100%-2rem)/2)] xl:w-[calc((100%-4rem)/3)] xl:min-w-[calc((100%-4rem)/3)]"
              >
                <div className="bg-white border border-gray-200 rounded-lg py-3 px-4 text-center text-[15px] md:text-base font-semibold text-gray-900 mb-5 shadow-sm">
                  {item.label}
                </div>
                {p ? <PropertyCard p={p} /> : null}
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
        .property-columns-track {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .property-columns-track::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
