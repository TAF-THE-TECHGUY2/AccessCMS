import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, API_BASE_URL } from "../../api.js";

export default function PropertyGridSection({ data }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.getProperties().then(setItems).catch(() => setItems([]));
  }, []);

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
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="border border-gray-200 rounded-xl overflow-hidden">
              <img
                src={resolveUrl(item.galleries?.afterImages?.[0]?.url || item.galleries?.beforeImages?.[0]?.url || "")}
                alt={item.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm text-gray-500">{item.address}</div>
                <Link
                  to={`/${item.slug}`}
                  className="mt-3 inline-block text-sm text-blue-600"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
