import { AuditLog } from "../models/AuditLog.js";
export const logAudit = async ({ userId, action, entity, entityId, metadata, }) => {
    try {
        await AuditLog.create({ userId, action, entity, entityId, metadata });
    }
    catch {
        // ignore audit failures
    }
};
