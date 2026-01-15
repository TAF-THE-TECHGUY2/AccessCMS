import React, { useEffect, useState } from "react";
import SectionRenderer from "../components/SectionRenderer.jsx";
import { api } from "../api.js";

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

  return <SectionRenderer sections={page.sections || []} />;
}
