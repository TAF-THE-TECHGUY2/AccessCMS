import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import apLogo from "../../assets/Logo.png";

export default function PortfolioCardSection({ data }) {
  const stats = data?.stats || [];
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4 grid place-items-center">
        <div className="w-full max-w-lg bg-white border border-black/10 shadow-md rounded-2xl overflow-hidden animate-fadeInUp">
          <div className="relative">
            <div className="h-28 bg-gradient-to-r from-lime-100 via-lime-50 to-white" />
            <div className="absolute inset-0 bg-white/20" />
            <div className="absolute inset-0 flex items-start px-6 pt-5">
              <div className="inline-flex items-center bg-white rounded-lg border border-black/10 shadow-sm px-3 py-2">
                <img src={apLogo} alt="Access Properties" className="h-7 w-auto object-contain" loading="lazy" />
              </div>
            </div>
          </div>
          <div className="px-7 md:px-8 pb-8 pt-6">
            <p className="text-[10px] tracking-[0.25em] uppercase text-gray-500 font-semibold">PORTFOLIO</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
              {data?.title || "Greater Boston"}
            </h2>
            <p className="mt-2 text-sm text-gray-600 max-w-prose">
              {data?.subtitle || "Access Properties Alternative Dividend Fund"}
            </p>
            <div className="mt-6 rounded-xl border border-black/10 overflow-hidden bg-white">
              {stats.map((row, idx) => (
                <div
                  key={row.label}
                  className={[
                    "flex items-center justify-between px-5 py-4 text-sm",
                    "transition-colors hover:bg-gray-50",
                    idx !== stats.length - 1 ? "border-b border-gray-200/80" : "",
                  ].join(" ")}
                >
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-semibold text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-7">
              <Link
                to={data?.ctaHref || "/greater-boston"}
                className="group w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl transition shadow-sm hover:shadow font-semibold"
              >
                {data?.ctaLabel || "Learn More"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            {data?.footnote ? <p className="mt-1 text-xs text-gray-500">{data.footnote}</p> : null}
          </div>
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
