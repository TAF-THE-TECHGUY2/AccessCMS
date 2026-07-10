export const SECTION_TYPES = [
  { type: "HERO", label: "Hero", description: "Big headline with background image and buttons — usually the first block." },
  { type: "SIMPLE_CONTENT", label: "Title + Content", description: "A heading followed by one or more paragraphs of text." },
  { type: "TITLE_IMAGE", label: "Title + Image", description: "A heading paired with a single large image." },
  { type: "RICH_TEXT", label: "Rich Text", description: "Free-form formatted text (bold, lists, links)." },
  { type: "IMAGE_BANNER", label: "Image Banner", description: "Full-width image strip, optionally with a caption." },
  { type: "STATS", label: "Stats", description: "A row of key numbers (e.g. properties, investors, returns)." },
  { type: "CTA", label: "Call To Action", description: "Short pitch with a button to drive clicks." },
  { type: "TEAM_GRID", label: "Team Grid", description: "Grid of team members pulled from the Team list." },
  { type: "FAQ_ACCORDION", label: "FAQ Accordion", description: "Expandable question/answer list." },
  { type: "PROPERTY_GRID", label: "Property Grid", description: "Cards for properties pulled from the Properties list." },
  { type: "GALLERY", label: "Gallery", description: "A grid of images." },
  { type: "DIVIDER", label: "Divider", description: "A thin horizontal line between sections." },
  { type: "SPACER", label: "Spacer", description: "Empty vertical space to breathe." },
  { type: "DISCLOSURE", label: "Disclosure", description: "Small-print legal or regulatory text." },
  { type: "ICON_ACCORDION_GRID", label: "Icon Accordion Grid", description: "Grid of expandable items, each with an icon." },
  { type: "ICON_CARD_GRID", label: "Icon Card Grid", description: "Grid of cards with icon, title and text." },
  { type: "TESTIMONIALS", label: "Testimonials", description: "Quotes from clients or investors." },
  { type: "SOCIALS", label: "Social Links", description: "Row of social media links." },
  { type: "PORTFOLIO_CARD", label: "Portfolio Cards", description: "Card linking to a portfolio/fund with image and stats." },
  { type: "GREATER_BOSTON_REASONS", label: "Greater Boston Reasons", description: "Reasons-to-invest list for the Greater Boston page." },
  { type: "PROPERTY_COLUMNS", label: "Property Columns", description: "Columns of grouped property links." },
  { type: "PROFILE_CARDS", label: "Profile Cards", description: "Founder/leader profiles with photo and audio interview." },
  { type: "ADVISORY", label: "Advisory", description: "Advisory board members block." },
  { type: "CONTACT_FORM", label: "Contact Form", description: "Form that sends visitor messages to you." },
  { type: "FAQ_PAGE", label: "FAQ Page", description: "Full FAQ page layout with categories, pulled from the FAQ list." },
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
          primaryButton: { label: "Invest Now", href: "/invest-now" },
          secondaryButton: { label: "How It Works", href: "" },
        },
      };
    case "SIMPLE_CONTENT":
      return {
        ...base,
        data: {
          title: "Section title",
          subtitle: "",
          bodyHtml: "<p>Write your content here.</p>",
        },
      };
    case "TITLE_IMAGE":
      return {
        ...base,
        data: {
          title: "Section title",
          image: "",
          imageAlt: "",
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
          showIcons: true,
          contentAlign: "left",
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
          showIcons: true,
          contentAlign: "left",
          items: [
            { title: "Stable returns", body: "Focus on resilient assets.", iconName: "shield" },
          ],
        },
      };
    case "TESTIMONIALS":
      return {
        ...base,
        data: {
          title: "Testimonials",
          subtitle: "What our early supporters and investors are saying.",
          disclosure:
            "Testimonials are provided by current investors. Investors were not compensated for these statements. These testimonials may not be representative of the experience of all investors and are not a guarantee of future performance or success. Some investors may have personal or prior business relationships with the sponsor.",
          items: [
            { quote: "Great experience.", attribution: "Investor Name", label: "Investor Testimonial" },
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
          title: "Properties",
          subtitle: "Explore the current properties in the portfolio.",
          autoScroll: false,
          items: [
            { id: "property-column-1", label: "Featured Property", properties: [] },
          ],
        },
      };
    case "PROFILE_CARDS":
      return {
        ...base,
        data: {
          heading: "Leadership Profiles",
          cards: [
            {
              name: "Name",
              roleLine: "Role",
              imageSrc: "",
              embeddedAudioSrc: "",
              interviewEyebrow: "Founder Interview",
              interviewTitle: "Hear the Founder's Story",
              interviewSubtitle: "",
              interviewSelectLabel: "Choose A Segment",
              paragraphs: ["Short bio"],
              interviewSnippets: [],
            },
          ],
        },
      };
    case "FOUNDER_INTERVIEW_DROPDOWN":
      return {
        ...base,
        data: {
          title: "Hear the Founder's Story",
          subtitle: "Choose an interview segment to play a focused excerpt.",
          introText:
            "Select a topic below to jump into a specific part of the founder interview.",
          audioSrc: "/audio/founder-story.mp3",
          snippets: [
            {
              label: "Why Access Properties Started",
              description: "A short introduction to the mission and early vision behind the platform.",
              audioSrc: "",
              startTime: 0,
              endTime: 45,
              buttonLabel: "Play opening clip",
            },
            {
              label: "How The Model Works",
              description: "A focused explanation of how the company approaches property investing.",
              audioSrc: "",
              startTime: 46,
              endTime: 110,
              buttonLabel: "Play strategy clip",
            },
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
