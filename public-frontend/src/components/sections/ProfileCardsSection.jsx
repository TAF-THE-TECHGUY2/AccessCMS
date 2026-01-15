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

const ProfileCard = ({ card }) => (
  <div className="max-w-6xl mx-auto px-5 md:px-4">
    <div className="border border-black/10 bg-white rounded-3xl overflow-hidden shadow-sm">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-[280px] lg:w-[320px] bg-gray-100 flex-shrink-0">
          <div className="aspect-square md:aspect-auto md:h-full">
            <img src={resolveUrl(card.imageSrc)} alt={card.name} className="w-full h-full object-cover object-top" />
          </div>
        </div>
        <div className="flex-1 px-6 py-8 md:px-12 md:py-10">
          {card.roleLine ? (
            <p className="text-gray-900 font-medium text-sm md:text-base uppercase tracking-wider mb-2">
              {card.roleLine}
            </p>
          ) : null}
          <h3 className="text-2xl md:text-4xl font-semibold text-gray-900 leading-tight">{card.name}</h3>
          <div className="mt-6 space-y-4">
            {(card.paragraphs || []).map((p, idx) => (
              <p key={idx} className="text-gray-700 text-[15px] md:text-lg leading-relaxed">
                {p}
              </p>
            ))}
          </div>
          {card.embeddedAudioSrc ? (
            <div className="mt-8 p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="font-semibold text-gray-900 text-base mb-3 flex items-center gap-2">
                Hear the Founder's Story
              </p>
              <audio className="w-full" controls preload="none">
                <source src={resolveUrl(card.embeddedAudioSrc)} type="audio/mpeg" />
              </audio>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  </div>
);

export default function ProfileCardsSection({ data }) {
  const cards = data?.cards || [];
  return (
    <section className="py-12 md:py-24">
      {data?.title ? <SectionTitle title={data.title} sub={data.subtitle} /> : null}
      <div className="mt-12 space-y-8 md:space-y-16">
        {cards.map((card) => (
          <ProfileCard key={card.name} card={card} />
        ))}
      </div>
    </section>
  );
}
