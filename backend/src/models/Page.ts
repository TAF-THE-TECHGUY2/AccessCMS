import mongoose, { Schema, Document } from "mongoose";

// "MEMBERS" marks a section as investor-only. Today that is honoured by the
// public site's presentation layer; the API still returns the section data.
// The server-side strip (guests never receive `data`) lands with the shared
// .ap.boston login cookie -- see docs/member-gating.md.
export type SectionAccess = "PUBLIC" | "MEMBERS";

export interface PageSection {
  type: string;
  access: SectionAccess;
  data: Record<string, unknown>;
}

export interface PageDoc extends Document {
  slug: string;
  aliases: string[];
  title: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  sections: PageSection[];
  status: "draft" | "published";
  publishedAt?: Date;
}

const SectionSchema = new Schema<PageSection>(
  {
    type: { type: String, required: true },
    access: { type: String, enum: ["PUBLIC", "MEMBERS"], default: "PUBLIC" },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const PageSchema = new Schema<PageDoc>(
  {
    slug: { type: String, required: true, unique: true },
    // Previous slugs kept so old links keep working (public lookup falls back to these)
    aliases: { type: [String], default: [], index: true },
    title: { type: String, required: true },
    seo: {
      metaTitle: String,
      metaDescription: String,
      ogImage: String,
    },
    sections: { type: [SectionSchema], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: Date,
  },
  { timestamps: true }
);

export const Page = mongoose.model<PageDoc>("Page", PageSchema);
