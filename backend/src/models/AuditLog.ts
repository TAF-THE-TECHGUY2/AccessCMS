import mongoose, { Schema, Document } from "mongoose";

export interface AuditLogDoc extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

const AuditLogSchema = new Schema<AuditLogDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: String,
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<AuditLogDoc>(
  "AuditLog",
  AuditLogSchema
);
