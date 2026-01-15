import React from "react";
import { API_BASE_URL } from "../../api.js";

const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;
  return url;
};

const SectionTitle = ({ title, sub }) => (
  <div className="max-w-6xl mx-auto px-5 md:px-4">
    <div className="flex flex-col items-center text-center">
      <h2 className="text-2xl md:text-4xl font-semibold text-gray-900 tracking-tight leading-tight">{title}</h2>
      <div className="mt-3 h-1 w-12 md:w-16 rounded-full bg-gray-200" />
      {sub ? <p className="mt-4 max-w-2xl text-gray-600 text-[15px] md:text-base leading-relaxed">{sub}</p> : null}
    </div>
  </div>
);

export default function AdvisorySection({ data }) {
  return (
    <section className="py-12 md:py-24 bg-gray-50">
      {data?.title ? <SectionTitle title={data.title} sub={data.subtitle} /> : null}
      <div className="mx-auto max-w-4xl px-5 mt-12 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
          <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            <img src={resolveUrl(data?.image)} alt={data?.imageAlt || "Partners"} className="w-full h-full object-contain p-4" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">{data?.heading}</h3>
            <p className="text-gray-900 font-medium mt-1">{data?.subheading}</p>
            <p className="mt-4 text-gray-600 leading-relaxed">{data?.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
