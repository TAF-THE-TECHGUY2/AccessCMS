import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import buildImg from "../assets/Build.png";

const HOW_IT_WORKS_LABEL = "how it works";
const INVEST_NOW_LABEL = "invest now";

const normalizeLabel = (label = "") => label.trim().toLowerCase();
const isExternalHref = (href = "") => /^https?:\/\//i.test(href);

export default function HeroSection({
  title = "Simple Real Estate Investing",
  subtitle = "for Anyone, Anywhere",
  badgeText = "Starting at just $100",
  backgroundImage = buildImg,
  overlayOpacity = 0.55,
  primaryButton = { label: "INVEST NOW", href: "/invest-now" },
  secondaryButton = { label: "HOW IT WORKS", href: "" },
  videoUrl = "/videos/how-it-works.mp4",
  secondaryButtonOpensVideo = false,
}) {
  const [showHowItWorksVideo, setShowHowItWorksVideo] = useState(false);
  const closeVideo = () => setShowHowItWorksVideo(false);
  const isMp4 = videoUrl && videoUrl.toLowerCase().endsWith(".mp4");
  const Container = ({ children }) => <div className="mx-auto w-full max-w-6xl px-4 md:px-6">{children}</div>;
  const orderedButtons = [primaryButton, secondaryButton]
    .filter((button) => button?.label)
    .sort((left, right) => {
      const leftLabel = normalizeLabel(left.label);
      const rightLabel = normalizeLabel(right.label);
      const isKnownPair =
        [leftLabel, rightLabel].includes(INVEST_NOW_LABEL) &&
        [leftLabel, rightLabel].includes(HOW_IT_WORKS_LABEL);

      if (!isKnownPair) return 0;
      if (leftLabel === INVEST_NOW_LABEL) return -1;
      if (rightLabel === INVEST_NOW_LABEL) return 1;
      return 0;
    });
  const renderButton = (button, key) => {
    if (!button?.label) return null;

    const buttonClass =
      "bg-gray-700 hover:bg-gray-800 text-white px-10 py-3 rounded-sm text-sm font-semibold tracking-wide transition-colors";
    // Opens the video popup when explicitly enabled in the CMS for the
    // secondary button, or (legacy) when the button is labelled "How It Works".
    const isVideoButton =
      (secondaryButtonOpensVideo && button === secondaryButton) ||
      normalizeLabel(button.label) === HOW_IT_WORKS_LABEL;

    if (isVideoButton && videoUrl) {
      return (
        <button
          key={key}
          onClick={() => (videoUrl ? setShowHowItWorksVideo(true) : null)}
          className={buttonClass}
          type="button"
        >
          {button.label}
        </button>
      );
    }

    if (isExternalHref(button.href)) {
      return (
        <a key={key} href={button.href} className={buttonClass}>
          {button.label}
        </a>
      );
    }

    return (
      <Link key={key} to={button.href || "/contact"} className={buttonClass}>
        {button.label}
      </Link>
    );
  };

  return (
    <>
      {/* HERO - Full background image */}
      <section
        className="relative h-[597px] bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />

        <div className="relative flex h-full flex-col justify-center">
          <Container>
            <div className="mx-auto max-w-4xl rounded-xl border border-white/10 bg-black/70 px-6 py-7 text-center shadow-lg backdrop-blur-md animate-slideDown md:px-10">
              <h1 className="text-white text-center text-3xl md:text-5xl font-medium tracking-wide leading-tight">
                {title}
                {subtitle ? (
                  <>
                    <br />
                    <span className="text-white/90">{subtitle}</span>
                  </>
                ) : null}
              </h1>
            </div>

            {badgeText ? (
              <div
                className="mx-auto mt-6 max-w-2xl rounded-md border border-white/10 bg-black/55 px-5 py-3 text-center backdrop-blur-sm animate-slideUp"
                style={{ animationDelay: "0.15s" }}
              >
                <p className="text-white text-center text-sm md:text-base font-medium">{badgeText}</p>
              </div>
            ) : null}

            <div
              className="mt-10 flex flex-wrap justify-center gap-6 animate-slideUp"
              style={{ animationDelay: "0.3s" }}
            >
              {orderedButtons.map((button, index) => renderButton(button, `hero-cta-${index}`))}
            </div>
          </Container>
        </div>
      </section>

      {/* VIDEO MODAL */}
      {showHowItWorksVideo && (
        <div
          className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center px-4"
          onClick={closeVideo}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeVideo}
              className="absolute top-3 right-3 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition"
              aria-label="Close video"
              type="button"
            >
              <X size={22} />
            </button>

            <div className="aspect-video">
              {isMp4 ? (
                <video className="w-full h-full" src={videoUrl} controls autoPlay playsInline />
              ) : (
                <iframe
                  className="w-full h-full"
                  src={videoUrl}
                  title="How It Works"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.8s ease-out; }
        .animate-slideUp { animation: slideUp 0.8s ease-out; }
      `}</style>
    </>
  );
}
