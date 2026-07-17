import mongoose, { Schema } from "mongoose";
const ImageSchema = new Schema({
    url: { type: String, required: true },
    key: String,
    caption: String,
    alt: String,
    order: Number,
}, { _id: false });
const PropertySchema = new Schema({
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
    heroImage: String,
    holdingStatus: String,
    acquiredLabel: String,
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
}, { timestamps: true });
export const Property = mongoose.model("Property", PropertySchema);
