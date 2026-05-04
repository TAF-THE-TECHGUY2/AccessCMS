import React from "react";

export default function NewsletterSignup() {
  return (
    <section className="bg-white text-gray-900 py-14">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-wide">
          Subscribe to Our Newsletter
        </h2>
        <p className="mt-3 text-gray-600 text-sm md:text-base">
          Get periodic updates from Access Properties.
        </p>
        <div className="mt-6">
          <a
            href="https://mailchi.mp/052b0234689c/access-properties"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center bg-gray-700 hover:bg-gray-800 text-white px-10 py-4 rounded-md text-[15px] font-medium transition-colors"
          >
            Subscribe
          </a>
        </div>
      </div>
    </section>
  );
}
