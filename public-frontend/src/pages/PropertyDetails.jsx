import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { BedDouble, Bath, Car, Ruler, X, ChevronLeft, ChevronRight } from "lucide-react";
import { api, API_BASE_URL } from "../api.js";

const SectionTitle = ({ title, sub }) => (
  <div className="max-w-6xl mx-auto px-4">
    <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">{title}</h2>
    {sub ? <p className="mt-3 text-[15px] md:text-base text-gray-600 max-w-3xl">{sub}</p> : null}
    <div className="mt-5 h-px bg-gray-200" />
  </div>
);

function PropertyOverview({ overview }) {
  if (!overview) return null;
  return (
    <section className="py-12">
      <SectionTitle title={overview.heading || "Property Overview"} />
      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-4">
        {(overview.paragraphs || []).map((p, idx) => (
          <div
            key={idx}
            className="text-gray-800/90 text-[15px] md:text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: p }}
          />
        ))}
      </div>
    </section>
  );
}

const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;
  return url;
};

function normalizePhoto(item, fallbackCaption = "", fallbackAlt = "") {
  if (!item) return null;
  if (typeof item === "string") {
    return { src: item, caption: fallbackCaption || "", alt: fallbackAlt || "" };
  }
  return {
    src: resolveUrl(item.url || item.src),
    caption: item.caption || fallbackCaption || "",
    alt: item.alt || fallbackAlt || "",
  };
}

function normalizeList(list, defaults = {}) {
  const arr = Array.isArray(list) ? list : [];
  return arr
    .map((it, idx) =>
      normalizePhoto(
        it,
        defaults.caption ? defaults.caption(idx) : "",
        defaults.alt ? defaults.alt(idx) : ""
      )
    )
    .filter(Boolean);
}

