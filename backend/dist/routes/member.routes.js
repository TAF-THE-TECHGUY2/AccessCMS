import { Router } from "express";
import { resolveMember, memberFirstName } from "../middleware/member.js";
export const publicRouter = Router();
publicRouter.use(resolveMember);
/**
 * Lets the public site show the right header state and decide what to render
 * without exposing anything about the investor beyond their first name.
 */
publicRouter.get("/session", (req, res) => {
    if (!req.member) {
        return res.json({ authenticated: false, member: null });
    }
    return res.json({
        authenticated: true,
        member: { firstName: memberFirstName(req.member) },
    });
});
