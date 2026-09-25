import { Media } from "../models/Media.js";
import { logger } from "../config/logger.js";
/**
 * Guards uploaded files that belong to members-only content.
 *
 * Stripping a members-only section from the page response hides the image URL,
 * but the file still sits on disk behind a guessable path -- and any URL that
 * was ever public stays fetchable. This closes that: a file marked MEMBERS is
 * served only to a request carrying a valid member cookie.
 *
 * Guests get 404 rather than 401, so the response does not confirm that a
 * protected file exists at that path.
 */
// A file's access rarely changes, and a page can request many images at once,
// so avoid a database round trip per file.
const TTL_MS = 60_000;
const cache = new Map();
export const invalidateUploadAccess = (key) => {
    if (key)
        cache.delete(key);
    else
        cache.clear();
};
const lookupAccess = async (key) => {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < TTL_MS)
        return hit.access;
    const media = await Media.findOne({ key }).select("access").lean();
    // Files with no Media record predate the library or were placed by hand;
    // treat them as public so this cannot black out the existing site.
    const access = media?.access ?? "PUBLIC";
    cache.set(key, { access, at: Date.now() });
    return access;
};
export const guardUploads = async (req, res, next) => {
    // req.path here is relative to the /uploads mount, e.g. "/photo.png".
    const key = decodeURIComponent(req.path.replace(/^\/+/, ""));
    if (!key)
        return next();
    try {
        if ((await lookupAccess(key)) === "MEMBERS" && !req.member) {
            return res.status(404).json({ message: "Not found" });
        }
    }
    catch (err) {
        // A database blip must not turn a protected file into a public one.
        logger.error("Upload access check failed; refusing the file", err);
        return res.status(503).json({ message: "Unavailable" });
    }
    return next();
};
