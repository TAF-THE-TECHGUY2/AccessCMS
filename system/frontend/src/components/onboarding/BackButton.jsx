import React from "react";

export default function BackButton({ children = "Back", className = "", disabled = false, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        "inline-flex min-h-[64px] min-w-[96px] items-center justify-center rounded-2xl border border-ap-border bg-white px-6 py-3 text-base font-medium text-ap-ink shadow-sm transition",
        disabled ? "cursor-not-allowed opacity-40" : "hover:border-ap-teal/30 hover:text-ap-teal",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
