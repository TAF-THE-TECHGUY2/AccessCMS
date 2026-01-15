import React, { useEffect, useMemo, useState } from "react";

export default function Lightbox({ open, images = [], startIndex = 0, onClose }) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    if (open) setIdx(startIndex || 0);
  }, [open, startIndex]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idx]);

  const prev = () => setIdx((p) => (p - 1 + safeImages.length) % safeImages.length);
  const next = () => setIdx((p) => (p + 1) % safeImages.length);

  if (!open || safeImages.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/80"
        aria-label="Close"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative h-full w-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-6xl">
          {/* Top bar */}
          <div className="absolute -top-12 left-0 right-0 flex items-center justify-between text-white">
            <div className="text-sm opacity-90">
              {idx + 1} / {safeImages.length}
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition"
            >
              Close ✕
            </button>
          </div>

          {/* Main image */}
          <div className="relative bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            <img
              src={safeImages[idx]}
              alt={`Photo ${idx + 1}`}
              className="w-full max-h-[80vh] object-contain bg-black"
              draggable="false"
            />

            {/* Prev / Next */}
            {safeImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                  aria-label="Next"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {safeImages.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {safeImages.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setIdx(i)}
                  className={`relative shrink-0 w-24 h-16 rounded-lg overflow-hidden border transition ${
                    i === idx ? "border-white" : "border-white/20 hover:border-white/50"
                  }`}
                >
                  <img src={src} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
