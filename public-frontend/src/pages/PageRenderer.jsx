import React, { useEffect, useState } from "react";
import SectionRenderer from "../components/SectionRenderer.jsx";
import { api } from "../api.js";
import { PageLoading, PageError } from "../components/PageStates.jsx";

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

  // Every section comes from the CMS, including the newsletter block on home
  // and contact. Nothing is injected here: a page with no NEWSLETTER section
  // is a page whose editor removed it.
  return <SectionRenderer sections={page.sections || []} />;
}
