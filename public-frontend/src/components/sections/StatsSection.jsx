import React from "react";

export default function StatsSection({ data }) {
  const items = data?.items || [];
  if (!items.length) return null;
  const heading = data?.heading;
  const single = items.length === 1;
  return (
    <section className="py-10">
      <div className="max-w-4xl mx-auto px-4">
        {heading ? (
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-8">{heading}</h2>
        ) : null}
        <div className={single ? "grid gap-4 max-w-sm mx-auto" : "grid gap-4 sm:grid-cols-2"}>
          {items.map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className={`border border-gray-200 rounded-lg p-4 ${single ? "text-center" : ""}`}
            >
              <div className="text-xs uppercase tracking-widest text-gray-500">{item.label}</div>
              <div className="mt-2 text-xl font-semibold text-gray-900">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
