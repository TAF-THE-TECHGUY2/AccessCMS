import React, { useState } from "react";
import DisclosureBar from "../DisclosureBar.jsx";

export default function DisclosureSection({ data }) {
  const [open, setOpen] = useState(false);

  if (data?.variant === "simple") {
    return (
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="w-full text-left px-5 py-4 font-semibold">{data?.title || "Disclosure"}</div>
            <div
              className="px-5 pb-5 text-sm text-gray-600"
              dangerouslySetInnerHTML={{
                __html: data?.body || "Disclosure details can be edited in the CMS.",
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  if (data?.variant === "full") {
    return (
      <section className="py-16 md:py-20 bg-gray-100 border-t border-gray-300">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition"
              aria-expanded={open}
            >
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                {data?.title || "Full Disclosure"}
              </h3>
              <span
                className={`text-gray-500 transition-transform duration-300 ${
                  open ? "rotate-180" : ""
                }`}
              >
                v
              </span>
            </button>

            {open ? (
              <div className="px-6 pb-6 animate-fadeInUp">
                <div className="h-px bg-gray-300 mb-6" />
                <div
                  className="space-y-4 text-gray-700 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html:
                      data?.bodyHtml ||
                      data?.body ||
                      "<p>Disclosure details can be edited in the CMS.</p>",
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
        `}</style>
      </section>
    );
  }

  return <DisclosureBar />;
}
