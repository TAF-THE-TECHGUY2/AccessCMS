import React from "react";

export default function CtaSection({ data }) {
  const { headline, subtext, buttons = [] } = data || {};
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold">{headline}</h2>
        {subtext ? <p className="mt-3 text-gray-600">{subtext}</p> : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {buttons.map((btn, idx) => (
            <a key={`${btn.label}-${idx}`} href={btn.href} className="bg-black text-white px-5 py-2 rounded-md">
              {btn.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
