import React, { useEffect, useState } from "react";
import PhotoLightbox from "./PhotoLightbox";

/**
 * PropertyGallery
 * Usage:
 *   <PropertyGallery title="9 Ledge Street" photos={["/properties/9-ledge-street/9_ledge_01.jpg", ...]} />
 */
export default function PropertyGallery({ title = "", photos = [] }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const items = (photos || []).map((src, i) => ({
    src,
    alt: `${title || "Property"} photo ${i + 1}`,
  }));

  const openAt = (i) => {
    setIdx(i);
    setOpen(true);
  };

  const prev = () => setIdx((p) => (p - 1 + items.length) % items.length);
  const next = () => setIdx((p) => (p + 1) % items.length);

  // Optional thumbnail "jump" support from PhotoLightbox
  useEffect(() => {
    if (!open) return;
    const onJump = (e) => {
      const i = Number(e.detail);
      if (!Number.isNaN(i)) setIdx(Math.max(0, Math.min(items.length - 1, i)));
    };
    window.addEventListener("lightbox:jump", onJump);
    return () => window.removeEventListener("lightbox:jump", onJump);
  }, [open, items.length]);

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          {title ? <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{title}</h2> : null}
          <p className="text-sm text-gray-600 mt-1">
            Click any image to view full screen.
          </p>
        </div>

        <button
          onClick={() => openAt(0)}
          className="hidden sm:inline-flex rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
        >
          View Gallery
        </button>
      </div>

      {/* Grid */}
      <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((p, i) => (
          <button
            key={p.src}
            onClick={() => openAt(i)}
            className="group relative overflow-hidden rounded-2xl border border-black/10 bg-gray-100"
            aria-label={`Open photo ${i + 1}`}
          >
            <img
              src={p.src}
              alt={p.alt}
              className="h-32 w-full object-cover sm:h-40 md:h-44 lg:h-48 transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
              {i + 1} / {items.length}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <PhotoLightbox
        open={open}
        photos={items}
        index={idx}
        onClose={() => setOpen(false)}
        onPrev={prev}
        onNext={next}
        title={title}
      />
    </section>
  );
}
