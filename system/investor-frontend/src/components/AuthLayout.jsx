import React from "react";
import { Link } from "react-router-dom";
import apMark from "../assets/ap-mark.jpg";

/**
 * Centered auth layout matching the approved Sign In design:
 * black AP monogram, serif heading, supporting copy, then a card.
 */
const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-screen flex-col bg-[#f4f3f0]">
    <main className="flex flex-1 flex-col items-center px-4 pb-16 pt-14 sm:pt-20">
      <Link to="/login" aria-label="Access Properties">
        <img
          src={apMark}
          alt="Access Properties"
          className="h-20 w-20 rounded-sm object-cover shadow-sm"
        />
      </Link>

      <h1
        className="mt-8 text-center text-4xl font-bold text-ink sm:text-[2.75rem]"
        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
      >
        {title}
      </h1>

      {subtitle ? (
        <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-slate">
          {subtitle}
        </p>
      ) : null}

      <div className="mt-9 w-full max-w-[26rem] rounded-2xl bg-white p-7 shadow-card sm:p-8">
        {children}
      </div>

      {footer ? (
        <div className="mt-7 text-center text-sm text-slate">{footer}</div>
      ) : null}
    </main>
  </div>
);

export default AuthLayout;
