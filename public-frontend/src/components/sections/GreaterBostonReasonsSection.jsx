import React from "react";

export default function GreaterBostonReasonsSection({ data }) {
  const reasons = data?.reasons || [];
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">{data?.title}</h2>
        {data?.subtitle ? (
          <p className="mt-3 text-[15px] md:text-base text-gray-600 max-w-3xl">{data.subtitle}</p>
        ) : null}
        <div className="mt-5 h-px bg-gray-200" />
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 md:mt-18">
        <div className="relative w-full h-[500px] sm:h-[340px] md:h-[380px] overflow-hidden rounded-lg border border-gray-200">
          <img
            src={data?.imageUrl}
            alt={data?.imageAlt || "Boston skyline"}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />

          <div className="absolute left-3 right-3 sm:left-[4%] sm:right-[4%] md:left-[6%] top-[15%] sm:top-[20%] md:top-[22%] max-w-full sm:w-[92%] md:w-[560px] bg-black/70 sm:bg-black/60 border border-white/20 p-4 sm:p-6 rounded">
            <ul className="list-disc pl-4 sm:pl-6 space-y-2 sm:space-y-3 text-white text-sm sm:text-[15px] md:text-base leading-relaxed">
              {reasons.map((r) => (
                <li key={r} className="break-words">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
