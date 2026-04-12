import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import apLogo from "../../assets/Logo.png";

const getStatLabelLines = (label) => {
  const text = String(label || "").trim();
  if (!text) return { primary: "", secondary: "" };

  const manualBreaks = text.split(/\n+/).map((part) => part.trim()).filter(Boolean);
  if (manualBreaks.length > 1) {
    return {
      primary: manualBreaks[0],
      secondary: manualBreaks.slice(1).join(" "),
    };
  }

  const preferredSecondLinePatterns = [
    /(\(?Non-Accredited\s*[-–]\s*Through Third-Party Platform\)?)$/i,
    /(\(?Accredited Investors\s*[-–]\s*Direct Offering\)?)$/i,
  ];

  for (const pattern of preferredSecondLinePatterns) {
    const match = text.match(pattern);
    if (match && typeof match.index === "number") {
      return {
        primary: text.slice(0, match.index).trim(),
        secondary: match[0].trim(),
      };
    }
  }

  const trailingParentheticalMatch = text.match(/^(.*?)(\s*\([^)]*\))$/);
  if (!trailingParentheticalMatch) {
    return { primary: text, secondary: "" };
  }

  return {
    primary: trailingParentheticalMatch[1].trim(),
    secondary: trailingParentheticalMatch[2].trim(),
  };
};

export default function PortfolioCardSection({ data }) {
  const stats = data?.stats || [];
  return (
    <section className="py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-4 grid place-items-center">
        <div className="w-full max-w-xl bg-white border border-black/10 shadow-md rounded-2xl overflow-hidden animate-fadeInUp">
          <div className="relative">
            <div className="h-28 bg-gradient-to-r from-lime-100 via-lime-50 to-white" />
            <div className="absolute inset-0 bg-white/20" />
            <div className="absolute inset-0 flex items-start px-6 pt-5">
              <div className="inline-flex items-center bg-white rounded-lg border border-black/10 shadow-sm px-3 py-2">
                <img src={apLogo} alt="Access Properties" className="h-7 w-auto object-contain" loading="lazy" />
              </div>
            </div>
          </div>
          <div className="px-7 pb-9 pt-7 md:px-9 md:pb-10">
            <p className="text-[10px] tracking-[0.25em] uppercase text-gray-500 font-semibold">PORTFOLIO</p>
            <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
              {data?.title || "Greater Boston"}
            </h2>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-gray-600 md:text-[15px]">
              {data?.subtitle || "Access Properties Alternative Dividend Fund"}
            </p>
            <div className="mt-8 rounded-xl border border-black/10 overflow-hidden bg-white">
              {stats.map((row, idx) => {
                const labelLines = getStatLabelLines(row.label);
                return (
                  <div
                    key={`${row.label}-${idx}`}
                    className={[
                      "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-5 py-5 text-sm md:gap-6 md:px-6",
                      "transition-colors hover:bg-gray-50",
                      idx !== stats.length - 1 ? "border-b border-gray-200/80" : "",
                    ].join(" ")}
                  >
                    <span className="min-w-0 pr-2 text-gray-500 leading-relaxed">
                      <span className="block">{labelLines.primary}</span>
                      {labelLines.secondary ? (
                        <span className="mt-1 block text-[13px] text-gray-500">
                          {labelLines.secondary}
                        </span>
                      ) : null}
                    </span>
                    <span className="pt-0.5 text-right font-semibold text-gray-900 whitespace-nowrap">
                      {row.value}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-8">
              <Link
                to={data?.ctaHref || "/greater-boston"}
                className="group w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3.5 rounded-xl transition shadow-sm hover:shadow font-semibold"
              >
                {data?.ctaLabel || "Learn More"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            {data?.footnote ? (
              <p className="mt-4 text-xs leading-relaxed text-gray-500">
                {data.footnote}
              </p>
            ) : null}
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
