import React, { useEffect, useState } from "react";
import { FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa";
import { Link2 } from "lucide-react";
import { api } from "../../api.js";

const iconMap = {
  Facebook: FaFacebook,
  LinkedIn: FaLinkedin,
  Instagram: FaInstagram,
};

export default function SocialLinksSection({ data }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  const links = data?.links || settings?.footer?.socialLinks || [];
  if (!links.length) return null;

  return (
    <div className="pt-12">
      <p className="text-center text-xs tracking-widest text-gray-700">
        {data?.title || "FIND US ON SOCIAL MEDIA"}
      </p>
      <div className="mt-5 flex justify-center gap-4">
        {links.map((link) => {
          const Icon = iconMap[link.label] || Link2;
          const bg =
            link.label === "Facebook"
              ? "bg-[#1877F2]"
              : link.label === "LinkedIn"
              ? "bg-[#0A66C2]"
              : link.label === "Instagram"
              ? "bg-[#E1306C]"
              : "bg-black";
          return (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className={`w-10 h-10 flex items-center justify-center rounded-full ${bg} text-white shadow-sm hover:opacity-90 transition`}
              aria-label={link.label}
              title={link.label}
            >
              <Icon className="w-5 h-5" />
            </a>
          );
        })}
      </div>
      <br />
      <br />
    </div>
  );
}
