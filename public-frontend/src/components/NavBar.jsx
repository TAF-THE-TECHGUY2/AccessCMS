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

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mobilePortfoliosOpen, setMobilePortfoliosOpen] = useState(false);
  const [mobileInvestOpen, setMobileInvestOpen] = useState(false);
  const [desktopPortfoliosOpen, setDesktopPortfoliosOpen] = useState(false);
  const [desktopInvestOpen, setDesktopInvestOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const isActivePrefix = (prefix) =>
    location.pathname === prefix || location.pathname.startsWith(prefix + "/");
  const isInvestActive = () => isActivePrefix("/invest-now") || isActive("/faq");

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
    setDesktopPortfoliosOpen(false);
    setDesktopInvestOpen(false);
  };

  const closeMobile = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setMobilePortfoliosOpen(false);
      setMobileInvestOpen(false);
    }, 300);
  };

  const navLinks = useMemo(() => settings?.navLinks || [], [settings]);
  const findLink = (label, fallback) =>
    navLinks.find((l) => l.label.toLowerCase() === label.toLowerCase()) || fallback;

  const homeLink = findLink("Home", { label: "Home", href: "/" });
  const aboutLink = findLink("About", { label: "About", href: "/about" });
  const portfoliosLink = findLink("Portfolios", { label: "Portfolios", href: "/portfolios" });
  const faqLink = findLink("FAQ", { label: "FAQ", href: "/faq" });
  const contactLink = findLink("Contact", { label: "Contact", href: "/contact" });
  const greaterBostonLink = findLink("Greater Boston", { label: "Greater Boston", href: "/greater-boston" });
  const opportunitiesLink = findLink("Opportunities", { label: "Opportunities", href: "/invest-now/opportunities" });

  const NavLink = ({ to, active, onClick, children }) => (
    <Link to={to} className={desktopLinkClass(active)} onClick={onClick}>
      {children}
      {active ? <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-black animate-expandWidth" /> : null}
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
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-6 grid grid-cols-[auto_1fr_auto] items-center gap-6 animate-fadeInUp">
          <div className="flex items-center">
            <Link to="/" className="flex items-center" onClick={closeDesktopDropdowns}>
              <img src={resolveUrl(settings?.logo) || logoFallback} alt="Access Properties" className="h-14 w-auto" />
            </Link>
          </div>

          <div className="hidden md:flex justify-center">
            <nav>
              <ul className="flex items-center gap-12">
                <li>
                  <NavLink to={homeLink.href} active={isActive(homeLink.href)} onClick={closeDesktopDropdowns}>
                    {homeLink.label}
                  </NavLink>
                </li>
                <li>
                  <NavLink to={aboutLink.href} active={isActive(aboutLink.href)} onClick={closeDesktopDropdowns}>
                    {aboutLink.label}
                  </NavLink>
                </li>
                <li className="relative group flex items-center" onMouseLeave={() => setDesktopPortfoliosOpen(false)}>
                  <NavLink to={portfoliosLink.href} active={isActivePrefix("/portfolios")} onClick={closeDesktopDropdowns}>
                    {portfoliosLink.label}
                  </NavLink>
                  <button
                    type="button"
                    onClick={() => setDesktopPortfoliosOpen((p) => !p)}
                    className="ml-1"
                    aria-label="Toggle Portfolios menu"
                  >
                    <svg
                      className={`h-4 w-4 text-black transition-transform duration-200 ${
                        desktopPortfoliosOpen ? "rotate-180" : "group-hover:rotate-180"
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
                      desktopPortfoliosOpen ? "opacity-100 visible" : "",
                    ].join(" ")}
                  >
                    <li>
                      <Link
                        to={greaterBostonLink.href}
                        className="block px-5 py-3 text-sm text-black hover:bg-black hover:text-white transition"
                        onClick={closeDesktopDropdowns}
                      >
                        {greaterBostonLink.label}
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="relative group flex items-center" onMouseLeave={() => setDesktopInvestOpen(false)}>
                  <NavLink to="/invest-now" active={isInvestActive()} onClick={closeDesktopDropdowns}>
                    Invest Now
                  </NavLink>
                  <button
                    type="button"
                    onClick={() => setDesktopInvestOpen((p) => !p)}
                    className="ml-1"
                    aria-label="Toggle Invest Now menu"
                  >
                    <svg
                      className={`h-4 w-4 text-black transition-transform duration-200 ${
                        desktopInvestOpen ? "rotate-180" : "group-hover:rotate-180"
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
                      desktopInvestOpen ? "opacity-100 visible" : "",
                    ].join(" ")}
                  >
                    <li>
                      <Link
                        to={opportunitiesLink.href}
                        className="block px-5 py-3 text-sm text-black hover:bg-black hover:text-white transition"
                        onClick={closeDesktopDropdowns}
                      >
                        {opportunitiesLink.label}
                      </Link>
                    </li>
                  </ul>
                </li>
                <li>
                  <NavLink to={faqLink.href} active={isActive(faqLink.href)} onClick={closeDesktopDropdowns}>
                    {faqLink.label}
                  </NavLink>
                </li>
                <li>
                  <NavLink to={contactLink.href} active={isActive(contactLink.href)} onClick={closeDesktopDropdowns}>
                    {contactLink.label}
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button className="hidden md:inline-flex bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors">
              Login/Register
            </button>
            <button
              className="md:hidden bg-black text-white p-2 hover:bg-gray-800 transition-colors"
              onClick={() => setIsOpen(true)}
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
              className={`relative bg-black h-full w-80 max-w-full shadow-2xl flex flex-col ${
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
                <Link to={homeLink.href} onClick={closeMobile} className={mobileLinkClass(homeLink.href)}>
                  {homeLink.label}
                </Link>
                <Link to={aboutLink.href} onClick={closeMobile} className={mobileLinkClass(aboutLink.href)}>
                  {aboutLink.label}
                </Link>
                <Link to={portfoliosLink.href} onClick={closeMobile} className={mobileLinkClass(portfoliosLink.href)}>
                  {portfoliosLink.label}
                </Link>
                <div>
                  <button
                    onClick={() => setMobilePortfoliosOpen(!mobilePortfoliosOpen)}
                    className="w-full flex items-center justify-between text-gray-300 hover:text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    <span className="text-sm">{greaterBostonLink.label}</span>
                    <svg
                      className={`h-4 w-4 transition-transform duration-300 ${mobilePortfoliosOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {mobilePortfoliosOpen ? (
                    <div className="pl-6 space-y-1 mt-1 bg-gray-900 rounded-lg py-2 animate-slideDown">
                      <Link
                        to={greaterBostonLink.href}
                        onClick={closeMobile}
                        className="block py-2 px-4 text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        {greaterBostonLink.label}
                      </Link>
                    </div>
                  ) : null}
                </div>
                <div>
                  <button
                    onClick={() => setMobileInvestOpen(!mobileInvestOpen)}
                    className="w-full flex items-center justify-between text-gray-300 hover:text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    <span className={isInvestActive() ? "font-semibold text-white" : ""}>Invest Now</span>
                    <svg
                      className={`h-4 w-4 transition-transform duration-300 ${mobileInvestOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {mobileInvestOpen ? (
                    <div className="pl-6 space-y-1 mt-1 bg-gray-900 rounded-lg py-2 animate-slideDown">
                      <Link
                        to={opportunitiesLink.href}
                        onClick={closeMobile}
                        className="block py-2 px-4 text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        {opportunitiesLink.label}
                      </Link>
                    </div>
                  ) : null}
                </div>
                <Link to={faqLink.href} onClick={closeMobile} className={mobileLinkClass(faqLink.href)}>
                  {faqLink.label}
                </Link>
                <Link to={contactLink.href} onClick={closeMobile} className={mobileLinkClass(contactLink.href)}>
                  {contactLink.label}
                </Link>
              </nav>
              <div className="border-t border-gray-800 p-4">
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Login/Register
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
