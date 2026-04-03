import mongoose, { Schema } from "mongoose";
const SectionSchema = new Schema({
    type: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
}, { _id: false });
const PageSchema = new Schema({
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
}, { timestamps: true });
export const Page = mongoose.model("Page", PageSchema);
