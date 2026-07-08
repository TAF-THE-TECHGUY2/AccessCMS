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
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    api
      .getPage(slug)
      .then((page) => {
        if (active) setState({ status: "page", page });
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 404) {
          setState({ status: "property" });
        } else {
          setState({ status: "error", message: err.message || "Failed to load page" });
        }
      });
    return () => {
      active = false;
    };
  }, [slug]);

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
