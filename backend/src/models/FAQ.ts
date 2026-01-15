import mongoose, { Schema, Document } from "mongoose";

export interface FaqDoc extends Document {
  question: string;
  answerHtml: string;
  category?: string;
  order: number;
}

const FaqSchema = new Schema<FaqDoc>(
  {
    question: { type: String, required: true },
    answerHtml: { type: String, required: true },
    category: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const FAQ = mongoose.model<FaqDoc>("FAQ", FaqSchema);
