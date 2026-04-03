import React, { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "../../api.js";

const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;
  return url;
};

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

export default function FounderInterviewDropdownSection({ data }) {
  const snippets = useMemo(
    () =>
      (data?.snippets || []).map((snippet, index) => {
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
      }),
    [data?.snippets]
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
  const audioUrl = activeSnippet?.audioSrc || data?.audioSrc || "";
  const resolvedAudioUrl = resolveUrl(audioUrl);

  const seekToStart = () => {
    const audio = audioRef.current;
    if (!audio || !activeSnippet) return;
    const duration = Number.isFinite(audio.duration) ? audio.duration : activeSnippet.startTime;
    const nextTime = Math.min(activeSnippet.startTime, duration || activeSnippet.startTime);
    try {
      audio.currentTime = nextTime;
    } catch {
      // ignore seek errors before media is ready
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

  const playActiveSnippet = async () => {
    const audio = audioRef.current;
    if (!audio || !activeSnippet || !resolvedAudioUrl) return;

    pendingAutoplayRef.current = true;
    if (audio.readyState >= 1) {
      seekToStart();
      audio.play().catch(() => {
        pendingAutoplayRef.current = false;
      });
      return;
    }

    audio.load();
  };

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

  if (!data) return null;

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="rounded-[28px] border border-black/5 bg-[#fafafa] px-5 py-6 shadow-sm md:px-10 md:py-9">
          <div className="max-w-3xl">
            <h2 className="text-[32px] font-semibold tracking-tight text-gray-900 md:text-[44px]">
              {data.title || "Hear the Founder's Story"}
            </h2>
            {data.subtitle ? (
              <p className="mt-3 text-[15px] leading-relaxed text-gray-600 md:text-base">{data.subtitle}</p>
            ) : null}
            {data.introText ? (
              <p className="mt-4 text-[15px] leading-relaxed text-gray-700 md:text-base">{data.introText}</p>
            ) : null}
          </div>

          {snippets.length ? (
            <>
              <div className="mt-8">
                <label
                  htmlFor="founder-interview-snippet"
                  className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500"
                >
                  Interview Segment
                </label>
                <select
                  id="founder-interview-snippet"
                  className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-4 text-[15px] text-gray-900 outline-none transition focus:border-black/50"
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

              <div className="mt-6 rounded-[24px] border border-black/5 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900 md:text-2xl">{activeSnippet?.label}</h3>
                      {activeSnippet?.endTime ? (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                          {formatTime(activeSnippet.startTime)} - {formatTime(activeSnippet.endTime)}
                        </span>
                      ) : null}
                    </div>
                    {activeSnippet?.description ? (
                      <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-gray-600 md:text-base">
                        {activeSnippet.description}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={playActiveSnippet}
                    disabled={!resolvedAudioUrl}
                    className="inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {activeSnippet?.buttonLabel || "Play selected clip"}
                  </button>
                </div>

                <div className="mt-5 rounded-full bg-[#f3f4f6] px-3 py-3 md:px-4">
                  {resolvedAudioUrl ? (
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
                  ) : (
                    <div className="rounded-2xl px-3 py-3 text-sm text-gray-600">
                      Add a default audio URL or snippet-specific audio URL in the admin dashboard to enable playback.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-[24px] border border-dashed border-black/10 bg-white px-5 py-6 text-[15px] text-gray-600">
              Add interview snippets in the admin dashboard to populate this section.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
