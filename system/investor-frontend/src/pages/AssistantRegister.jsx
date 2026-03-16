import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import { api } from "../lib/api";

const FUND_NAME =
  "Access Properties Real Estate Diversified Income Fund I (Greater Boston Fund)";
const PORTFOLIOS_URL = "https://ap.boston/portfolios";
const NEWSLETTER_URL =
  "https://mailchi.mp/052b0234689c/access-properties";
const SEC_ACCREDITED_INVESTOR_URL =
  "https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/accredited-investors";
const SESSION_STORAGE_KEY =
  "access-properties-assistant-register-script-exact-v3";

const FAQ_ITEMS = [
  "What is Access Properties?",
  "Who can invest with Access Properties?",
  "Who owns the properties?",
  "What legal structure does Access Properties use?",
  "Are investments guaranteed?",
  "Can I sell my investment?",
  "How does Access Properties support a fund-family model?",
  "Can non-U.S. investors participate?",
  "Do I need a U.S. bank account to invest?",
  "How does Access Properties select investments?",
  "What investment strategies does Access Properties employ?",
  "Who manages the properties?",
  "How often will I receive updates on my investment?",
  "What happens if a property needs major repairs?",
  "How does Access Properties handle tenant issues?",
  "Can I visit the properties I’ve invested in?",
  "What tax documents will I receive?",
  "How is rental income taxed?",
  "What is depreciation and how does it benefit me?",
  "Can I deduct losses from my investment?",
  "What happens tax-wise when a property is sold?",
  "Are distributions taxable?",
  "Do I need to file taxes in Massachusetts?",
  "Can I use a self-directed IRA or 401(k) to invest?",
  "Are there special tax considerations for non-U.S. investors?",
  "What is the minimum investment?",
  "How are returns generated?",
  "How often are distributions paid?",
  "What fees does Access Properties charge?",
  "How is property valuation determined?",
  "What is the typical hold period?",
  "What risks should I be aware of?",
  "Full Disclosure",
];

const READY_FOOTNOTES_MESSAGE = {
  messageKey: "ready_footnotes",
  text:
    "*1 Access Properties follows SEC rules regarding investor eligibility. Certain private investment opportunities are only available to Accredited Investors as defined by the U.S. Securities and Exchange Commission (SEC). We ask eligibility questions to ensure we only present investment pathways you are legally permitted to access.\n\n" +
    "*2 Account becomes Active once funds clear",
  links: [
    {
      href: SEC_ACCREDITED_INVESTOR_URL,
      label: "Read the SEC guidance on Accredited Investors",
    },
  ],
};

const FAQ_FALLBACK_MESSAGE =
  "We're still preparing that answer. You can continue onboarding now, or contact support for more detail.";

