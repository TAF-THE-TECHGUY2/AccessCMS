import React from "react";
import { Quote } from "lucide-react";

const DEFAULT_TESTIMONIAL_DISCLOSURE =
  "Testimonials are provided by current investors. Investors were not compensated for these statements. These testimonials may not be representative of the experience of all investors and are not a guarantee of future performance or success. Some investors may have personal or prior business relationships with the sponsor.";

const SectionTitle = ({ title, sub }) => (
  <div className="max-w-4xl mx-auto px-4">
    <div className="flex flex-col items-center text-center">
      <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">{title}</h2>
      <div className="mt-3 h-1 w-16 rounded-full bg-gray-200" />
      {sub ? <p className="mt-4 max-w-3xl text-gray-600 text-[15px] md:text-base">{sub}</p> : null}
    </div>
  </div>
);

export default function TestimonialsSection({ data }) {
  const items = data?.items || [];
  const disclosure = data?.disclosure || DEFAULT_TESTIMONIAL_DISCLOSURE;
  return (
    <div className="bg-gray-50 py-16 md:py-20">
      {data?.title ? <SectionTitle title={data.title} sub={data.subtitle} /> : null}
      <div className="max-w-4xl mx-auto px-4 mt-10">
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl p-7 bg-white shadow-sm">
              <div className="flex items-center gap-3 text-gray-900">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Quote className="w-5 h-5" />
                </div>
                <h4 className="font-semibold">{item.label || "Investor Testimonial"}</h4>
              </div>
              <p className="mt-5 text-gray-800 leading-relaxed text-[15px]">{item.quote}</p>
              {item.attribution ? (
                <p className="mt-4 text-gray-600 text-sm font-semibold">{item.attribution}</p>
              ) : null}
            </div>
          ))}
        </div>
        {disclosure ? (
          <p className="mt-8 text-xs leading-relaxed text-gray-600">
            <span className="font-semibold text-gray-700">Testimonial Disclosure:</span> {disclosure}
          </p>
        ) : null}
      </div>
    </div>
  );
}
