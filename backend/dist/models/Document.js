import mongoose, { Schema } from "mongoose";
const DocumentSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    fileUrl: { type: String, required: true },
    category: String,
    order: { type: Number, default: 0 },
}, { timestamps: true });
export const Document = mongoose.model("Document", DocumentSchema);
