import React from "react";

export default function PrimaryButton({ children, className = "", disabled = false, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        "inline-flex min-h-[56px] items-center justify-center rounded-xl bg-ap-teal px-7 py-3 text-sm font-semibold tracking-[0.04em] text-white shadow-float transition",
        disabled ? "cursor-not-allowed opacity-45" : "hover:bg-ap-teal-dark",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
