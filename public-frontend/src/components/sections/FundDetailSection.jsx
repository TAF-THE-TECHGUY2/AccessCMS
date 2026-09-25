import React from "react";
import { getIcon } from "./iconMap.js";

const DEFAULT_FACTS = [
  { iconName: "Building2", label: "Asset Class", value: "Residential Real Estate" },
  { iconName: "Settings", label: "Strategy", value: "Core-Plus" },
  { iconName: "TrendingUp", label: "Target Net IRR", value: "Mid Teens" },
  { iconName: "DollarSign", label: "Minimum Investment", value: "$250,000" },
];

// Stands in for withheld content. Once the API strips a members-only section,
// there is nothing real left to blur, so the locked card would otherwise render
// as an empty box. These bars give the blur something to sit on while revealing
// nothing -- they are not derived from the fund's data.
const Bar = ({ className = "" }) => (
  <div className={`h-3.5 rounded bg-gray-200 ${className}`} />
);

const PLACEHOLDER_FACT_COUNT = 4;

function LockedBody() {
  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-14">
      <div>
        <div className="h-7 w-28 rounded-md bg-gray-100" />
        <div className="mt-5 h-9 w-4/5 rounded bg-gray-200" />
        <div className="mt-5 space-y-2.5">
          <Bar />
          <Bar />
          <Bar className="w-2/3" />
        </div>
        <div className="mt-8 h-6 w-2/5 rounded bg-gray-200" />
        <div className="mt-4 space-y-2.5">
          <Bar />
          <Bar className="w-3/4" />
        </div>
      </div>
      <div>
        <div className="h-7 w-32 rounded-md bg-gray-100" />
        <div className="mt-5 divide-y divide-gray-200 border-t border-gray-200">
          {Array.from({ length: PLACEHOLDER_FACT_COUNT }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 py-4">
              <Bar className="w-2/5" />
              <Bar className="w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// The fund overview itself: headline copy on the left, a facts panel on the
// right. `locked` means the API withheld the content -- SectionRenderer decides
// that and also draws the overlay on top.
export default function FundDetailSection({ data, locked = false }) {
  const {
    eyebrow = "Private Fund",
    title = "Access Real Estate Fund I",
    body = "",
    objectiveTitle = "Investment Objective",
    objectiveBody = "",
    factsTitle = "Fund Overview",
    facts = DEFAULT_FACTS,
  } = data || {};

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-10 md:px-12 md:py-14">
          {locked ? <LockedBody /> : (
          <div className="grid gap-10 md:grid-cols-2 md:gap-14">
            <div>
              {eyebrow ? (
                <span className="inline-block bg-gray-100 text-gray-600 text-[11px] font-semibold tracking-[0.14em] uppercase px-3 py-1.5 rounded-md">
                  {eyebrow}
                </span>
              ) : null}
              <h2 className="mt-5 font-serif text-3xl md:text-4xl text-gray-900 tracking-tight">
                {title}
              </h2>
              {body ? (
                <p className="mt-4 text-gray-600 text-[15px] leading-relaxed">{body}</p>
              ) : null}

              {objectiveTitle || objectiveBody ? (
                <div className="mt-8">
                  {objectiveTitle ? (
                    <h3 className="font-serif text-xl md:text-2xl text-gray-900">{objectiveTitle}</h3>
                  ) : null}
                  {objectiveBody ? (
                    <p className="mt-3 text-gray-600 text-[15px] leading-relaxed">{objectiveBody}</p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div>
              {factsTitle ? (
                <span className="inline-block bg-gray-100 text-gray-600 text-[11px] font-semibold tracking-[0.14em] uppercase px-3 py-1.5 rounded-md">
                  {factsTitle}
                </span>
              ) : null}
              <dl className="mt-5 divide-y divide-gray-200 border-t border-gray-200">
                {facts.map((fact, idx) => {
                  const Icon = getIcon(fact.iconName);
                  return (
                    <div
                      key={`${fact.label}-${idx}`}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <dt className="flex items-center gap-3 text-gray-600 text-[15px]">
                        <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{fact.label}</span>
                      </dt>
                      <dd className="text-gray-900 font-medium text-[15px] text-right">
                        {fact.value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