const FAQ_ANSWER_COPY = {
  "What is Access Properties?":
    "Access Properties is a private real estate investment platform that gives investors access to professionally managed, diversified real estate portfolios with low minimums. The platform focuses on acquiring, renovating, and managing properties in the Greater Boston area.",
  "Who can invest with Access Properties?":
    "Both accredited investors and non-accredited investors can participate, subject to the rules of the offering. Accredited investors typically access higher-minimum direct opportunities, while crowdfunders can start from $100.",
  "Who owns the properties?":
    "Each property is owned by Access Properties LLC. When you invest, you receive an indirect fractional ownership interest in a managed real estate portfolio rather than direct title to an individual property.",
  "What legal structure does Access Properties use?":
    "Access Properties operates as a Limited Liability Company (LLC). Investors become members of the LLC and receive membership interests proportional to their investment, which supports liability protection and pass-through tax treatment.",
  "Are investments guaranteed?":
    "No. Real estate investments involve risk, including the possible loss of principal. Market conditions, property performance, financing conditions, and broader economic factors can all affect returns.",
  "Can I sell my investment?":
    "These investments are generally illiquid and designed for long-term holding. Transfers may be possible in limited situations and with company approval, but there is no established secondary market.",
  "How does Access Properties support a fund-family model?":
    "Access Properties pools investor capital to build diversified real estate portfolios and can structure multiple funds across geographies and strategies. That model supports broader participation while giving the platform flexibility to launch new offerings over time.",
  "Can non-U.S. investors participate?":
    "In some cases, yes. Eligibility depends on the specific offering, securities laws, AML/KYC requirements, and any additional documentation needed for international investors.",
  "Do I need a U.S. bank account to invest?":
    "Not always, but your funding and distribution options may depend on the offering and your banking setup. If you do not have a U.S. bank account, Access Properties may request additional payment or compliance details before you invest.",
  "How does Access Properties select investments?":
    "The team looks for undervalued properties in strong Greater Boston submarkets with appreciation potential. Key factors include location quality, renovation upside, rental demand, and fit with the strategy being used.",
  "What investment strategies does Access Properties employ?":
    "Access Properties uses three primary strategies:\n- Buy & Hold for long-term rental income\n- BRRR (Buy, Renovate, Rent, Refinance) to create value and refinance stabilized properties\n- Fix & Flip for shorter-term renovation and resale opportunities",
  "Who manages the properties?":
    "Properties are professionally managed by the Access Properties team. That includes tenant screening, rent collection, maintenance coordination, renovations, and regulatory compliance.",
  "How often will I receive updates on my investment?":
    "Investors receive quarterly performance updates covering property operations, occupancy, financial performance, and major developments. Important events such as refinancings, renovations, or property sales are also communicated as they happen.",
  "What happens if a property needs major repairs?":
    "Access Properties maintains reserves for capital expenditures and unexpected repairs, and major repairs are factored into underwriting whenever possible. If extraordinary costs exceed reserves, distributions may be deferred and, in rare cases, a capital call may be considered.",
  "How does Access Properties handle tenant issues?":
    "The property management team handles tenant matters including lease enforcement, maintenance requests, conflict resolution, and, when necessary, eviction proceedings. The goal is to preserve occupancy and respond quickly to operational issues.",
  "Can I visit the properties I’ve invested in?":
    "Usually not for occupied units, because tenant privacy and operations come first. Instead, investors receive photo updates, virtual tours, and progress reporting through the platform.",
  "What tax documents will I receive?":
    "As an LLC member, you typically receive a Schedule K-1 each year. The K-1 reports your share of income, losses, deductions, and credits so you can complete your tax return.",
  "How is rental income taxed?":
    "Rental income generally flows through to you as passive income on your K-1. It is often offset by expenses such as depreciation, mortgage interest, taxes, insurance, maintenance, and management fees.",
  "What is depreciation and how does it benefit me?":
    "Depreciation is a non-cash tax deduction that can reduce taxable income from the investment. Even if the property is appreciating in market value, depreciation may help lower the income reported for tax purposes.",
  "Can I deduct losses from my investment?":
    "Passive losses usually offset passive income first, and unused passive losses may carry forward. Depending on your status and tax profile, different rules may apply, so it is best to confirm with a tax advisor.",
  "What happens tax-wise when a property is sold?":
    "A sale can create capital gains or losses that flow through on your K-1. Long-term gains may receive favorable tax treatment, while depreciation recapture can also apply.",
  "Are distributions taxable?":
    "Distributions themselves are not always the same thing as taxable income. In many cases you are taxed on your share of LLC income whether or not cash is distributed, and distributions may reduce your basis in the investment.",
  "Do I need to file taxes in Massachusetts?":
    "If you are not a Massachusetts resident but invest in Massachusetts real estate, you may need to file a Massachusetts non-resident return for your share of in-state income. A tax professional can tell you how that applies to your situation.",
  "Can I use a self-directed IRA or 401(k) to invest?":
    "Yes, self-directed retirement accounts can invest in Access Properties. However, debt-financed real estate can create special tax considerations such as UBTI, so it is important to coordinate with your custodian and tax advisor.",
  "Are there special tax considerations for non-U.S. investors?":
    "Yes. Non-U.S. investors may face additional withholding, reporting, treaty, and filing considerations depending on how the investment is structured. Access Properties can identify the documentation required, but you should review the tax implications with your own advisor.",
  "What is the minimum investment?":
    "Minimums depend on the offering and investor type. Crowdfunding opportunities can start at $100, while accredited-direct opportunities typically start around $10,000.",
  "How are returns generated?":
    "Returns generally come from rental income, property appreciation, and value created through renovations or operational improvements. The exact mix depends on the fund strategy.",
  "How often are distributions paid?":
    "Distribution timing depends on the strategy and property performance. Some buy-and-hold assets may pay quarterly or annually once stabilized, while value-add or shorter-term strategies may distribute closer to refinancing or sale events.",
  "What fees does Access Properties charge?":
    "Fee structures vary by offering, but may include acquisition, asset management, property management, disposition, and performance fees. The exact fees are disclosed in the relevant offering documents.",
  "How is property valuation determined?":
    "Valuations typically begin with purchase price and comparable sales, then use income and market-based approaches over time. Formal appraisals are usually obtained around refinancing or sale events.",
  "What is the typical hold period?":
    "Hold periods vary by strategy. Buy-and-hold properties may be held for 5 to 10 years or longer, BRRR projects often run 3 to 5 years, and fix-and-flip opportunities can be much shorter.",
  "What risks should I be aware of?":
    "Key risks include market risk, liquidity risk, operational risk, financing risk, geographic concentration risk, and regulatory risk. You should review the full risk disclosures in the offering documents before investing.",
  "Full Disclosure":
    "This platform is for informational purposes only and does not itself constitute an offer to sell securities. Real estate investing involves meaningful risks, including market, liquidity, leverage, and regulatory risk. Past performance does not guarantee future results, and every prospective investor should review the full offering documents and consult independent legal, tax, and financial advisors before investing.",
};

const createMessageId = (prefix = "m") =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const openPortfolios = () => {
  window.open(PORTFOLIOS_URL, "_blank", "noopener,noreferrer");
};

const openNewsletterSignup = () => {
  window.open(NEWSLETTER_URL, "_blank", "noopener,noreferrer");
};

