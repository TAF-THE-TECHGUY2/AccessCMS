import mongoose, { Schema } from "mongoose";
const ContactMessageSchema = new Schema({
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
}, { timestamps: true });
ContactMessageSchema.index({ createdAt: -1 });
export const ContactMessage = mongoose.model("ContactMessage", ContactMessageSchema);
