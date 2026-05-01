import React from "react";

export default function OptionButton({
  title,
  description,
  selected = false,
  className = "",
  centered = false,
  children,
  ...props
}) {
  return (
    <button
      type="button"
      className={[
        "w-full rounded-xl border bg-white px-5 py-4 text-left shadow-sm transition",
        selected
          ? "border-ap-teal bg-[#F3F8F8] shadow-float"
          : "border-ap-border hover:border-ap-teal/50 hover:shadow-md",
        centered ? "text-center" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {title ? <div className="text-base font-medium text-ap-ink">{title}</div> : null}
      {description ? <p className="mt-2 text-sm leading-6 text-ap-muted">{description}</p> : null}
      {children}
    </button>
  );
}
