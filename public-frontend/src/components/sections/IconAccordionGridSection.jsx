import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
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

export default function IconAccordionGridSection({ data }) {
  const [openId, setOpenId] = useState(null);
  const items = data?.items || [];

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={`py-16 md:py-20 ${data?.background === "gray" ? "bg-gray-50" : ""}`}>
      {data?.title ? <SectionTitle title={data.title} sub={data.subtitle} /> : null}
      <div className="max-w-4xl mx-auto px-4 mt-10">
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item) => {
            const Icon = getIcon(item.iconName);
            const open = openId === item.id;
            return (
              <div
                key={item.id}
                className="relative border border-gray-200 rounded-lg overflow-hidden bg-white animate-slideDown"
              >
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center justify-between px-5 py-5 text-left hover:bg-gray-50 transition"
                  type="button"
                >
                  <div className="flex flex-row items-center gap-3 min-w-0">
                    <Icon className="w-5 h-5 text-gray-800 flex-shrink-0" />
                    <span className="text-[15px] md:text-[16px] text-gray-900 font-semibold truncate">
                      {item.title}
                    </span>
                  </div>

                  <ChevronDown
                    size={18}
                    className={`text-gray-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                  />
                </button>

                {open ? (
                  <div className="px-5 pb-5">
                    <div className="h-px bg-gray-200 mb-4" />
                    <p className="text-gray-700 text-[14px] md:text-[15px] leading-relaxed text-justify">
                      {item.content}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        {data?.ctaLabel ? (
          <div className="text-center mt-12">
            <a
              href={data.ctaHref || "#"}
              className="bg-gray-700 hover:bg-gray-800 text-white px-10 py-4 rounded-md inline-flex items-center gap-3 text-[15px] font-medium"
            >
              {data.ctaLabel}
            </a>
          </div>
        ) : null}
      </div>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
}
