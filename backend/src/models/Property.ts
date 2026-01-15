import mongoose, { Schema, Document } from "mongoose";

export interface PropertyImage {
  url: string;
  key?: string;
  caption?: string;
  alt?: string;
  order?: number;
}

export interface PropertyDoc extends Document {
  slug: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: string;
  beds?: number;
  baths?: number;
  parking?: string;
  sqft?: number;
  lotSqft?: number;
  description?: string;
  status: "coming_soon" | "active" | "sold";
  featured: boolean;
  highlights: string[];
  facts: string[];
  galleries: {
    beforeImages: PropertyImage[];
    duringImages: PropertyImage[];
    afterImages: PropertyImage[];
  };
}

const ImageSchema = new Schema<PropertyImage>(
  {
    url: { type: String, required: true },
    key: String,
    caption: String,
    alt: String,
    order: Number,
  },
  { _id: false }
);

const PropertySchema = new Schema<PropertyDoc>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    type: { type: String, required: true },
    beds: Number,
    baths: Number,
    parking: String,
    sqft: Number,
    lotSqft: Number,
    description: String,
    status: {
      type: String,
      enum: ["coming_soon", "active", "sold"],
      default: "active",
    },
    featured: { type: Boolean, default: false },
    highlights: { type: [String], default: [] },
    facts: { type: [String], default: [] },
    galleries: {
      beforeImages: { type: [ImageSchema], default: [] },
      duringImages: { type: [ImageSchema], default: [] },
      afterImages: { type: [ImageSchema], default: [] },
    },
  },
  { timestamps: true }
);

export const Property = mongoose.model<PropertyDoc>("Property", PropertySchema);
