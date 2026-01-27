import React from "react";

export default function InvestNow() {
  return (
    <div className="min-h-[70vh] bg-white">
      <section className="relative overflow-hidden border-b-4 border-black">
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7f2e7] via-white to-[#e8f0ff]" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#b3a17a]/25 blur-3xl" />
        <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-[#9bb6ff]/25 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-[11px] font-semibold tracking-[0.3em] uppercase">
            Stay Tuned
            <span className="h-2 w-2 rounded-full bg-[#b3a17a] animate-pulse" />
          </div>

          <h1 className="mt-5 text-3xl md:text-5xl font-semibold text-gray-900">
            Coming Soon
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] md:text-base text-gray-700 leading-relaxed">
            We’re building a new Invest Now experience with curated opportunities,
            transparent deal details, and a smoother onboarding flow. Check back soon.
          </p>

          <div className="mt-8 flex items-center">
            <a
              href="/greater-boston"
              className="bg-[#b3a17a] hover:bg-[#9e8f6d] text-white px-7 py-3 text-sm font-semibold rounded-md transition"
            >
              View Portfolios
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
