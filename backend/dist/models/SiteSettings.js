import mongoose, { Schema } from "mongoose";
const SiteSettingsSchema = new Schema({
    siteName: { type: String, required: true },
    logo: String,
    favicon: String,
    primaryColor: String,
    navLinks: {
        type: [{ label: String, href: String }],
        default: [],
    },
    footer: {
        address: String,
        phones: { type: [String], default: [] },
        emails: { type: [String], default: [] },
        socialLinks: { type: [{ label: String, url: String }], default: [] },
        quickLinks: { type: [{ label: String, href: String }], default: [] },
        ctaLine: String,
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
}, { timestamps: true });
export const SiteSettings = mongoose.model("SiteSettings", SiteSettingsSchema);
