import React from "react";

// Newsletter block, rendered from a page's NEWSLETTER section. The defaults
// match the old hardcoded version that home and contact used to get injected
// at render time, so backfilled pages look unchanged.
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
            className="inline-flex items-center justify-center bg-black hover:bg-gray-800 text-white px-10 py-3 rounded-md text-sm font-semibold tracking-wide transition-colors"
          >
            {buttonLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
