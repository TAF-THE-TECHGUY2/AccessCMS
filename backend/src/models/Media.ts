import mongoose, { Schema, Document } from "mongoose";

export interface MediaDoc extends Document {
  url: string;
  key: string;
  mime: string;
  size: number;
  // "MEMBERS" files are served only to a verified investor. Stripping a
  // members-only section from the page response hides the URL, but the file
  // itself still has to be guarded or the URL alone is enough to fetch it.
  access: "PUBLIC" | "MEMBERS";
  createdBy?: mongoose.Types.ObjectId;
}

const MediaSchema = new Schema<MediaDoc>(
  {
    url: { type: String, required: true },
    key: { type: String, required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
    access: { type: String, enum: ["PUBLIC", "MEMBERS"], default: "PUBLIC", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Media = mongoose.model<MediaDoc>("Media", MediaSchema);
