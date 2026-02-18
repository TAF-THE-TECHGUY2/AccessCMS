import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../lib/auth";

const Shell = ({ children, hideHeader = false, fullScreen = false }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {!hideHeader ? (
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <Logo />
            <div className="flex items-center gap-4 text-sm">
              {user ? (
                <>
                  <span className="text-slate">{user.email}</span>
                  <button
                    className="rounded-full border border-ink px-4 py-2 text-xs uppercase tracking-widest"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  className="rounded-full border border-ink px-4 py-2 text-xs uppercase tracking-widest"
                  to="/login"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </header>
      ) : null}
      <main
        className={
          fullScreen
            ? "mx-auto h-screen max-w-6xl overflow-hidden px-0 py-0"
            : `mx-auto max-w-6xl px-6 ${hideHeader ? "py-6" : "py-10"}`
        }
      >
        {children}
      </main>
    </div>
  );
};

export default Shell;
