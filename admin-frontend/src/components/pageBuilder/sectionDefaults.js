export const SECTION_TYPES = [
  { type: "HERO", label: "Hero" },
  { type: "RICH_TEXT", label: "Rich Text" },
  { type: "IMAGE_BANNER", label: "Image Banner" },
  { type: "STATS", label: "Stats" },
  { type: "CTA", label: "Call To Action" },
  { type: "TEAM_GRID", label: "Team Grid" },
  { type: "FAQ_ACCORDION", label: "FAQ Accordion" },
  { type: "PROPERTY_GRID", label: "Property Grid" },
  { type: "GALLERY", label: "Gallery" },
  { type: "DIVIDER", label: "Divider" },
  { type: "SPACER", label: "Spacer" },
  { type: "DISCLOSURE", label: "Disclosure" },
  { type: "ICON_ACCORDION_GRID", label: "Icon Accordion Grid" },
  { type: "ICON_CARD_GRID", label: "Icon Card Grid" },
  { type: "TESTIMONIALS", label: "Testimonials" },
  { type: "SOCIALS", label: "Social Links" },
  { type: "PORTFOLIO_CARD", label: "Portfolio Cards" },
  { type: "GREATER_BOSTON_REASONS", label: "Greater Boston Reasons" },
  { type: "PROPERTY_COLUMNS", label: "Property Columns" },
  { type: "PROFILE_CARDS", label: "Profile Cards" },
  { type: "ADVISORY", label: "Advisory" },
  { type: "CONTACT_FORM", label: "Contact Form" },
  { type: "FAQ_PAGE", label: "FAQ Page" },
];

export const createSection = (type) => {
  const base = { type, data: {} };
  switch (type) {
    case "HERO":
      return {
        ...base,
        data: {
          title: "Headline for this page",
          subtitle: "Support the headline with a clear value statement.",
          backgroundImage: "",
          overlayOpacity: 0.35,
          primaryButton: { label: "Get Started", href: "/invest-now" },
          secondaryButton: { label: "Learn More", href: "/about" },
        },
      };
    case "RICH_TEXT":
      return {
        ...base,
        data: {
          heading: "Section heading",
          bodyHtml: "<p>Write rich text here.</p>",
        },
      };
    case "IMAGE_BANNER":
      return {
        ...base,
        data: {
          image: "",
          caption: "Image caption",
          alignment: "center",
        },
      };
    case "STATS":
      return {
        ...base,
        data: {
          heading: "Stats that build trust",
          items: [
            { label: "Years of Experience", value: "20+" },
            { label: "Projects Completed", value: "140+" },
            { label: "Units Delivered", value: "950+" },
          ],
        },
      };
    case "CTA":
      return {
        ...base,
        data: {
          headline: "Ready to invest?",
          subtext: "Start with as little as $100 or qualify as accredited.",
          buttons: [
            { label: "Invest Now", href: "/invest-now" },
            { label: "Contact", href: "/contact" },
          ],
        },
      };
    case "TEAM_GRID":
      return {
        ...base,
        data: {
          heading: "Leadership Team",
          members: [
            { name: "Name", role: "Role", bio: "Short bio", photo: "" },
          ],
        },
      };
    case "FAQ_ACCORDION":
      return {
        ...base,
        data: {
          heading: "Frequently Asked Questions",
          items: [
            { question: "Question", answer: "Answer text." },
          ],
        },
      };
    case "PROPERTY_GRID":
      return {
        ...base,
        data: {
          heading: "Featured Properties",
          subtext: "Latest investments and active listings.",
          showFeaturedOnly: true,
        },
      };
    case "GALLERY":
      return {
        ...base,
        data: {
          heading: "Gallery",
          category: "before",
          images: [
            { url: "", caption: "Caption", alt: "Alt text", order: 1 },
          ],
        },
      };
    case "DIVIDER":
    case "SPACER":
      return {
        ...base,
        data: {
          size: 48,
        },
      };
    case "DISCLOSURE":
      return {
        ...base,
        data: {
          title: "Disclosure",
          body: "<p>Disclosure details can be edited in the CMS.</p>",
          variant: "default",
        },
      };
    case "ICON_ACCORDION_GRID":
      return {
        ...base,
        data: {
          heading: "How we operate",
          subheading: "A transparent view of the process.",
          items: [
            { title: "Acquire", body: "We source compelling assets.", iconName: "home" },
          ],
        },
      };
    case "ICON_CARD_GRID":
      return {
        ...base,
        data: {
          heading: "Investor Advantages",
          items: [
            { title: "Stable returns", body: "Focus on resilient assets.", iconName: "shield" },
          ],
        },
      };
    case "TESTIMONIALS":
      return {
        ...base,
        data: {
          heading: "Investor Stories",
          items: [
            { quote: "Great experience.", name: "Investor Name", role: "Investor" },
          ],
        },
      };
    case "SOCIALS":
      return {
        ...base,
        data: {
          heading: "Follow us",
          links: [
            { label: "LinkedIn", href: "https://linkedin.com" },
          ],
        },
      };
    case "PORTFOLIO_CARD":
      return {
        ...base,
        data: {
          heading: "Portfolios",
          cards: [
            { title: "Greater Boston", subtitle: "Featured investments", image: "" },
          ],
        },
      };
    case "GREATER_BOSTON_REASONS":
      return {
        ...base,
        data: {
          heading: "Why Greater Boston",
          items: [
            { title: "Strong Demand", body: "High occupancy markets." },
          ],
        },
      };
    case "PROPERTY_COLUMNS":
      return {
        ...base,
        data: {
          heading: "Active Properties",
          items: [
            { title: "340 Main Street", address: "Boston, MA", status: "Active", image: "" },
          ],
        },
      };
    case "PROFILE_CARDS":
      return {
        ...base,
        data: {
          heading: "Leadership Profiles",
          cards: [
            { name: "Name", role: "Role", bio: "Short bio", image: "" },
          ],
        },
      };
    case "ADVISORY":
      return {
        ...base,
        data: {
          heading: "Advisory Board",
          items: [
            { name: "Advisor Name", role: "Advisor Role", bio: "Short bio" },
          ],
        },
      };
    case "CONTACT_FORM":
      return {
        ...base,
        data: {
          heading: "Contact Us",
          subtext: "Tell us about your investment goals.",
        },
      };
    case "FAQ_PAGE":
      return {
        ...base,
        data: {
          heading: "Frequently Asked Questions",
          image: "",
          items: [
            { question: "Question", answer: "Answer text." },
          ],
        },
      };
    default:
      return base;
  }
};
