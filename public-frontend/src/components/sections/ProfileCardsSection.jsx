import React, { useEffect, useMemo, useRef, useState } from "react";
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

const toSeconds = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remainder}`;
};

const normalizeCopy = (value) => (value || "").trim().replace(/\s+/g, " ").toLowerCase();

const InterviewSnippetCard = ({ card, className = "" }) => {
  const snippets = useMemo(
    () => {
      const configuredSnippets = (card.interviewSnippets || []).map((snippet, index) => {
        const startTime = toSeconds(snippet.startTime, 0);
        const endTime = toSeconds(snippet.endTime, 0);
        return {
          label: snippet.label || `Snippet ${index + 1}`,
          description: snippet.description || "",
          audioSrc: snippet.audioSrc || "",
          startTime,
          endTime: endTime > startTime ? endTime : 0,
          buttonLabel: snippet.buttonLabel || "",
        };
      });

      if (configuredSnippets.length > 0) {
        return configuredSnippets;
      }

      if (!card.embeddedAudioSrc) {
        return [];
      }

      return [
        {
          label: "Full Interview",
          description:
            card.interviewSubtitle ||
            "Select the founder interview from the dropdown and press play to listen.",
          audioSrc: "",
          startTime: 0,
          endTime: 0,
          buttonLabel: "Play full interview",
        },
      ];
    },
    [card.embeddedAudioSrc, card.interviewSnippets, card.interviewSubtitle]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const audioRef = useRef(null);
  const pendingAutoplayRef = useRef(false);

  useEffect(() => {
    setSelectedIndex((current) => {
      if (snippets.length === 0) return 0;
      return Math.min(current, snippets.length - 1);
    });
  }, [snippets.length]);

  const activeSnippet = snippets[selectedIndex] || null;
  const resolvedAudioUrl = resolveUrl(activeSnippet?.audioSrc || card.embeddedAudioSrc || "");
  const hasMultipleSnippets = snippets.length > 1;
  const snippetId = `founder-card-snippet-${card.name?.replace(/\s+/g, "-").toLowerCase() || "snippet"}`;
  const normalizedLabel = normalizeCopy(activeSnippet?.label);
  const normalizedDescription = normalizeCopy(activeSnippet?.description);
  const normalizedSubtitle = normalizeCopy(card.interviewSubtitle);
  const showDescription =
    Boolean(activeSnippet?.description) &&
    normalizedDescription !== normalizedLabel &&
    normalizedDescription !== normalizedSubtitle &&
    normalizedDescription.length >= 16;
  const showSnippetMeta = showDescription || Boolean(activeSnippet?.endTime);

  const seekToStart = () => {
    const audio = audioRef.current;
    if (!audio || !activeSnippet) return;
    const duration = Number.isFinite(audio.duration) ? audio.duration : activeSnippet.startTime;
    const nextTime = Math.min(activeSnippet.startTime, duration || activeSnippet.startTime);
    try {
      audio.currentTime = nextTime;
    } catch {
      // ignore early seek errors
    }
  };

  const getSnippetEnd = () => {
    const audio = audioRef.current;
    if (!audio || !activeSnippet?.endTime) return null;
    const duration = Number.isFinite(audio.duration) ? audio.duration : activeSnippet.endTime;
    return Math.min(activeSnippet.endTime, duration || activeSnippet.endTime);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeSnippet || !resolvedAudioUrl) return;
    pendingAutoplayRef.current = false;
    audio.pause();
    audio.load();
  }, [activeSnippet, resolvedAudioUrl]);

  const handleLoadedMetadata = () => {
    seekToStart();
    if (pendingAutoplayRef.current && audioRef.current) {
      pendingAutoplayRef.current = false;
      audioRef.current.play().catch(() => {
        pendingAutoplayRef.current = false;
      });
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    const snippetEnd = getSnippetEnd();
    if (!audio || !snippetEnd) return;
    if (audio.currentTime >= snippetEnd) {
      audio.pause();
      audio.currentTime = snippetEnd;
      pendingAutoplayRef.current = false;
    }
  };

  const handlePlay = () => {
    if (!activeSnippet || !audioRef.current) return;
    const snippetEnd = getSnippetEnd();
    if (
      audioRef.current.currentTime < activeSnippet.startTime ||
      (snippetEnd && audioRef.current.currentTime >= snippetEnd)
    ) {
      seekToStart();
    }
  };

  if (!resolvedAudioUrl) return null;

  return (
    <div
      className={`mt-7 rounded-[24px] border border-black/7 bg-[#f7f5ef] p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] md:mt-8 md:p-6 ${className}`.trim()}
    >
      <div className="mb-4 h-1 w-14 rounded-full bg-[#b3a17a]" />
      <div className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          {card.interviewEyebrow || "Founder Interview"}
        </p>
        <p className="mt-2 font-semibold text-gray-900 text-[15px] md:text-base">
          {card.interviewTitle || "Hear the Founder's Story"}
        </p>
        {card.interviewSubtitle ? (
          <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-gray-600 md:text-[15px]">{card.interviewSubtitle}</p>
        ) : null}
      </div>
      {hasMultipleSnippets ? (
        <div className="mt-4">
          <label htmlFor={snippetId} className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
            {card.interviewSelectLabel || "Choose A Segment"}
          </label>
          <select
            id={snippetId}
            className="mt-2 w-full rounded-[14px] border border-black/8 bg-white px-4 py-2.5 text-[15px] text-gray-900 shadow-[0_4px_14px_rgba(15,23,42,0.05)] outline-none transition focus:border-black/25"
            value={selectedIndex}
            onChange={(event) => setSelectedIndex(Number(event.target.value))}
          >
            {snippets.map((snippet, index) => (
              <option key={`${snippet.label}-${index}`} value={index}>
                {snippet.label}
                {snippet.endTime ? ` (${formatTime(snippet.startTime)} - ${formatTime(snippet.endTime)})` : ""}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {activeSnippet && showSnippetMeta ? (
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            {activeSnippet?.endTime ? (
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500 shadow-sm">
                {formatTime(activeSnippet.startTime)} - {formatTime(activeSnippet.endTime)}
              </span>
            ) : null}
          </div>
          {showDescription ? (
            <p className="mt-1.5 text-[14px] leading-relaxed text-gray-600 md:text-[15px]">{activeSnippet.description}</p>
          ) : null}
        </div>
      ) : null}
      <div className="mt-4 rounded-[16px] border border-black/5 bg-white/90 px-2.5 py-2 shadow-[0_4px_12px_rgba(15,23,42,0.035)] md:px-3">
        <audio
          ref={audioRef}
          src={resolvedAudioUrl}
          className="w-full"
          controls
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
        />
      </div>
    </div>
  );
};

const ProfileCard = ({ card }) => {
  return (
    <div className="max-w-6xl mx-auto px-5 md:px-4">
      <div className="border border-black/10 bg-white rounded-3xl overflow-hidden shadow-sm md:min-h-[430px] lg:min-h-[470px]">
        <div className="flex flex-col md:min-h-[430px] md:flex-row lg:min-h-[470px]">
          <div className="w-full md:w-[280px] lg:w-[320px] bg-gray-100 flex-shrink-0">
            <div className="aspect-square md:aspect-auto md:h-full">
              <img src={resolveUrl(card.imageSrc)} alt={card.name} className="w-full h-full object-cover object-top" />
            </div>
          </div>
          <div className="flex-1 px-6 py-8 md:flex md:flex-col md:justify-center md:px-12 md:py-10">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProfileCardsSection({ data }) {
  const cards = data?.cards || [];
  return (
    <section className="py-12 md:py-24">
      {data?.title ? <SectionTitle title={data.title} sub={data.subtitle} /> : null}
      <div className="mt-12 space-y-10 md:space-y-16">
        {cards.map((card) => {
          const hasInterview = Boolean(card.embeddedAudioSrc || (card.interviewSnippets || []).length);

          return (
            <div key={card.name} className="space-y-4 md:space-y-1">
              <ProfileCard card={card} />
              {hasInterview ? (
                <div className="max-w-6xl mx-auto px-5 md:px-4 md:-mt-6 lg:-mt-7">
                  <InterviewSnippetCard card={card} className="mt-0 md:px-6 md:py-5" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
