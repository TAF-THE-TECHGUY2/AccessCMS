import React from "react";
import { getIcon } from "./iconMap.js";

const SectionTitle = ({ title, sub }) => (
  <div className="max-w-4xl mx-auto px-4">
    <div className="flex flex-col items-center text-center">
      <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">{title}</h2>
      <div className="mt-3 h-1 w-16 rounded-full bg-gray-200" />
      {sub ? <p className="mt-4 max-w-3xl text-gray-600 text-[15px] md:text-base">{sub}</p> : null}
    </div>
  </div>
);

export default function IconCardGridSection({ data }) {
  const items = data?.items || [];
  return (
    <div className={`py-16 md:py-20 ${data?.background === "gray" ? "bg-gray-50" : ""}`}>
      {data?.title ? <SectionTitle title={data.title} sub={data.subtitle} /> : null}
      <div className="max-w-4xl mx-auto px-4 mt-10">
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item) => {
            const Icon = getIcon(item.iconName);
            return (
              <div
                key={item.title}
                className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-gray-900" />
                  </div>
                  <p className="font-semibold text-gray-900 text-[15px] leading-snug">{item.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
