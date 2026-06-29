import React from "react";
import { API_BASE_URL } from "../../api.js";

const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;
  return url;
};

export default function TitleImageSection({ data }) {
  const { title, image, imageAlt } = data || {};
  if (!title && !image) return null;
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4">
        {title ? (
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight leading-tight">
            {title}
          </h2>
        ) : null}
        {image ? (
          <div className={`${title ? "mt-6" : ""} overflow-hidden rounded-xl border border-gray-200`}>
            <img
              src={resolveUrl(image)}
              alt={imageAlt || title || ""}
              className="w-full h-auto object-cover"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
