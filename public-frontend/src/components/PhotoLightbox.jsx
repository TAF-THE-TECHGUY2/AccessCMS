import React, { useEffect, useMemo } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * PhotoLightbox
 * - ESC to close
 * - Arrow keys for prev/next
 * - Locks body scroll while open
 */
export default function PhotoLightbox({
  open,
  photos = [],
  index = 0,
  onClose,
  onPrev,
  onNext,
  title = "",
}) {
  const hasPhotos = photos && photos.length > 0;
  const current = useMemo(() => (hasPhotos ? photos[index] : null), [hasPhotos, photos, index]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm">
      {/* Click-out to close */}
      <button
        className="absolute inset-0 cursor-default"
        aria-label="Close lightbox"
        onClick={onClose}
      />

      <div className="relative mx-auto flex h-full max-w-6xl flex-col px-4 py-6">
        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="min-w-0">
            {title ? (
              <div className="text-white/90 text-sm font-medium truncate">{title}</div>
            ) : null}
            {hasPhotos ? (
              <div className="text-white/60 text-xs">
                {index + 1} / {photos.length}
              </div>
            ) : null}
          </div>

          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/15"
            aria-label="Close"
          >
            <X size={18} />
            <span className="text-sm">Close</span>
          </button>
        </div>

        {/* Main image area */}
        <div className="relative z-10 mt-5 flex flex-1 items-center justify-center">
          {/* Prev */}
          <button
            onClick={onPrev}
            aria-label="Previous"
            className="absolute left-0 md:-left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/15"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Image */}
          <div className="w-full h-full flex items-center justify-center">
            {current ? (
              <img
                src={current.src}
                alt={current.alt || "Photo"}
                className="max-h-[75vh] w-auto max-w-full rounded-2xl border border-white/10 shadow-2xl object-contain"
                draggable={false}
              />
            ) : (
              <div className="text-white/70">No photos</div>
            )}
          </div>

          {/* Next */}
          <button
            onClick={onNext}
            aria-label="Next"
            className="absolute right-0 md:-right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/15"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Thumbnails */}
        {hasPhotos ? (
          <div className="relative z-10 mt-5">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {photos.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    // "jump to" handled outside; simplest is call onNext/onPrev repeatedly is messy
                    // so we expose a custom event via window (optional)
                    window.dispatchEvent(new CustomEvent("lightbox:jump", { detail: i }));
                  }}
                  className={[
                    "h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border",
                    i === index ? "border-white" : "border-white/15 hover:border-white/30",
                  ].join(" ")}
                  aria-label={`Go to photo ${i + 1}`}
                >
                  <img src={p.src} alt={p.alt || ""} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="text-white/50 text-[11px]">
              Tip: Use <span className="text-white/70">←</span> / <span className="text-white/70">→</span> keys, or{" "}
              <span className="text-white/70">ESC</span> to close.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
