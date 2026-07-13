import React from "react";

// Newsletter block. Renders CMS-provided content when used as a page section;
// the defaults preserve the legacy hardcoded version (auto-inserted on the
// home and contact pages until those pages get their own NEWSLETTER section).
export default function NewsletterSignup({
  title = "Subscribe to Our Newsletter",
  subtitle = "Get periodic updates from Access Properties.",
  buttonLabel = "Subscribe",
  buttonHref = "https://mailchi.mp/052b0234689c/access-properties",
}) {
  return (
    <section className="bg-white text-gray-900 py-14">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-wide">{title}</h2>
        {subtitle ? (
          <p className="mt-3 text-gray-600 text-sm md:text-base">{subtitle}</p>
        ) : null}
        <div className="mt-6">
          <a
            href={buttonHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center bg-gray-700 hover:bg-gray-800 text-white px-10 py-4 rounded-md text-[15px] font-medium transition-colors"
          >
            {buttonLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
