import React from "react";

export default function CtaSection({ data }) {
  const { headline, subtext, buttons = [], buttonLayout = "centered" } = data || {};
  const hasText = Boolean(headline || subtext);
  const splitColumns = buttonLayout === "split-columns" && buttons.length > 1;

  return (
    <section className="py-12 bg-gray-50">
      <div className={`${splitColumns ? "max-w-6xl" : "max-w-4xl"} mx-auto px-4 text-center`}>
        {headline ? <h2 className="text-2xl md:text-3xl font-semibold">{headline}</h2> : null}
        {subtext ? <p className={`text-gray-600 ${headline ? "mt-3" : ""}`}>{subtext}</p> : null}
        {buttons.length ? (
          <div
            className={`${
              splitColumns
                ? "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-8"
                : "flex flex-wrap justify-center gap-3"
            } ${hasText ? "mt-6" : ""}`}
          >
            {buttons.map((btn, idx) => (
              <div key={`${btn.label}-${idx}`} className={splitColumns ? "flex justify-center" : "contents"}>
                <a
                  href={btn.href || undefined}
                  className={`bg-black text-white px-5 py-2 rounded-md ${
                    !btn.href ? "cursor-not-allowed opacity-60" : ""
                  }`}
                  aria-disabled={!btn.href}
                  onClick={!btn.href ? (event) => event.preventDefault() : undefined}
                >
                  {btn.label}
                </a>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
