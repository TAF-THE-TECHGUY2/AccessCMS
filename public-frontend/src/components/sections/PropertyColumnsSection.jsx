import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    api.getProperties().then(setProperties).catch(() => setProperties([]));
  }, []);

  const columns = data?.columns || [];
  const mapping = data?.mapping || {};

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {columns.map((col) => {
            const p = mapProperty(mapping[col]);
            return (
              <div key={col} className="w-full">
                <div className="bg-white border border-gray-200 rounded-lg py-3 px-4 text-center text-[15px] md:text-base font-semibold text-gray-900 mb-5 shadow-sm">
                  {col}
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
      `}</style>
    </section>
  );
}