const getFaqAnswerMessage = (question) => {
  if (!question) {
    return (
      "I couldn't find that FAQ item.\n\n" +
      FAQ_FALLBACK_MESSAGE
    );
  }

  const answer = FAQ_ANSWER_COPY[question] || FAQ_FALLBACK_MESSAGE;

  return `Here is the answer for:\n"${question}"\n\n${answer}\n\nWhat would you like to do next?`;
};

const determineInvestorRoute = (answers) => {
  if (answers.planned_amount_bucket === "LT_10K") return "CROWDFUNDER";
  if (answers.sec_accredited === "NO") return "CROWDFUNDER";

  if (
    answers.sec_accredited === "NOT_SURE" &&
    answers.investor_preference === "CROWDFUNDING"
  ) {
    return "CROWDFUNDER";
  }

  if (
    answers.sec_accredited === "YES" &&
    (answers.planned_amount_bucket === "GTE_10K" ||
      answers.investor_preference === "ACCREDITED_DIRECT")
  ) {
    return "ACCREDITED";
  }

  return "CROWDFUNDER";
};

const getFallbackContributionAmount = (answers) => {
  const track = answers.investor_track || determineInvestorRoute(answers);
  return track === "ACCREDITED" ? 10000 : 100;
};

const mapPlannedAmountBucket = (value) => {
  if (value === "LT_10K") return "<10k";
  if (value === "GTE_10K") return ">=10k";
  return "unsure";
};

const buildSecAnswers = (answers) => ({
  accredited_status: answers.sec_accredited,
  investor_preference: answers.investor_preference,
  accredited_eligible: answers.sec_accredited === "YES",
});

const seedOnboardingFromAssistant = async (answers) => {
  await api.onboardingBasic({
    first_name: answers.first_name,
    last_name: answers.last_name,
    email: answers.email,
    phone: answers.phone,
  });

  await api.onboardingExperience({
    invested_before: Boolean(answers.has_invested_before),
    planned_amount: mapPlannedAmountBucket(answers.planned_amount_bucket),
  });

  await api.onboardingSec({
    answers: buildSecAnswers(answers),
  });

  await api.onboardingPathway({
    pathway:
      determineInvestorRoute(answers) === "ACCREDITED"
        ? "accredited"
        : "crowdfunding",
  });
};

const getStageMeta = (stepKey, answers) => {
  const track = determineInvestorRoute(answers);

  if (
    [
      "__ready",
      "__learn_more",
      "__faq_answer",
      "__learn_more_after_completion",
      "__faq_answer_after_completion",
      "__profile_intro",
      "first_name",
      "last_name",
      "email",
      "phone",
      "newsletter_opt_in",
      "__profile_started",
    ].includes(stepKey)
  ) {
    return {
      label: "Investor Profile",
      note: "First, let’s set up your investor profile so we can personalize your experience and save your progress.",
      next: "Confirm eligibility",
    };
  }

  if (
    [
      "__experience_yes",
      "__experience_no",
      "planned_amount_bucket",
      "sec_accredited",
      "investor_preference",
      "__fund_clarification",
      "__crowdfunding_intro",
      "__accredited_intro",
    ].includes(stepKey)
  ) {
    return {
      label: "Eligibility",
      note: "These questions help determine the appropriate investment pathway.",
      next:
        track === "ACCREDITED"
          ? "Accredited onboarding"
          : "Crowdfunding pathway",
    };
  }

  if (
    [
      "selected_fund",
      "password",
      "password_confirmation",
      "__create_account",
      "__handoff",
      "__done",
      "__restart",
    ].includes(stepKey)
  ) {
    return {
      label: "Account Setup",
      note: "The assistant stops at account setup. Documents, verification, review, and funding are completed in your onboarding dashboard.",
      next: "Onboarding dashboard",
    };
  }

  return {
    label: "Access Properties",
    note: "We’ll guide you through each step of the investment journey.",
    next: "Continue",
  };
};

