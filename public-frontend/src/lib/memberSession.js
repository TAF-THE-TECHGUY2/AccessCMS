import { useEffect, useState } from "react";
import { API_BASE_URL } from "./api.js";

// Whether the visitor is signed in to the investor dashboard at
// investor.ap.boston. Every gated section on the public site branches on this.
//
// The two sites are separate origins, so this cannot be answered locally: the
// dashboard's bearer token lives in localStorage on investor.ap.boston and is
// unreadable here. What bridges them is a signed, HttpOnly cookie that the
// Laravel API sets on the shared `.ap.boston` parent domain at login. The
// browser sends it to api.ap.boston automatically; this call just asks that
// service what it saw.
//
// This hook drives presentation only. The gate itself is enforced server-side
// -- api.ap.boston strips members-only section content before it is sent -- so
// a visitor who forces this to "member" still has nothing to reveal.
// See docs/member-gating.md.

const resolveSession = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/member/session`, {
      credentials: "include",
    });
    if (!res.ok) return { status: "guest", member: null };

    const body = await res.json();
    return body?.authenticated
      ? { status: "member", member: body.member || null }
      : { status: "guest", member: null };
  } catch {
    return { status: "guest", member: null };
  }
};

export function useMemberSession() {
  // Starts locked and stays locked unless a session says otherwise, so a slow
  // or failed lookup falls closed rather than open.
  const [session, setSession] = useState({ status: "guest", member: null });

  useEffect(() => {
    let active = true;
    resolveSession()
      .then((next) => {
        if (active) setSession(next);
      })
      .catch(() => {
        if (active) setSession({ status: "guest", member: null });
      });
    return () => {
      active = false;
    };
  }, []);

  return session;
}

// Where the gate's buttons send people. `/` is the investor onboarding flow and
// `/login` the sign-in page -- both are real routes on the dashboard today.
export const INVESTOR_PORTAL_URL = "https://investor.ap.boston";
export const INVESTOR_LOGIN_URL = `${INVESTOR_PORTAL_URL}/login`;
export const INVESTOR_REGISTER_URL = INVESTOR_PORTAL_URL;
