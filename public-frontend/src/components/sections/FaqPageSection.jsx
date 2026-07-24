import React, { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { getIcon } from "./iconMap.js";
import { api, API_BASE_URL } from "../../api.js";
import buildImg from "../../assets/Build.png";

// Accent used to highlight the selected question card and its checkmark.
const ACCENT = "#1e2a5e";

// Uploaded images live on the API server; a bare /uploads path would resolve
// against the website's own domain and 404 (grey hero).
const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;
  return url;
};

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
          backgroundImage: data?.heroImage ? `url(${resolveUrl(data.heroImage)})` : `url(${buildImg})`,
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
                  className="flex items-center gap-2 rounded-md bg-black hover:bg-gray-800 text-white px-6 py-2.5 text-sm font-semibold transition shadow-sm"
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
          const selected = cat.items.find((item) => item._id === openId);
          return (
            <section key={cat.key} className="pt-20 scroll-mt-40" ref={refs.current[cat.key]}>
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-6 h-6 text-gray-900" />
                <h2 className="text-2xl font-semibold text-gray-900">{cat.title}</h2>
              </div>
              {cat.subtitle ? (
                <p className="text-gray-500 text-[15px] leading-relaxed max-w-3xl mb-6">{cat.subtitle}</p>
              ) : (
                <div className="mb-6" />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.items.map((item) => {
                  const open = openId === item._id;
                  return (
                    <button
                      key={item._id}
                      onClick={() => toggle(item._id)}
                      className={`flex items-center justify-between gap-2 rounded-md border bg-white px-4 py-3 text-left text-[15px] transition animate-fadeInUp ${
                        open
                          ? "border-2 font-semibold shadow-sm"
                          : "border-gray-200 text-gray-800 font-medium hover:border-gray-400 hover:shadow-sm"
                      }`}
                      style={open ? { borderColor: ACCENT, color: ACCENT } : undefined}
                    >
                      <span>{item.question}</span>
                      {open ? <Check className="w-4 h-4 shrink-0" style={{ color: ACCENT }} /> : null}
                    </button>
                  );
                })}
              </div>

              {selected ? (
                <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-6 animate-fadeInUp">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selected.question}</h3>
                  <div
                    className="text-gray-700 text-[14px] md:text-[15px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: selected.answerHtml }}
                  />
                </div>
              ) : null}
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
