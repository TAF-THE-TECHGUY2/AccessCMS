import React from "react";
import NewsletterSignup from "../NewsletterSignup.jsx";

export default function NewsletterSection({ data }) {
  return (
    <NewsletterSignup
      title={data?.title || undefined}
      subtitle={data?.subtitle ?? undefined}
      buttonLabel={data?.buttonLabel || undefined}
      buttonHref={data?.buttonHref || undefined}
    />
  );
}
