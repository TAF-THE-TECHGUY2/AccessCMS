import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import buildImg from "../assets/Build.png";

export default function HeroSection({
  title = "Simple Real Estate Investing",
  subtitle = "for Anyone, Anywhere",
  badgeText = "Starting at just $100",
  backgroundImage = buildImg,
  overlayOpacity = 0.55,
  primaryButton = { label: "HOW IT WORKS", href: "" },
  secondaryButton = { label: "INVEST NOW", href: "/contact" },
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
}) {
  const [showHowItWorksVideo, setShowHowItWorksVideo] = useState(false);
  const closeVideo = () => setShowHowItWorksVideo(false);
const Container = ({ children }) => (
  <div className="max-w-6xl mx-auto px-4">
    {children}
  </div>
);

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

        <div className="relative h-full flex flex-col items-center justify-center">
          <Container>
            <div className="mx-auto rounded-xl py-7 px-6 md:px-10 shadow-lg animate-slideDown bg-black/70 backdrop-blur-md border border-white/10">
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
                className="mx-auto mt-6 rounded-md py-3 px-5 max-w-2xl animate-slideUp bg-black/55 backdrop-blur-sm border border-white/10"
                style={{ animationDelay: "0.15s" }}
              >
                <p className="text-white text-center text-sm md:text-base font-medium">{badgeText}</p>
              </div>
            ) : null}

            <div
              className="mt-10 flex flex-wrap gap-6 justify-center animate-slideUp"
              style={{ animationDelay: "0.3s" }}
            >
              {primaryButton?.label ? (
                <button
                  onClick={() => (videoUrl ? setShowHowItWorksVideo(true) : null)}
                  className="bg-gray-700 hover:bg-gray-800 text-white px-10 py-3 rounded-sm text-sm font-semibold tracking-wide transition-colors"
                  type="button"
                >
                  {primaryButton.label}
                </button>
              ) : null}

              {secondaryButton?.label ? (
                <Link to={secondaryButton.href || "/contact"}>
                  <button
                    className="bg-gray-700 hover:bg-gray-800 text-white px-10 py-3 rounded-sm text-sm font-semibold tracking-wide transition-colors"
                    type="button"
                  >
                    {secondaryButton.label}
                  </button>
                </Link>
              ) : null}
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
              <iframe
                className="w-full h-full"
                src={videoUrl}
                title="How It Works"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
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

