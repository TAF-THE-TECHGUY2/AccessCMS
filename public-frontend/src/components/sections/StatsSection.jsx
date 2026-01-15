import React from "react";

export default function StatsSection({ data }) {
  const items = data?.items || [];
  if (!items.length) return null;
  return (
    <section className="py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, idx) => (
            <div key={`${item.label}-${idx}`} className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs uppercase tracking-widest text-gray-500">{item.label}</div>
              <div className="mt-2 text-xl font-semibold text-gray-900">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
