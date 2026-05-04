import React, { useEffect, useState } from "react";
import SectionRenderer from "../components/SectionRenderer.jsx";
import NewsletterSignup from "../components/NewsletterSignup.jsx";
import { api } from "../api.js";

const normalizeText = (value = "") =>
  String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const homeNewsletterAnchorMatchers = [
  "who we are",
  "access properties is a real estate investment manager focused on expanding access to professionally managed real estate through a simple, transparent platform.",
];

const isHomeNewsletterAnchor = (section) => {
  const data = section?.data || {};
  const textCandidates = [
    data.title,
    data.subtitle,
    data.heading,
    data.body,
    data.bodyHtml,
    data.heroTitle,
    data.heroSubtitle,
    data.introText,
  ]
    .map(normalizeText)
    .filter(Boolean);

  return homeNewsletterAnchorMatchers.some((matcher) =>
    textCandidates.some((candidate) => candidate.includes(matcher))
  );
};

export default function PageRenderer({ slug }) {
  const [page, setPage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setError("");
    api
      .getPage(slug)
      .then((data) => {
        if (active) setPage(data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Failed to load page");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-red-600">
        {error}
      </div>
    );
  }

  if (!page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-gray-500">
        Loading...
      </div>
    );
  }

  const sections = page.sections || [];
  const homeIntroSectionIndex =
    slug === "home"
      ? sections.findIndex(
          (section) => isHomeNewsletterAnchor(section)
        )
      : -1;

  return (
    <>
      {slug === "home" && homeIntroSectionIndex >= 0 ? (
        <>
          <SectionRenderer sections={sections.slice(0, homeIntroSectionIndex + 1)} />
          <NewsletterSignup />
          <SectionRenderer sections={sections.slice(homeIntroSectionIndex + 1)} />
        </>
      ) : (
        <>
          <SectionRenderer sections={sections} />
          {(slug === "home" || slug === "contact") && <NewsletterSignup />}
        </>
      )}
    </>
  );
}
