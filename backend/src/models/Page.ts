import mongoose, { Schema, Document } from "mongoose";

export interface PageSection {
  type: string;
  data: Record<string, unknown>;
}

export interface PageDoc extends Document {
  slug: string;
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
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const PageSchema = new Schema<PageDoc>(
  {
    slug: { type: String, required: true, unique: true },
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
