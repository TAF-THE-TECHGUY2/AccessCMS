import mongoose, { Schema, Document } from "mongoose";

export interface ContactMessageDoc extends Document {
  name: string;
  email: string;
  subject: string;
  phone?: string;
  topic?: string;
  message: string;
  status: "new" | "read" | "archived";
  ipAddress?: string;
  userAgent?: string;
}

const ContactMessageSchema = new Schema<ContactMessageDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    topic: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "read", "archived"],
      default: "new",
      index: true,
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

ContactMessageSchema.index({ createdAt: -1 });

export const ContactMessage = mongoose.model<ContactMessageDoc>(
  "ContactMessage",
  ContactMessageSchema
);
