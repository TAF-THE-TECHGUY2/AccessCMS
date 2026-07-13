import mongoose, { Schema, Document } from "mongoose";

export interface SiteSettingsDoc extends Document {
  siteName: string;
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  navLinks: { label: string; href: string; children?: { label: string; href: string }[] }[];
  header?: {
    loginLabel?: string;
    loginHref?: string;
    signupLabel?: string;
    signupHref?: string;
  };
  footer: {
    address?: string;
    phones?: string[];
    emails?: string[];
    socialLinks?: { label: string; url: string }[];
    quickLinks?: { label: string; href: string }[];
    ctaLine?: string;
    ctaSubline?: string;
  };
  defaultSeo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  analytics: {
    gaId?: string;
    gtmId?: string;
  };
}

const SiteSettingsSchema = new Schema<SiteSettingsDoc>(
  {
    siteName: { type: String, required: true },
    logo: String,
    favicon: String,
    primaryColor: String,
    navLinks: {
      type: [
        {
          label: String,
          href: String,
          // One level of dropdown items under this menu entry
          children: { type: [{ label: String, href: String }], default: [] },
        },
      ],
      default: [],
    },
    // Login / Sign Up buttons in the public site's top bar
    header: {
      loginLabel: String,
      loginHref: String,
      signupLabel: String,
      signupHref: String,
    },
    footer: {
      address: String,
      phones: { type: [String], default: [] },
      emails: { type: [String], default: [] },
      socialLinks: { type: [{ label: String, url: String }], default: [] },
      quickLinks: { type: [{ label: String, href: String }], default: [] },
      ctaLine: String,
      ctaSubline: String,
    },
    defaultSeo: {
      metaTitle: String,
      metaDescription: String,
      ogImage: String,
    },
    analytics: {
      gaId: String,
      gtmId: String,
    },
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model<SiteSettingsDoc>(
  "SiteSettings",
  SiteSettingsSchema
);