function StageLightbox({ open, photos, index, onClose, onPrev, onNext, onSetIndex }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;
  const current = photos[index];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div className="relative mx-auto h-full max-w-6xl px-4 flex items-center justify-center">
        <div className="relative w-full" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onClose}
            className="absolute -top-14 right-0 text-white/80 hover:text-white transition"
            aria-label="Close"
            type="button"
          >
            <X size={26} />
          </button>
          <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
            <div className="relative w-full max-h-[70vh] flex items-center justify-center bg-black">
              <img
                src={current?.src}
                alt={current?.alt || "Photo"}
                className="max-h-[70vh] w-full object-contain"
              />
            </div>
            {current?.caption || current?.alt ? (
              <div className="p-4 md:p-5 border-t border-white/10">
                {current.caption ? <div className="text-base md:text-lg font-medium text-white">{current.caption}</div> : null}
                {current.alt ? <div className="text-sm text-white/60 mt-1">{current.alt}</div> : null}
              </div>
            ) : null}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={onPrev}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white/90 hover:bg-white/10 transition"
              type="button"
            >
              <ChevronLeft size={18} /> Prev
            </button>
            <div className="text-white/60 text-sm">
              {index + 1} / {photos.length}
            </div>
            <button
              onClick={onNext}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white/90 hover:bg-white/10 transition"
              type="button"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {photos.map((p, i) => (
              <button
                key={`${p.src}-${i}`}
                onClick={() => onSetIndex?.(i)}
                className={[
                  "shrink-0 w-24 h-16 rounded-xl overflow-hidden border transition",
                  i === index ? "border-white" : "border-white/15 hover:border-white/40",
                ].join(" ")}
                aria-label={`Open thumbnail ${i + 1}`}
                type="button"
              >
                <img src={p.src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const STAGE_META = {
  before: { label: "Before", blurb: "Pre-renovation condition and baseline documentation." },
  during: { label: "During", blurb: "Active demolition, cleanup, and construction progress." },
  after: { label: "After", blurb: "Final finishes, completed rooms, and end results." },
};

function StageTabs({ stage, setStage, counts }) {
  const stages = ["before", "during", "after"];
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-black text-white px-3 py-1 text-xs font-semibold">
            Photo Timeline
          </span>
          <span className="text-sm text-black/50">{counts.before + counts.during + counts.after} photos</span>
        </div>
        <h3 className="mt-3 text-xl md:text-2xl font-semibold text-gray-900">{STAGE_META[stage].label} Photos</h3>
        <p className="mt-2 text-[15px] md:text-base text-gray-600 max-w-3xl">{STAGE_META[stage].blurb}</p>
      </div>
      <div className="inline-flex rounded-full border border-black/10 bg-white p-1 shadow-sm">
        {stages.map((k) => {
          const active = stage === k;
          const disabled = counts[k] === 0;
          return (
            <button
              key={k}
              onClick={() => !disabled && setStage(k)}
              disabled={disabled}
              className={[
                "px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2",
                active ? "bg-black text-white" : "text-black/70 hover:bg-black/5",
                disabled ? "opacity-40 cursor-not-allowed hover:bg-transparent" : "",
              ].join(" ")}
              type="button"
              title={disabled ? "No photos yet" : ""}
            >
              {STAGE_META[k].label}
              <span className={["text-xs px-2 py-0.5 rounded-full", active ? "bg-white/20" : "bg-black/5"].join(" ")}>
                {counts[k]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BeforeDuringAfterGallery({ galleryStages }) {
  const before = normalizeList(galleryStages?.before, {
    caption: () => "Before renovation",
    alt: () => "Before renovation",
  });
  const during = normalizeList(galleryStages?.during, {
    caption: () => "During renovation",
    alt: () => "During renovation",
  });
  const after = normalizeList(galleryStages?.after, {
    caption: () => "After renovation",
    alt: () => "After renovation",
  });

  const counts = { before: before.length, during: during.length, after: after.length };
  const firstStage =
    (counts.before > 0 && "before") ||
    (counts.during > 0 && "during") ||
    (counts.after > 0 && "after") ||
    "before";

  const [stage, setStage] = useState(firstStage);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const stageCount = counts[stage] || 0;
    if (stageCount === 0) setStage(firstStage);
  }, [counts.before, counts.during, counts.after, firstStage, stage]);

  const photos = useMemo(() => {
    if (stage === "during") return during;
    if (stage === "after") return after;
    return before;
  }, [stage, before, during, after]);

  const openAt = (idx) => {
    setActiveIndex(idx);
    setOpen(true);
  };

  const close = () => setOpen(false);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    setOpen(false);
    setActiveIndex(0);
  }, [stage]);

  return (
    <div className="mt-10">
      <StageTabs stage={stage} setStage={setStage} counts={counts} />
      {photos.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-black/10 bg-white p-8 text-center">
          <div className="text-lg font-semibold text-gray-900">No photos yet</div>
          <div className="mt-2 text-sm text-gray-600">
            Add images to this stage in the CMS.
          </div>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {photos.map((p, i) => (
            <button
              key={`${p.src}-${i}`}
              onClick={() => openAt(i)}
              className="group text-left rounded-2xl overflow-hidden bg-white border border-black/10 shadow-sm hover:shadow-lg transition"
              aria-label="Open image"
              type="button"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={p.src}
                  alt={p.alt || `Photo ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="text-[13px] font-semibold text-gray-900 line-clamp-2">
                  {p.caption || `Photo ${i + 1}`}
                </div>
                <div className="mt-1 text-xs text-gray-500 line-clamp-1">{p.alt || ""}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      <StageLightbox
        open={open}
        photos={photos}
        index={activeIndex}
        onClose={close}
        onPrev={prev}
        onNext={next}
        onSetIndex={setActiveIndex}
      />
    </div>
  );
}

export default function PropertyDetails() {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setError("");
    api
      .getProperty(slug)
      .then((data) => {
        if (active) setProperty(data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Property not found");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const galleryStages = useMemo(() => {
    if (!property?.galleries) return null;
    return {
      before: property.galleries.beforeImages || [],
      during: property.galleries.duringImages || [],
      after: property.galleries.afterImages || [],
    };
  }, [property]);

  if (error) {
    return (
      <div className="min-h-screen bg-white p-10">
        <p className="text-xl text-red-600">{error}</p>
        <Link to="/greater-boston" className="mt-6 inline-block text-blue-600">
          Back to Greater Boston
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white p-10">
        <p className="text-xl text-gray-600">Loading property...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[520px] overflow-hidden border-b-4 border-black">
        <img
          src={resolveUrl(
            property.galleries?.afterImages?.[0]?.url ||
              property.galleries?.beforeImages?.[0]?.url ||
              ""
          )}
          alt={property.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full max-w-6xl mx-auto px-4 flex items-end pb-10">
          <div className="w-full">
            <Link
              to="/greater-boston"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-semibold"
            >
              <ChevronLeft size={18} /> Back
            </Link>
            <h1 className="mt-4 text-3xl md:text-5xl font-semibold text-white leading-tight">
              {property.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-white/90">
              <span className="flex items-center gap-2">
                <BedDouble size={18} /> {property.beds || "-"}
              </span>
              <span className="flex items-center gap-2">
                <Bath size={18} /> {property.baths || "-"}
              </span>
              <span className="flex items-center gap-2">
                <Car size={18} /> {property.parking || "-"}
              </span>
              <span className="flex items-center gap-2">
                <Ruler size={18} /> {property.sqft || "-"} sq ft
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="h-10 md:h-14" />
      {property.status === "coming_soon" ? (
        <section className="py-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-lime-50 via-white to-white p-7 md:p-10 shadow-sm">
              <span className="inline-flex w-fit items-center rounded-full bg-black text-white px-3 py-1 text-[11px] font-semibold tracking-[0.25em] uppercase">
                Coming Soon
              </span>
              <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-gray-900">Coming Soon</h2>
              <div className="mt-5 space-y-4 text-gray-800/90 text-[15px] md:text-base leading-relaxed">
                {property.description}
              </div>
            </div>
          </div>
        </section>
      ) : null}
      <PropertyOverview overview={{ heading: "Property Overview", paragraphs: [property.description || ""] }} />
      <section className="py-12 bg-gray-50">
        <SectionTitle title="Photo Gallery" sub="Before / During / After - click any image to expand." />
        <div className="max-w-6xl mx-auto px-4">
          {galleryStages ? (
            <BeforeDuringAfterGallery galleryStages={galleryStages} />
          ) : (
            <div className="mt-10 text-center text-black/60">No staged gallery configured for this property.</div>
          )}
        </div>
      </section>
    </div>
  );
}
