import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
/**
 * Identifies the visitor as a signed-in investor, if they are one.
 *
 * The Laravel API at investor-api.ap.boston sets a signed, HttpOnly cookie on
 * the shared `.ap.boston` parent domain at investor login, so requests to this
 * service carry it automatically. Verifying it here means the public site can
 * gate content without this service ever calling back to Laravel.
 *
 * Never throws: a missing, malformed or expired cookie simply means "guest".
 */
export const resolveMember = (req, _res, next) => {
    req.member = null;
    if (!env.memberJwtSecret) {
        return next();
    }
    const token = req.cookies?.[env.memberCookieName];
    if (!token)
        return next();
    try {
        const claims = jwt.verify(token, env.memberJwtSecret);
        if (claims?.sub)
            req.member = claims;
    }
    catch {
        // Expired or tampered with -- treat as a guest rather than an error, so a
        // stale cookie shows the locked page instead of breaking it.
    }
    return next();
};
/** The first name only, for greeting the visitor. */
export const memberFirstName = (member) => member?.name ? String(member.name).trim().split(/\s+/)[0] : undefined;
