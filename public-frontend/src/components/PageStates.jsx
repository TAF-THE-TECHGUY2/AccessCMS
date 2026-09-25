import React from "react";
import { Link } from "react-router-dom";

// Shared branded states for loading / not-found / errors so visitors never
// see bare developer text.

export function PageLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-gray-400">
      <div className="h-10 w-10 rounded-full border-2 border-gray-200 border-t-[#b3a17a] animate-spin" />
      <p className="mt-4 text-sm tracking-widest uppercase">Loading</p>
    </div>
  );
}

export function PageNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <p className="text-[11px] tracking-[0.3em] uppercase text-[#b3a17a] font-semibold">Error 404</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-gray-900">
          We couldn&rsquo;t find that page
        </h1>
        <p className="mt-4 text-gray-600 text-[15px] leading-relaxed">
          The page may have been moved or the link may be out of date.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="bg-black hover:bg-gray-800 text-white px-7 py-3 text-sm font-semibold rounded-md transition"
          >
            Back to Home
          </Link>
          <Link
            to="/contact"
            className="border border-black px-7 py-3 text-sm font-semibold rounded-md hover:bg-black hover:text-white transition"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PageError({ message }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <p className="text-[11px] tracking-[0.3em] uppercase text-[#b3a17a] font-semibold">
          Something went wrong
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-gray-900">
          We hit a snag loading this page
        </h1>
        <p className="mt-4 text-gray-600 text-[15px] leading-relaxed">
          {message || "Please try again in a moment."}
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="bg-black hover:bg-gray-800 text-white px-7 py-3 text-sm font-semibold rounded-md transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
