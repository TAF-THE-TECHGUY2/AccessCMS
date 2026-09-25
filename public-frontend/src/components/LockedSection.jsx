import React from "react";
import { Lock } from "lucide-react";

const Bar = ({ className = "" }) => (
  <div className={`h-3.5 rounded bg-gray-200 ${className}`} />
);

const PlaceholderCard = () => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
    <div className="h-40 rounded-lg bg-gray-100" />
    <div className="mt-5 h-5 w-3/4 rounded bg-gray-200" />
    <div className="mt-4 space-y-2.5">
      <Bar />
      <Bar className="w-2/3" />
    </div>
  </div>
);

/**
 * Stands in for a members-only section whose content the API withheld.
 *
 * Once the server strips a section there is nothing real left to blur, so
 * without this the locked card renders as an empty box. Sections that draw
 * their own locked state (FUND_DETAIL) do not use this. Nothing here derives
 * from the withheld content.
 */
export function LockedPlaceholder({ variant = "card" }) {
  if (variant === "grid") {
    return (
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <PlaceholderCard key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-10 md:px-12 md:py-14">
          <div className="h-8 w-2/5 rounded bg-gray-200" />
          <div className="mt-6 space-y-2.5">
            <Bar />
            <Bar />
            <Bar className="w-3/4" />
          </div>
          <div className="mt-8 h-6 w-1/3 rounded bg-gray-200" />
          <div className="mt-4 space-y-2.5">
            <Bar />
            <Bar className="w-2/3" />
          </div>
        </div>
      </div>
    </section>
  );
}

// Wraps a members-only section for a signed-out visitor: the real content is
// blurred and faded out behind a centred "Members access" card.
//
// The blur is decoration, not protection. `aria-hidden` and `inert` keep the
// unreadable content out of the accessibility tree and off the tab order, so a
// screen reader or keyboard user gets the card instead of a wall of blur.
export default function LockedSection({ children, title, subtitle }) {
  return (
    <div className="relative">
      <div
        className="pointer-events-none select-none blur-[6px] opacity-60"
        aria-hidden="true"
        // React 19 only emits the `inert` attribute for a literal `true`; an
        // empty string is falsy and silently drops it, leaving the blurred
        // links in the tab order.
        inert={true}
      >
        {children}
      </div>

      {/* Fades the blurred block into the page so it reads as "there is more
          below this" rather than as a broken render. */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white" />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center">
            <Lock className="w-7 h-7 text-gray-900" />
          </div>
          <h3 className="mt-4 font-serif text-2xl md:text-3xl text-gray-900">
            {title || "Members access"}
          </h3>
          <p className="mt-2 text-gray-600 text-[15px]">
            {subtitle || "Sign up or log in to unlock full fund details."}
          </p>
        </div>
      </div>
    </div>
  );
}
