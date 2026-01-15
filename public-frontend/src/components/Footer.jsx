import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Linkedin, Instagram } from "lucide-react";
import { api } from "../api.js";

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  const footer = settings?.footer || {};
  const quickLinks = footer.quickLinks || [
    { label: "Invest Now", href: "/greater-boston" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ];

  const socialLinks = footer.socialLinks || [];
  const getIcon = (label) => {
    if (label === "Facebook") return Facebook;
    if (label === "LinkedIn") return Linkedin;
    if (label === "Instagram") return Instagram;
    return null;
  };

  return (
    <footer className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-20 space-y-12">
        <div className="text-center">
          <p className="text-2xl md:text-3xl font-semibold tracking-tight">
            {footer.ctaLine || "Start investing in real estate today"}
          </p>
          <p className="mt-3 text-gray-400 text-base">It's easier than you think.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="border border-gray-500 text-white px-7 py-3 rounded-md text-sm font-semibold hover:border-white transition"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="my-16 h-px bg-gray-800" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="font-semibold text-white">{settings?.siteName || "Access Properties"}</p>
            <p className="mt-1 text-sm text-gray-400 max-w-md">
              Simple Real Estate Investing for Anyone, Anywhere
            </p>
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map((link) => {
                const Icon = getIcon(link.label);
                if (!Icon) return null;
                return (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:border-white hover:bg-white/10 transition"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} {settings?.siteName || "Access Properties"}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
