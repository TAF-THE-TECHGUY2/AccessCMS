import React from "react";
import { Lock } from "lucide-react";
import { getIcon } from "./iconMap.js";
import {
  useMemberSession,
  INVESTOR_LOGIN_URL,
  INVESTOR_REGISTER_URL,
  INVESTOR_PORTAL_URL,
} from "../../lib/memberSession.js";

const DEFAULT_BENEFITS = [
  {
    iconName: "BarChart3",
    title: "View fund overview",
    body: "Explore strategy, target returns, and key highlights.",
  },
  {
    iconName: "BadgeCheck",
    title: "Begin investor onboarding",
    body: "Complete your profile and start the investment process.",
  },
  {
    iconName: "Briefcase",
    title: "Review offering documents",
    body: "Access confidential offering memoranda and reports.",
  },
];

// The sign-up card that stands in front of the gated fund content. Hidden once
// the visitor is a member -- there is nothing left to invite them to do.
export default function MemberGateSection({ data }) {
  const { status, member } = useMemberSession();
  const {
    title = "Create an account to view fund information",
    body = "Detailed fund information, offering documents, and investment materials are available to registered users and prospective investors.",
    loginLabel = "Log In",
    loginHref = INVESTOR_LOGIN_URL,
    registerLabel = "Invest Now",
    registerHref = INVESTOR_REGISTER_URL,
    footnote = "Certain materials are available only to registered users and prospective investors.",
    benefits = DEFAULT_BENEFITS,
    memberTitle = "You're signed in",
    memberBody = "Full fund details are unlocked below.",
  } = data || {};

  if (status === "member") {
    return (
      <section className="pt-12 md:pt-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl md:text-2xl text-gray-900">
                {member?.firstName ? `Welcome back, ${member.firstName}.` : memberTitle}
              </h2>
              <p className="mt-1 text-gray-600 text-[15px]">{memberBody}</p>
            </div>
            <a
              href={`${INVESTOR_PORTAL_URL}/dashboard`}
              className="bg-black text-white px-6 py-3 rounded-md font-semibold text-[15px]"
            >
              Go to my portfolio
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-12 md:pt-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-10 md:px-12 md:py-14">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Lock className="w-7 h-7 text-gray-900" />
            </div>
            <h2 className="mt-6 font-serif text-3xl md:text-4xl text-gray-900 tracking-tight">
              {title}
            </h2>
            {body ? (
              <p className="mt-4 mx-auto max-w-2xl text-gray-600 text-[15px] md:text-base leading-relaxed">
                {body}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <a
                href={loginHref}
                className="min-w-[200px] border border-gray-900 text-gray-900 px-6 py-3 rounded-md font-semibold text-[15px] hover:bg-gray-50 transition"
              >
                {loginLabel}
              </a>
              <a
                href={registerHref}
                className="min-w-[200px] bg-black text-white px-6 py-3 rounded-md font-semibold text-[15px] hover:opacity-90 transition"
              >
                {registerLabel}
              </a>
            </div>
          </div>

          {benefits.length ? (
            <>
              <div className="mt-10 border-t border-gray-200" />
              <div className="mt-8 grid gap-8 md:grid-cols-3">
                {benefits.map((benefit, idx) => {
                  const Icon = getIcon(benefit.iconName);
                  return (
                    <div key={`${benefit.title}-${idx}`} className="flex gap-4">
                      <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-gray-900" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-[15px] leading-snug">
                          {benefit.title}
                        </p>
                        {benefit.body ? (
                          <p className="mt-1 text-gray-600 text-sm leading-relaxed">{benefit.body}</p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}

          {footnote ? (
            <div className="mt-10 flex items-center justify-center gap-2 text-gray-500 text-sm">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>{footnote}</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
