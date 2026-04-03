import mongoose, { Schema } from "mongoose";
const MediaSchema = new Schema({
    url: { type: String, required: true },
    key: { type: String, required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
export const Media = mongoose.model("Media", MediaSchema);
