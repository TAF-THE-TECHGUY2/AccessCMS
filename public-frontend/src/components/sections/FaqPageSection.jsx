import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getIcon } from "./iconMap.js";
import { api } from "../../api.js";
import buildImg from "../../assets/Build.png";

export default function FaqPageSection({ data }) {
  const [openId, setOpenId] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.getFaq().then(setItems).catch(() => setItems([]));
  }, []);

  const categories = data?.categories || [];
  const refs = useRef({});
  useEffect(() => {
    categories.forEach((cat) => {
      if (!refs.current[cat.key]) {
        refs.current[cat.key] = React.createRef();
      }
    });
  }, [categories]);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));
  const scrollToSection = (key) =>
    refs.current[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const grouped = categories.map((cat) => ({
    ...cat,
    items: items.filter((item) => (item.category || "").toLowerCase() === cat.key.toLowerCase()),
  }));

  return (
    <div className="min-h-screen bg-white">
      <section
        className="relative h-[597px] bg-cover bg-center"
        style={{
          backgroundImage: data?.heroImage ? `url(${data.heroImage})` : `url(${buildImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative h-full flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-6xl">
            <div className="mx-auto rounded-xl py-7 px-6 md:px-10 shadow-lg animate-slideDown bg-black/70 backdrop-blur-md border border-white/10">
              <h1 className="text-white text-center text-3xl md:text-5xl font-semibold">
                {data?.heroTitle || "Frequently Asked Questions"}
              </h1>
            </div>
            {data?.heroSubtitle ? (
              <div
                className="mx-auto mt-6 rounded-md py-3 px-5 max-w-2xl animate-slideUp bg-black/55 backdrop-blur-sm border border-white/10"
                style={{ animationDelay: "0.15s" }}
              >
                <p className="text-white text-center text-[15px] md:text-base leading-relaxed">
                  {data.heroSubtitle}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="bg-white border-b border-gray-200 sticky top-[88px] z-40 shadow-sm">
        <div className="max-w-6xl mx-auto pt-6 px-5 py-4 md:px-8 lg:px-16">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => {
              const Icon = getIcon(cat.iconName);
              return (
                <button
                  key={cat.key}
                  onClick={() => scrollToSection(cat.key)}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 border border-gray-600 text-white px-6 py-2.5 text-sm font-semibold transition shadow-sm"
                >
                  <Icon className="w-4 h-4" />
                  {cat.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16 py-16">
        {grouped.map((cat) => {
          const Icon = getIcon(cat.iconName);
          return (
            <section key={cat.key} className="pt-20 scroll-mt-40" ref={refs.current[cat.key]}>
              <div className="flex items-center gap-3 mb-6">
                <Icon className="w-6 h-6 text-gray-900" />
                <h2 className="text-2xl font-semibold text-gray-900">{cat.title}</h2>
              </div>
              <div className="space-y-4">
                {cat.items.map((item) => {
                  const open = openId === item._id;
                  return (
                    <div
                      key={item._id}
                      className="border border-gray-200 rounded-lg w-full max-w-3xl mx-auto bg-white shadow-sm overflow-hidden animate-fadeInUp"
                    >
                      <button
                        onClick={() => toggle(item._id)}
                        className="w-full flex items-center justify-between px-5 py-5 text-left hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-gray-800 shrink-0" />
                          <span className="font-semibold text-gray-900 text-[15px] md:text-base">{item.question}</span>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-500 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                      {open ? (
                        <div
                          className="px-5 pb-5 text-gray-700 text-[14px] md:text-[15px] leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.8s ease-out; }
        .animate-slideUp { animation: slideUp 0.8s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
      `}</style>
    </div>
  );
}
