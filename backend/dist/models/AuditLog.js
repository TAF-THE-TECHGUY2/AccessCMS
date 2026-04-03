import mongoose, { Schema } from "mongoose";
const AuditLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: String,
    metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });
export const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
