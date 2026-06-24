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
    alignment === "left" ? "text-left" : alignment === "right" ? "text-right" : "text-center";
  return (
    <section className="py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className={`border border-gray-200 rounded-xl overflow-hidden ${alignClass}`}>
          <img
            src={resolveUrl(image)}
            alt={caption || ""}
            className="max-w-full h-auto inline-block align-top"
          />
          {caption ? <div className="p-4 text-sm text-gray-600 text-left">{caption}</div> : null}
        </div>
      </div>
    </section>
  );
}
