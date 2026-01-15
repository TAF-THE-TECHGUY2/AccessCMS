import React from "react";
import { API_BASE_URL } from "../../api.js";

export default function GallerySection({ data }) {
  const images = data?.images || [];
  if (!images.length) return null;
  const resolveUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;
    return url;
  };
  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        {data?.title ? <h2 className="text-2xl font-semibold">{data.title}</h2> : null}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {images.map((img, idx) => (
            <div key={`${img.url}-${idx}`} className="border border-gray-200 rounded-lg overflow-hidden">
              <img src={resolveUrl(img.url)} alt={img.alt || ""} className="w-full h-48 object-cover" />
              {img.caption ? <div className="p-3 text-sm text-gray-600">{img.caption}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
