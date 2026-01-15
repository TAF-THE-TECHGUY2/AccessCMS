import { AuditLog } from "../models/AuditLog.js";

export const logAudit = async ({
  userId,
  action,
  entity,
  entityId,
  metadata,
}: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) => {
  try {
    await AuditLog.create({ userId, action, entity, entityId, metadata });
  } catch {
    // ignore audit failures
  }
};
