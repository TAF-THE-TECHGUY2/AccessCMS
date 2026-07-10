import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { api } from "../api.js";
import PageRenderer from "./PageRenderer.jsx";
import PropertyDetails from "./PropertyDetails.jsx";

// Renders whatever published CMS page matches the URL. If the URL matches an
// old slug (alias), redirects to the page's current slug. If no page matches,
// falls back to property details (previous catch-all behaviour).
export default function DynamicPage() {
  const { slug: rawSlug } = useParams();
  const slug = rawSlug || "home";
  const [loaded, setLoaded] = useState({ status: "loading", forSlug: slug });

  useEffect(() => {
    let active = true;
    setLoaded({ status: "loading", forSlug: slug });
    api
      .getPage(slug)
      .then((page) => {
        if (active) setLoaded({ status: "page", page, forSlug: slug });
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 404) {
          setLoaded({ status: "property", forSlug: slug });
        } else {
          setLoaded({ status: "error", message: err.message || "Failed to load page", forSlug: slug });
        }
      });
    return () => {
      active = false;
    };
  }, [slug]);

  // On client-side navigation the state still holds the PREVIOUS page for one
  // render; treating it as current would redirect back to the old URL.
  const state = loaded.forSlug === slug ? loaded : { status: "loading" };

  if (state.status === "loading") {
    return <div className="max-w-4xl mx-auto px-4 py-10 text-gray-500">Loading...</div>;
  }
  if (state.status === "property") {
    return <PropertyDetails />;
  }
  if (state.status === "error") {
    return <div className="max-w-4xl mx-auto px-4 py-10 text-red-600">{state.message}</div>;
  }

  const page = state.page;
  const canonical = page.slug === "/" ? "home" : page.slug;
  // Matched via an old slug — send the visitor to the current URL.
  if (canonical !== slug) {
    return <Navigate to={canonical === "home" ? "/" : `/${canonical}`} replace />;
  }
  return <PageRenderer slug={canonical} page={page} />;
}
