import React from "react";

export default function CtaSection({ data }) {
  const { headline, subtext, buttons = [] } = data || {};
  const hasText = Boolean(headline || subtext);
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {headline ? <h2 className="text-2xl md:text-3xl font-semibold">{headline}</h2> : null}
        {subtext ? <p className={`text-gray-600 ${headline ? "mt-3" : ""}`}>{subtext}</p> : null}
        {buttons.length ? (
          <div className={`flex flex-wrap justify-center gap-3 ${hasText ? "mt-6" : ""}`}>
            {buttons.map((btn, idx) => (
              <a key={`${btn.label}-${idx}`} href={btn.href} className="bg-black text-white px-5 py-2 rounded-md">
                {btn.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
