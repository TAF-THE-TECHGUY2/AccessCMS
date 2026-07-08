import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, API_BASE_URL } from "../api.js";
import logoFallback from "../assets/Logo.png";

const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;
  return url;
};

const isExternalHref = (href = "") => /^https?:\/\//i.test(href);

// Used until Site Settings provides navLinks (or if the API is unreachable).
const DEFAULT_NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Portfolios",
    href: "/portfolios",
    children: [{ label: "Greater Boston", href: "/greater-boston" }],
  },
  { label: "Invest Now", href: "/invest-now" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

// Older settings stored a flat list with "Greater Boston" as a top-level item
// (the previous NavBar hardcoded it into the Portfolios dropdown). Recreate
// that nesting until the menu is edited in the admin.
const normalizeNavLinks = (links) => {
  if (!Array.isArray(links) || links.length === 0) return DEFAULT_NAV_LINKS;
  const items = links.map((l) => ({
    label: l.label || "",
    href: l.href || "#",
    children: Array.isArray(l.children)
      ? l.children.map((c) => ({ label: c.label || "", href: c.href || "#" }))
      : [],
  }));
  const hasChildren = items.some((l) => l.children.length > 0);
  if (!hasChildren) {
    const gbIdx = items.findIndex((l) => l.label.toLowerCase() === "greater boston");
    const pfIdx = items.findIndex(
      (l) => l.href === "/portfolios" || l.label.toLowerCase() === "portfolios"
    );
    if (gbIdx !== -1 && pfIdx !== -1) {
      items[pfIdx].children = [items[gbIdx]];
      items.splice(gbIdx, 1);
    }
  }
  return items;
};

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mobileOpenIndex, setMobileOpenIndex] = useState(-1);
  const [desktopOpenIndex, setDesktopOpenIndex] = useState(-1);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const isActivePrefix = (prefix) =>
    location.pathname === prefix || location.pathname.startsWith(prefix + "/");
  const itemActive = (item) => {
    const own = item.href === "/" ? isActive("/") : isActivePrefix(item.href);
    const child = (item.children || []).some((c) => isActivePrefix(c.href));
    return own || child;
  };

  const desktopLinkClass = (active) =>
    `relative text-black font-medium text-[15px] transition-colors ${
      active ? "font-semibold" : "hover:opacity-80"
    }`;

  const mobileLinkClass = (path) =>
    `block py-3 px-4 rounded-lg transition-colors duration-200 ${
      isActive(path)
        ? "text-white font-semibold bg-gray-800"
        : "text-gray-300 hover:text-white"
    }`;

  const closeDesktopDropdowns = () => {
    setDesktopOpenIndex(-1);
  };

  const closeMobile = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setMobileOpenIndex(-1);
    }, 300);
  };

  const navLinks = useMemo(() => normalizeNavLinks(settings?.navLinks), [settings]);

  const NavLink = ({ to, active, onClick, children }) => (
    isExternalHref(to) ? (
      <a href={to} className={desktopLinkClass(active)} onClick={onClick}>
        {children}
        {active ? <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-black animate-expandWidth" /> : null}
      </a>
    ) : (
      <Link to={to} className={desktopLinkClass(active)} onClick={onClick}>
        {children}
        {active ? <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-black animate-expandWidth" /> : null}
      </Link>
    )
  );

  const MobileLink = ({ to, onClick, children }) =>
    isExternalHref(to) ? (
      <a href={to} onClick={onClick} className={mobileLinkClass("")}>
        {children}
      </a>
    ) : (
      <Link to={to} onClick={onClick} className={mobileLinkClass(to)}>
        {children}
      </Link>
    );

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes expandWidth {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
        .animate-expandWidth { animation: expandWidth 0.4s ease-out; transform-origin: left; }
        .animate-slideInRight { animation: slideInRight 0.3s ease-out; }
        .animate-slideOutRight { animation: slideOutRight 0.3s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-fadeOut { animation: fadeOut 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
      <header className="w-full bg-white border-b-4 border-black sticky top-0 z-50">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-4 py-5 md:grid-cols-[1fr_auto_1fr] md:gap-8 md:px-6 md:py-6 animate-fadeInUp">
          <div className="flex items-center justify-self-start">
            <Link to="/" className="flex items-center" onClick={closeDesktopDropdowns}>
              <img src={resolveUrl(settings?.logo) || logoFallback} alt="Access Properties" className="h-14 w-auto" />
            </Link>
          </div>

          <div className="hidden md:flex justify-self-center">
            <nav>
              <ul className="flex items-center gap-12">
                {navLinks.map((item, idx) =>
                  item.children && item.children.length > 0 ? (
                    <li
                      key={`${item.label}-${idx}`}
                      className="relative group flex items-center"
                      onMouseLeave={() => setDesktopOpenIndex(-1)}
                    >
                      <NavLink to={item.href} active={itemActive(item)} onClick={closeDesktopDropdowns}>
                        {item.label}
                      </NavLink>
                      <button
                        type="button"
                        onClick={() => setDesktopOpenIndex((p) => (p === idx ? -1 : idx))}
                        className="ml-1"
                        aria-label={`Toggle ${item.label} menu`}
                      >
                        <svg
                          className={`h-4 w-4 text-black transition-transform duration-200 ${
                            desktopOpenIndex === idx ? "rotate-180" : "group-hover:rotate-180"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <ul
                        className={[
                          "absolute left-0 top-full mt-3 w-64 bg-white border border-black/20 shadow-lg z-50",
                          "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200",
                          desktopOpenIndex === idx ? "opacity-100 visible" : "",
                        ].join(" ")}
                      >
                        {item.children.map((child, cIdx) => (
                          <li key={`${child.label}-${cIdx}`}>
                            <Link
                              to={child.href}
                              className="block px-5 py-3 text-sm text-black hover:bg-black hover:text-white transition"
                              onClick={closeDesktopDropdowns}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ) : (
                    <li key={`${item.label}-${idx}`}>
                      <NavLink to={item.href} active={itemActive(item)} onClick={closeDesktopDropdowns}>
                        {item.label}
                      </NavLink>
                    </li>
                  )
                )}
              </ul>
            </nav>
          </div>

          <div className="flex items-center justify-end gap-3 justify-self-end">
            <button
              className="md:hidden bg-black text-white p-2 hover:bg-gray-800 transition-colors"
              onClick={() => {
                setIsOpen(true);
                const activeIdx = navLinks.findIndex(
                  (item) => item.children && item.children.length > 0 && itemActive(item)
                );
                setMobileOpenIndex(activeIdx);
              }}
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {isOpen ? (
          <div className="md:hidden fixed inset-0 z-50 flex justify-end">
            <div
              className={`fixed inset-0 bg-black/30 ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
              onClick={closeMobile}
            />
            <div
              className={`relative bg-black h-full w-full max-w-sm shadow-2xl flex flex-col ${
                isClosing ? "animate-slideOutRight" : "animate-slideInRight"
              }`}
            >
              <div className="flex items-center p-3 border-b border-gray-800">
                <button
                  onClick={closeMobile}
                  className="bg-white text-black p-2 hover:bg-black hover:text-white border border-white transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
                {navLinks.map((item, idx) =>
                  item.children && item.children.length > 0 ? (
                    <div key={`${item.label}-${idx}`} className="rounded-lg bg-gray-950/70">
                      <button
                        onClick={() => setMobileOpenIndex((p) => (p === idx ? -1 : idx))}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                          itemActive(item)
                            ? "bg-gray-800 text-white font-semibold"
                            : "text-gray-300 hover:text-white"
                        }`}
                      >
                        <span>{item.label}</span>
                        <svg
                          className={`h-4 w-4 transition-transform duration-300 ${mobileOpenIndex === idx ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {mobileOpenIndex === idx ? (
                        <div className="pl-4 pr-2 pb-2 space-y-1 animate-slideDown">
                          <Link
                            to={item.href}
                            onClick={closeMobile}
                            className={`block py-2 px-4 text-sm rounded-lg transition-colors ${
                              isActive(item.href)
                                ? "bg-gray-800 text-white font-semibold"
                                : "text-gray-300 hover:text-white"
                            }`}
                          >
                            {item.label}
                          </Link>
                          {item.children.map((child, cIdx) => (
                            <Link
                              key={`${child.label}-${cIdx}`}
                              to={child.href}
                              onClick={closeMobile}
                              className={`block py-2 px-4 text-sm rounded-lg transition-colors ${
                                isActive(child.href)
                                  ? "bg-gray-800 text-white font-semibold"
                                  : "text-gray-300 hover:text-white"
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <MobileLink key={`${item.label}-${idx}`} to={item.href} onClick={closeMobile}>
                      {item.label}
                    </MobileLink>
                  )
                )}
              </nav>
              <div className="border-t border-gray-800 p-4" />
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
