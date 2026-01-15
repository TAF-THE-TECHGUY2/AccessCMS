import React from "react";

export default function SectionBar({ children, className = "" }) {
  return (
    <>
      <div className="w-full flex justify-center px-4">
        <div
          className={[
            "w-full max-w-[1120px] bg-black rounded-[14px] py-[18px]",
            "shadow-[0_8px_18px_rgba(0,0,0,0.18)] animate-fadeInUp",
            className,
          ].join(" ")}
        >
          <h2 className="text-center text-white font-light tracking-wide text-[34px] md:text-[56px] leading-none">
            {children}
          </h2>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
      `}</style>
    </>
  );
}
