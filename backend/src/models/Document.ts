import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface DocumentDoc extends MongooseDocument {
  title: string;
  description?: string;
  fileUrl: string;
  category?: string;
  order: number;
}

const DocumentSchema = new Schema<DocumentDoc>(
  {
    title: { type: String, required: true },
    description: String,
    fileUrl: { type: String, required: true },
    category: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Document = mongoose.model<DocumentDoc>("Document", DocumentSchema);
