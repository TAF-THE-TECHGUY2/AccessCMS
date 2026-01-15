import React from "react";
import HeroS from "../HeroS.jsx";
import { API_BASE_URL } from "../../api.js";

const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;
  return url;
};

export default function HeroSection({ data }) {
  const payload = {
    ...data,
    backgroundImage: data?.backgroundImage ? resolveUrl(data.backgroundImage) : undefined,
  };
  return <HeroS {...payload} />;
}
