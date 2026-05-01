import React from "react";

export default function StepCard({
  eyebrow,
  title,
  description,
  children,
  footer,
  className = "",
  contentClassName = "",
  footerClassName = "",
}) {
  return (
    <section className={["overflow-hidden rounded-[32px] border border-ap-border bg-ap-card shadow-calm", className].join(" ")}>
      <div className="p-6 sm:p-8 lg:p-10">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ap-teal">{eyebrow}</p>
      ) : null}
      {title ? <h1 className="mt-5 font-serif text-3xl leading-[1.08] text-ap-ink sm:text-5xl">{title}</h1> : null}
      {description ? <p className="mt-5 max-w-3xl text-base leading-8 text-ap-muted sm:text-[1.05rem]">{description}</p> : null}
      <div className={["mt-8 space-y-6", contentClassName].join(" ")}>{children}</div>
      </div>
      {footer ? (
        <div className={["border-t border-ap-border bg-ap-panel px-6 py-5 sm:px-8 lg:px-10", footerClassName].join(" ")}>
          <div className="flex flex-wrap items-center justify-end gap-3">{footer}</div>
        </div>
      ) : null}
    </section>
  );
}
