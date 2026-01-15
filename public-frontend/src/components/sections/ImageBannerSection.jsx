import React from "react";
import { API_BASE_URL } from "../../api.js";

export default function ImageBannerSection({ data }) {
  const { image, caption, alignment = "center" } = data || {};
  if (!image) return null;
  const resolveUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;
    return url;
  };
  const alignClass =
    alignment === "left" ? "object-left" : alignment === "right" ? "object-right" : "object-center";
  return (
    <section className="py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <img src={resolveUrl(image)} alt={caption || ""} className={`w-full h-64 object-cover ${alignClass}`} />
          {caption ? <div className="p-4 text-sm text-gray-600">{caption}</div> : null}
        </div>
      </div>
    </section>
  );
}