const steps = [
  {
    key: "__ready",
    prompt:
      "Welcome to Access Properties — I’m your personal investing assistant.\n" +
      "I can help you:\n" +
      "· Understand how Access Properties works\n" +
      "· Choose the right fund portfolio\n" +
      "· Complete onboarding and verification\n\n" +
      "Before we start, here’s the overall investment journey so you know what to expect.\n" +
      "1. Create your investor profile\n" +
      "2. Confirm eligibility*1\n" +
      "3. Choose your fund portfolio\n" +
      "4. Verify accredited status\n" +
      "5. Receive funding instructions\n" +
      "6. Transfer funds*2\n" +
      "7. Access your Investor Dashboard\n\n" +
      "Ready to begin?",
    choices: [
      { label: "Yes, let’s start", value: "start", next: "__profile_intro" },
      {
        label: "I want to learn more first",
        value: "learn_more",
        next: "__learn_more",
      },
      {
        label: "See footnotes",
        value: "see_footnotes",
        stayOnStep: true,
        afterActionMessage: READY_FOOTNOTES_MESSAGE,
      },
    ],
    persistValue: false,
  },
  {
    key: "__learn_more",
    prompt:
      "Here are some common questions about Access Properties.\n\n" +
      "Select any question below and I’ll open the FAQ page for that answer.",
    faqMenu: true,
    persistValue: false,
  },
  {
    key: "__faq_answer",
    prompt: (answers) => getFaqAnswerMessage(answers.selected_faq_question),
    choices: [
      {
        label: "Open another FAQ question",
        value: "open_another",
        next: "__learn_more",
      },
      {
        label: "Continue onboarding",
        value: "continue",
        next: "__profile_intro",
      },
    ],
    persistValue: false,
  },
  {
    key: "__profile_intro",
    prompt:
      "First, let’s set up your investor profile so I can personalize your experience and save your progress.",
    autoAdvance: true,
    next: "first_name",
    persistValue: false,
  },
  {
    key: "first_name",
    prompt: "First name",
    validate: (value) =>
      value.trim().length > 0 || "First name is required.",
  },
  {
    key: "last_name",
    prompt: "Last name",
    validate: (value) => value.trim().length > 0 || "Last name is required.",
  },
  {
    key: "email",
    prompt: "Email",
    validate: (value) =>
      /\S+@\S+\.\S+/.test(value) || "Please enter a valid email.",
  },
  {
    key: "phone",
    prompt: "Mobile phone number",
    validate: (value) =>
      value.trim().length > 6 || "Please enter a valid phone number.",
  },
  {
    key: "newsletter_opt_in",
    prompt: "☐ Sign me up for the Access Properties newsletter",
    choices: [
      {
        label: "Yes, sign me up",
        value: true,
        next: "__profile_started",
        action: openNewsletterSignup,
        afterActionMessage:
          "I opened the Access Properties newsletter signup in a new tab. We’ll continue here.",
      },
      {
        label: "No, continue without newsletter",
        value: false,
        next: "__profile_started",
      },
    ],
  },
  {
    key: "__profile_started",
    prompt:
      "Have you invested in real estate, private investments, or investment funds before?",
    choices: [
      {
        label: "Yes, I have invested before",
        value: true,
        next: "__experience_yes",
        answerKey: "has_invested_before",
      },
      {
        label: "No, I am new to investing",
        value: false,
        next: "__experience_no",
        answerKey: "has_invested_before",
      },
    ],
    persistValue: false,
  },
  {
    key: "__experience_yes",
    prompt: "Great — I’ll keep things efficient.",
    autoAdvance: true,
    next: "planned_amount_bucket",
    persistValue: false,
  },
  {
    key: "__experience_no",
    prompt: "No problem — I’ll explain terms as we go.",
    autoAdvance: true,
    next: "planned_amount_bucket",
    persistValue: false,
  },
  {
    key: "planned_amount_bucket",
    prompt: "How much are you planning to invest right now?",
    choices: [
      { label: "Less than $10,000", value: "LT_10K", next: "sec_accredited" },
      { label: "$10,000 or more", value: "GTE_10K", next: "sec_accredited" },
      { label: "Not sure yet", value: "NOT_SURE", next: "sec_accredited" },
    ],
  },
  {
    key: "sec_accredited",
    prompt:
      "To follow SEC rules, I need to ask: do you meet at least ONE of the SEC Accredited Investor requirements?\n" +
      "· Annual income over $200,000 (or $300,000 with spouse), OR\n" +
      "· Net worth over $1 million (excluding primary home)",
    choices: [
      { label: "Yes", value: "YES", next: "investor_preference" },
      { label: "No", value: "NO", next: "investor_preference" },
      { label: "Not sure", value: "NOT_SURE", next: "investor_preference" },
    ],
  },
  {
    key: "investor_preference",
    prompt: "Which option best describes what you want?",
    choices: [
      {
        label:
          "I want to invest smaller amounts with other investors (crowdfunding)",
        value: "CROWDFUNDING",
        next: "__fund_clarification",
      },
      {
        label: "I want to invest directly as an accredited investor",
        value: "ACCREDITED_DIRECT",
        next: "__fund_clarification",
      },
    ],
  },
  {
    key: "__fund_clarification",
    prompt:
      "Quick clarification before we continue: Access Properties does not offer property-specific deals. Instead, you invest into a real estate investment fund. Your investment is:\n" +
      "· pooled with other investors\n" +
      "· allocated according to the fund strategy\n" +
      "· represented as a percentage ownership interest in the fund based on your investment amount\n\n" +
      `Current offering:\n${FUND_NAME}\n\n` +
      "You can learn more about how Access Properties works:\n" +
      "· on the Home page under Access Advantage, and\n" +
      "· on the About page under How We’re Changing Real Estate Investment\n\n" +
      "And once you sign in, your Investor Dashboard provides detailed materials for the fund, including among others:\n" +
      "· Fund Presentation\n" +
      "· Operating Agreement\n" +
      "· Member Interest Purchase Agreement",
    choices: [
      {
        label: "Continue",
        value: "continue",
        next: (answers) =>
          determineInvestorRoute(answers) === "ACCREDITED"
            ? "__accredited_intro"
            : "__crowdfunding_intro",
      },
      {
        label: "View Portfolios",
        value: "view_portfolios",
        stayOnStep: true,
        action: openPortfolios,
        afterActionMessage:
          "I opened the Portfolios page in a new tab. When you’re ready, continue here.",
      },
    ],
    persistValue: false,
  },
  {
    key: "__crowdfunding_intro",
    prompt:
      "Based on your answers, the best fit is our crowdfunding pathway.\n" +
      "This pathway is designed for:\n" +
      "· Non-accredited Investors, or\n" +
      "· Investors starting with smaller amounts",
    choices: [
      {
        label: "Continue to Crowdfunding",
        value: "continue_crowdfunding",
        next: "selected_fund",
      },
      {
        label: "Review Portfolios First",
        value: "review_portfolios",
        stayOnStep: true,
        action: openPortfolios,
        afterActionMessage:
          "I opened the Portfolios page in a new tab. When you’re ready, select Continue to Crowdfunding here.",
      },
    ],
    persistValue: false,
  },
  {
    key: "__accredited_intro",
    prompt:
      "Great — based on your answers, you may qualify as an Accredited Investor, which means you can invest directly into:\n" +
      `${FUND_NAME}\n\n` +
      "We’ll handle profile completion, identity documents, accreditation verification, review, and funding in your onboarding dashboard after account creation.",
    choices: [
      {
        label: "Continue with Accredited Onboarding",
        value: "continue_accredited",
        next: "selected_fund",
      },
      {
        label: "Review Portfolios First",
        value: "review_portfolios",
        stayOnStep: true,
        action: openPortfolios,
        afterActionMessage:
          "I opened the Portfolios page in a new tab. When you’re ready, continue with accredited onboarding here.",
      },
    ],
    persistValue: false,
  },
  {
    key: "selected_fund",
    prompt:
      "Choose the fund you want to continue with. You can review all options on the Portfolios page.\n" +
      `Current offering: ${FUND_NAME}`,
    choices: [
      {
        label: "View Portfolios",
        value: "view_portfolios",
        stayOnStep: true,
        action: openPortfolios,
        afterActionMessage:
          "I opened the Portfolios page in a new tab. When you’re ready, come back here and select the fund.",
      },
      {
        label: "Select Access Properties Real Estate Diversified Income Fund I",
        value: FUND_NAME,
        next: "password",
      },
    ],
  },
  {
    key: "password",
    prompt: "Create a password for your investor account.",
    validate: (value) =>
      value.length >= 8 || "Password must be at least 8 characters.",
  },
  {
    key: "password_confirmation",
    prompt: "Confirm your password.",
    validate: (value, answers) =>
      value === answers.password || "Passwords do not match.",
  },
  {
    key: "__create_account",
    prompt:
      "Create your account now. The remaining operational steps happen in your onboarding dashboard after sign-in.",
    choices: [
      {
        label: "Create account and continue",
        value: "create_account",
        next: "__handoff",
      },
    ],
    persistValue: false,
    onBeforeNext: async (ctx) => {
      const payload = {
        first_name: ctx.answers.first_name,
        last_name: ctx.answers.last_name,
        email: ctx.answers.email,
        phone: ctx.answers.phone,
        newsletter_opt_in: ctx.answers.newsletter_opt_in,
        has_invested_before: ctx.answers.has_invested_before,
        planned_amount_bucket: ctx.answers.planned_amount_bucket,
        sec_accredited: ctx.answers.sec_accredited,
        investor_preference: ctx.answers.investor_preference,
        investor_track:
          ctx.answers.investor_track || determineInvestorRoute(ctx.answers),
        selected_fund: ctx.answers.selected_fund || FUND_NAME,
        full_name: [ctx.answers.first_name, ctx.answers.last_name]
          .filter(Boolean)
          .join(" "),
        capital_contribution_amount: getFallbackContributionAmount(ctx.answers),
        password: ctx.answers.password,
        password_confirmation: ctx.answers.password_confirmation,
      };

      await api.register(payload);
      await seedOnboardingFromAssistant(ctx.answers);
    },
  },
  {
    key: "__handoff",
    prompt: (answers) =>
      `Your account is ready, ${answers.first_name || "there"}.\n\n` +
      "Next, continue in your onboarding dashboard to complete:\n" +
      "· full profile details\n" +
      "· identity document upload\n" +
      (determineInvestorRoute(answers) === "ACCREDITED"
        ? "· accredited investor verification\n"
        : "") +
      "· review status tracking\n" +
      "· funding instructions when they become available\n\n" +
      "What would you like to do next?",
    choices: [
      {
        label: "Continue to dashboard",
        value: "continue_dashboard",
        next: "__done",
      },
      {
        label: "View FAQ",
        value: "view_faq",
        next: "__learn_more_after_completion",
      },
      {
        label: "Start new registration",
        value: "start_new_registration",
        next: "__restart",
      },
    ],
    persistValue: false,
  },
  {
    key: "__learn_more_after_completion",
    prompt:
      "Here are the FAQ questions. Select any question below and I’ll open the FAQ page for that answer.",
    faqMenu: true,
    persistValue: false,
  },
  {
    key: "__faq_answer_after_completion",
    prompt: (answers) => getFaqAnswerMessage(answers.selected_faq_question),
    choices: [
      {
        label: "Open another FAQ question",
        value: "open_another",
        next: "__learn_more_after_completion",
      },
      {
        label: "Continue to dashboard",
        value: "continue_dashboard",
        next: "__done",
      },
      {
        label: "Start new registration",
        value: "start_new_registration",
        next: "__restart",
      },
    ],
    persistValue: false,
  },
  {
    key: "__restart",
    prompt: "Starting a new registration.",
    persistValue: false,
  },
  {
    key: "__done",
    prompt: "Taking you to the onboarding dashboard.",
    complete: true,
    persistValue: false,
  },
];

