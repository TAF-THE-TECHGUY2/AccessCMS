import React from "react";

export default function NewsletterSignup() {
  return (
    <section className="bg-gray-100 text-gray-900 py-14">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-wide">
          Subscribe to Our Newsletter
        </h2>
        <p className="mt-3 text-gray-600 text-sm md:text-base">
          Get the latest updates, new opportunities, and market insights.
        </p>
        <div className="mt-6">
          <a
            href="https://mailchi.mp/052b0234689c/access-properties"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-sm text-sm font-semibold tracking-wide hover:bg-gray-800 transition-colors"
          >
            Subscribe
          </a>
        </div>
      </div>
    </section>
  );
}
