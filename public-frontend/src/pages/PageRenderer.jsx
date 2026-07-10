import React, { useEffect, useState } from "react";
import SectionRenderer from "../components/SectionRenderer.jsx";
import NewsletterSignup from "../components/NewsletterSignup.jsx";
import { api } from "../api.js";
import { PageLoading, PageError } from "../components/PageStates.jsx";

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

export default function PageRenderer({ slug, page: initialPage }) {
  const [page, setPage] = useState(initialPage || null);
  const [error, setError] = useState("");

  useEffect(() => {
    // When the page document is passed in (dynamic routing), skip fetching.
    if (initialPage) {
      setPage(initialPage);
      setError("");
      return undefined;
    }
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
  }, [slug, initialPage]);

  // Apply the page's SEO settings from the CMS (browser tab title + meta description)
  useEffect(() => {
    if (!page) return;
    const seo = page.seo || {};
    document.title = seo.metaTitle || `${page.title} | Access Properties`;
    if (seo.metaDescription) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", seo.metaDescription);
    }
  }, [page]);

  if (error) {
    return <PageError message={error} />;
  }

  if (!page) {
    return <PageLoading />;
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