const stepMap = Object.fromEntries(steps.map((step) => [step.key, step]));

const sanitizeStepKey = (value) => (value && stepMap[value] ? value : "__ready");

const sanitizeHistory = (value) =>
  Array.isArray(value) ? value.filter((key) => Boolean(stepMap[key])) : [];

const AssistantRegister = () => {
  const navigate = useNavigate();

  const [currentStepKey, setCurrentStepKey] = useState("__ready");
  const [messages, setMessages] = useState([]);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [history, setHistory] = useState([]);

  const typingQueue = useRef(Promise.resolve());
  const initRef = useRef(false);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);

  const step = stepMap[currentStepKey];

  const getStepPrompt = (stepDef, nextAnswers = answers) =>
    typeof stepDef?.prompt === "function"
      ? stepDef.prompt(nextAnswers)
      : stepDef?.prompt || "";

  const typeAssistant = (payload) => {
    const message =
      typeof payload === "string"
        ? { text: payload, links: [], messageKey: null }
        : {
            text: String(payload?.text || ""),
            links: Array.isArray(payload?.links) ? payload.links : [],
            messageKey: payload?.messageKey || null,
          };

    if (!message.text) return Promise.resolve();

    setIsTyping(true);
    const id = createMessageId("a");
    setMessages((prev) => [
      ...prev,
      {
        id,
        role: "assistant",
        text: "",
        links: message.links,
        messageKey: message.messageKey,
      },
    ]);

    return new Promise((resolve) => {
      const chars = message.text.split("");
      let index = 0;

      const tick = () => {
        const nextChar = chars[index] ?? "";
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id ? { ...msg, text: `${msg.text}${nextChar}` } : msg
          )
        );

        index += 1;

        if (index < chars.length) {
          setTimeout(tick, 12);
        } else {
          setIsTyping(false);
          resolve();
        }
      };

      setTimeout(tick, 12);
    });
  };

  const enqueueAssistant = (text) => {
    typingQueue.current = typingQueue.current.then(() => typeAssistant(text));
    return typingQueue.current;
  };

  const emitUser = (text) => {
    setMessages((prev) => [
      ...prev,
      { id: createMessageId("u"), role: "user", text: String(text) },
    ]);
  };

  const normalizeAnswers = (nextAnswers) => ({
    ...nextAnswers,
    investor_track: determineInvestorRoute(nextAnswers),
  });

  const getNextStepKey = (current, nextAnswers, choice = null) => {
    const resolveNext = (value) => {
      if (typeof value === "function") return value(nextAnswers);
      return value;
    };

    if (choice?.next) return resolveNext(choice.next);

    if (current.key === "password_confirmation") {
      return "__create_account";
    }

    if (current.next) return resolveNext(current.next);

    const currentIndex = steps.findIndex((s) => s.key === current.key);
    return steps[currentIndex + 1]?.key ?? null;
  };

  const persistAnswer = (stepDef, rawValue, choice = null) => {
    const answerKey = choice?.answerKey || stepDef.key;
    const shouldPersist =
      stepDef.persistValue !== false &&
      (!stepDef.key.startsWith("__") || Boolean(choice?.answerKey));

    const nextAnswers = { ...answers };

    if (shouldPersist) {
      nextAnswers[answerKey] = rawValue;
    }

    if (stepDef.faqMenu && choice?.label) {
      nextAnswers.selected_faq_question = choice.label;
    }

    return normalizeAnswers(nextAnswers);
  };

  const clearAssistantState = () => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setAnswers({});
    setMessages([]);
    setHistory([]);
    setInput("");
    setError("");
    setSaveMessage("");
  };

  const resetAssistant = async (startStep = "__ready") => {
    clearAssistantState();
    setCurrentStepKey(startStep);

    const targetStep = stepMap[startStep];
    const prompt = getStepPrompt(targetStep, {});

    await enqueueAssistant(prompt);

    if (targetStep.autoAdvance) {
      const autoNext =
        typeof targetStep.next === "function" ? targetStep.next({}) : targetStep.next;

      if (autoNext) {
        setCurrentStepKey(autoNext);
        const nextStep = stepMap[autoNext];
        const nextPrompt = getStepPrompt(nextStep, {});
        await enqueueAssistant(nextPrompt);
      }
    }
  };

  const advanceTo = async (targetKey, nextAnswers = answers, options = {}) => {
    const { pushHistory = true } = options;

    if (!targetKey) return;

    if (
      pushHistory &&
      currentStepKey !== targetKey &&
      stepMap[currentStepKey] &&
      !stepMap[currentStepKey].autoAdvance
    ) {
      setHistory((prev) => [...prev, currentStepKey]);
    }

    setCurrentStepKey(targetKey);
    setInput("");
    setError("");

    const targetStep = stepMap[targetKey];
    const prompt = getStepPrompt(targetStep, nextAnswers);

    await enqueueAssistant(prompt);

    if (targetKey === "__restart") {
      await resetAssistant("__ready");
      return;
    }

    if (targetStep.complete) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      setTimeout(() => navigate("/dashboard"), 600);
      return;
    }

    if (targetStep.autoAdvance) {
      const autoNext = getNextStepKey(targetStep, nextAnswers);
      if (autoNext) {
        await advanceTo(autoNext, nextAnswers, { pushHistory: false });
      }
    }
  };

  const handleTextSubmit = async () => {
    if (!step) return;

    const value = input.trim();
    const finalValue =
      value === "" && step.optional ? step.defaultValue ?? "" : value;
    const validation = step.validate ? step.validate(finalValue, answers) : true;

    if (validation !== true) {
      setError(validation);
      await enqueueAssistant(
        `${validation}\n\nLet's try that again.\n\n${getStepPrompt(step, answers)}`
      );
      return;
    }

    setError("");
    emitUser(finalValue || "—");

    const nextAnswers = persistAnswer(step, finalValue);
    setAnswers(nextAnswers);

    if (step.onBeforeNext) {
      try {
        await step.onBeforeNext({ answers: nextAnswers });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to continue. Please review your details and try again."
        );
        return;
      }
    }

    await advanceTo(getNextStepKey(step, nextAnswers), nextAnswers);
  };

  const handleChoice = async (choice) => {
    if (!step) return;

    setError("");
    emitUser(choice.label);

    if (choice.action) {
      choice.action();
    }

    if (step.faqMenu) {
      const nextAnswers = normalizeAnswers({
        ...answers,
        selected_faq_question: choice.label,
      });

      setAnswers(nextAnswers);

      const returnStep =
        currentStepKey === "__learn_more_after_completion"
          ? "__faq_answer_after_completion"
          : "__faq_answer";

      await advanceTo(returnStep, nextAnswers);
      return;
    }

    if (choice.stayOnStep) {
      if (choice.afterActionMessage) {
        const messageKey =
          typeof choice.afterActionMessage === "object"
            ? choice.afterActionMessage.messageKey
            : null;

        if (messageKey && messages.some((item) => item.messageKey === messageKey)) {
          return;
        }

        await enqueueAssistant(choice.afterActionMessage);
      }
      return;
    }

    const nextAnswers = persistAnswer(step, choice.value, choice);
    setAnswers(nextAnswers);

    if (step.onBeforeNext) {
      try {
        await step.onBeforeNext({ answers: nextAnswers });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Unable to continue. Please review your details and try again."
        );
        return;
      }
    }

    if (choice.afterActionMessage) {
      await enqueueAssistant(choice.afterActionMessage);
    }

    await advanceTo(getNextStepKey(step, nextAnswers, choice), nextAnswers);
  };

  const goBack = async () => {
    if (!history.length) return;

    const previous = [...history];
    let previousKey = previous.pop();

    while (previousKey && !stepMap[previousKey]) {
      previousKey = previous.pop();
    }

    if (!previousKey) {
      setHistory([]);
      setError("");
      return;
    }

    setHistory(previous);
    setCurrentStepKey(previousKey);
    setError("");
    setInput(answers[previousKey] ?? "");

    const previousStep = stepMap[previousKey];
    const prompt = getStepPrompt(previousStep, answers);

    await enqueueAssistant(`Let’s go back.\n\n${prompt}`);
  };

  const handleSaveSession = () => {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        currentStepKey,
        messages,
        answers,
        input,
        history,
      })
    );
    setSaveMessage("Progress saved on this device.");
  };

  const stageMeta = useMemo(
    () => getStageMeta(currentStepKey, answers),
    [currentStepKey, answers]
  );

  const progressKeys = useMemo(
    () => [
      "first_name",
      "last_name",
      "email",
      "phone",
      "newsletter_opt_in",
      "has_invested_before",
      "planned_amount_bucket",
      "sec_accredited",
      "investor_preference",
      "selected_fund",
      "password",
      "password_confirmation",
    ],
    []
  );

  const progressIndex = useMemo(() => {
    const idx = progressKeys.indexOf(currentStepKey);
    if (idx >= 0) return idx + 1;
    return Math.min(progressKeys.length, history.length + 1);
  }, [currentStepKey, progressKeys, history.length]);

  const progressPercent = useMemo(
    () =>
      Math.max(
        8,
        Math.min(
          100,
          Math.round((progressIndex / Math.max(progressKeys.length, 1)) * 100)
        )
      ),
    [progressIndex, progressKeys.length]
  );

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const saved = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentStepKey(sanitizeStepKey(parsed.currentStepKey));
        setMessages(Array.isArray(parsed.messages) ? parsed.messages : []);
        setAnswers(parsed.answers || {});
        setInput(parsed.input || "");
        setHistory(sanitizeHistory(parsed.history));
        setSaveMessage("Progress restored on this device.");
        return;
      } catch {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }

    advanceTo("__ready", {}, { pushHistory: false });
  }, []);

  useEffect(() => {
    if (!initRef.current) return;

    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        currentStepKey,
        messages,
        answers,
        input,
        history,
      })
    );
  }, [currentStepKey, messages, answers, input, history]);

  useEffect(() => {
    if (!saveMessage) return;
    const timeout = setTimeout(() => setSaveMessage(""), 2200);
    return () => clearTimeout(timeout);
  }, [saveMessage]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, currentStepKey]);

  useEffect(() => {
    if (!step || step.faqMenu || step.choices || isTyping) return;

    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => clearTimeout(timeout);
  }, [currentStepKey, isTyping, step]);

  return (
    <Shell hideHeader fullScreen>
      <div className="relative flex h-full w-full overflow-hidden bg-white p-0">
        <div className="relative z-10 flex h-full min-h-0 w-full">
          <div className="relative flex min-h-0 h-full w-full flex-col overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_20px_60px_rgba(24,24,27,0.08)]">
            <div className="border-b border-stone-200 bg-white px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                    Access Properties
                  </p>
                  <h2 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.02em] text-stone-900">
                    {stageMeta.label}
                  </h2>
                </div>

                <div className="hidden items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-sm font-medium text-stone-700 sm:inline-flex">
                  Step {progressIndex} of {progressKeys.length}
                </div>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-black transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-40 sm:p-6">
              <div className="mx-auto w-full max-w-[1180px] space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] whitespace-pre-line rounded-[22px] px-4 py-3 text-base leading-7 ${
                        message.role === "user"
                          ? "bg-black text-white"
                          : "border border-stone-200 bg-stone-50 text-stone-800"
                      }`}
                    >
                      {message.text}

                      {message.role === "assistant" &&
                      Array.isArray(message.links) &&
                      message.links.length ? (
                        <div className="mt-3 flex flex-col gap-2 whitespace-normal">
                          {message.links.map((link) => (
                            <a
                              key={`${message.id}-${link.href}`}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-fit text-base font-medium text-black underline underline-offset-4"
                            >
                              {link.label || link.href}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-stone-200 bg-white p-4 sm:p-6">
              <div className="mx-auto w-full max-w-[1180px]">
                {error ? (
                  <div className="mb-3 text-base text-red-600">{error}</div>
                ) : null}

                {saveMessage ? (
                  <div className="mb-3 text-base text-stone-600">{saveMessage}</div>
                ) : null}

                {step?.faqMenu ? (
                  <div className="max-h-[420px] overflow-y-auto pr-2">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {FAQ_ITEMS.map((item) => (
                        <button
                          key={item}
                          className="group flex min-h-[84px] flex-col items-start justify-center rounded-[22px] border border-stone-200 bg-white px-5 py-4 text-left shadow-sm transition duration-200 hover:border-black hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => handleChoice({ label: item })}
                          disabled={isTyping}
                        >
                          <span className="text-base font-semibold text-stone-900">
                            {item}
                          </span>
                          <span className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-stone-500 opacity-0 transition group-hover:opacity-100">
                            Open
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : step?.choices ? (
                  <div
                    className={`grid gap-3 ${
                      step.key === "__ready" ? "sm:grid-cols-3" : "sm:grid-cols-2"
                    }`}
                  >
                    {step.choices.map((choice) => (
                      <button
                        key={`${step.key}-${choice.label}`}
                        className="group flex min-h-[96px] flex-col items-start justify-center rounded-[22px] border border-stone-200 bg-white px-5 py-4 text-left shadow-sm transition duration-200 hover:border-black hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => handleChoice(choice)}
                        disabled={isTyping}
                      >
                        <span className="text-base font-semibold text-stone-900">
                          {choice.label}
                        </span>
                        <span className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-stone-500 opacity-0 transition group-hover:opacity-100">
                          Continue
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`flex flex-col gap-3 sm:flex-row sm:items-center ${
                      isTyping ? "opacity-70" : ""
                    }`}
                  >
                    <input
                      ref={inputRef}
                      className="flex-1 rounded-full border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 transition placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-4 focus:ring-stone-200 disabled:bg-stone-100"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your answer..."
                      disabled={isTyping}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleTextSubmit();
                      }}
                    />
                    <button
                      className="rounded-full bg-black px-5 py-3 text-base font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={handleTextSubmit}
                      disabled={isTyping}
                    >
                      {isTyping ? "Assistant typing..." : "Send"}
                    </button>
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-base font-medium text-stone-700 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={goBack}
                      disabled={!history.length}
                    >
                      Back
                    </button>

                    <button
                      className="rounded-full border border-stone-300 bg-stone-50 px-4 py-2.5 text-base font-medium text-stone-600 transition hover:border-black hover:text-black"
                      onClick={handleSaveSession}
                      type="button"
                    >
                      Save for later
                    </button>
                  </div>

                  <div className="text-base font-medium text-stone-500">
                    {stageMeta.next}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default AssistantRegister;
