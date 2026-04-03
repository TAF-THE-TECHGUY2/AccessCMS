import mongoose, { Schema } from "mongoose";
const FaqSchema = new Schema({
    question: { type: String, required: true },
    answerHtml: { type: String, required: true },
    category: String,
    order: { type: Number, default: 0 },
}, { timestamps: true });
export const FAQ = mongoose.model("FAQ", FaqSchema);
