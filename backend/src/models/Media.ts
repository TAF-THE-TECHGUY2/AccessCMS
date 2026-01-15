import mongoose, { Schema, Document } from "mongoose";

export interface MediaDoc extends Document {
  url: string;
  key: string;
  mime: string;
  size: number;
  createdBy?: mongoose.Types.ObjectId;
}

const MediaSchema = new Schema<MediaDoc>(
  {
    url: { type: String, required: true },
    key: { type: String, required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Media = mongoose.model<MediaDoc>("Media", MediaSchema);
