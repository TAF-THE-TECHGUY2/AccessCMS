import React from "react";

export default function RichTextSection({ data }) {
  const { heading, bodyHtml } = data || {};
  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        {heading ? <h2 className="text-2xl md:text-3xl font-semibold">{heading}</h2> : null}
        {bodyHtml ? (
          <div
            className="mt-4 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : null}
      </div>
    </section>
  );
}
