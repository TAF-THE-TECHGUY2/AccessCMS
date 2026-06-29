import React from "react";

export default function SimpleContentSection({ data }) {
  const { title, subtitle, bodyHtml } = data || {};
  if (!title && !subtitle && !bodyHtml) return null;
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4">
        {title ? (
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight leading-tight">
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className="mt-3 text-[15px] md:text-base text-gray-600 leading-relaxed">{subtitle}</p>
        ) : null}
        {bodyHtml ? (
          <div
            className="mt-5 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : null}
      </div>
    </section>
  );
}
