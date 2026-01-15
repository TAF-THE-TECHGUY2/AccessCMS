import bcrypt from "bcryptjs";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";
import { Page } from "../models/Page.js";
import { Property } from "../models/Property.js";
import { TeamMember } from "../models/TeamMember.js";
import { FAQ } from "../models/FAQ.js";
import { SiteSettings } from "../models/SiteSettings.js";

const seedAdmin = async () => {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@ap.boston";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const existing = await User.findOne({ email });
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(password, 10);
  return User.create({
    email,
    name: "Access Admin",
    role: "admin",
    passwordHash,
  });
};

const seedPages = async () => {
  await Page.deleteMany({});
  const pages = [
    {
      slug: "home",
      title: "Home",
      status: "published",
      publishedAt: new Date(),
      seo: {
        metaTitle: "Access Properties | Home",
        metaDescription: "Access Properties real estate investment platform.",
      },
      sections: [
        {
          type: "HERO",
          data: {
            title: "Simple Real Estate Investing",
            subtitle: "for Anyone, Anywhere",
            badgeText: "Starting at just $100",
            primaryButton: { label: "HOW IT WORKS" },
            secondaryButton: { label: "INVEST NOW", href: "/contact" },
          },
        },
        {
          type: "ICON_ACCORDION_GRID",
          data: {
            title: "Welcome to Access Properties",
            subtitle: "Learn how Access Properties Started and what drives us.",
            items: [
              {
                id: "story",
                iconName: "Lightbulb",
                title: "Our Story",
                content:
                  "Our story began with a simple belief: real estate investment should be accessible to everyone. This drives our mission to democratize property investing through innovation, transparency, and inclusion. With minimum investments starting at just $100, our digital platform empowers individuals to participate in markets once reserved for institutions and the wealthy.",
              },
              {
                id: "mission",
                iconName: "Shield",
                title: "Our Mission",
                content:
                  "Real estate continues to create immense wealth yet the vast majority remain locked out. Faced with that inequity, we turned our passion into an opportunity. Founded in November 2022, Access Properties is a mission-driven real estate syndication and investment technology startup committed to creating value through strategic property investments.",
              },
            ],
          },
        },
        {
          type: "ICON_CARD_GRID",
          data: {
            title: "How We Operate",
            subtitle:
              "We prioritize compliance, transparency, and secure operations so investors can participate with confidence.",
            background: "gray",
            items: [
              { iconName: "BadgeCheck", title: "State-Registered & Regulated" },
              { iconName: "Scale", title: "Investor & Legal Framework" },
              { iconName: "Shield", title: "Transaction & Data Protection" },
              { iconName: "LayoutDashboard", title: "Your Dashboard & Reports" },
            ],
          },
        },
        {
          type: "ICON_ACCORDION_GRID",
          data: {
            title: "Why Invest in Real Estate",
            subtitle: "A Proven Path to Income, Stability, and Long-Term Growth.",
            ctaLabel: "Portfolios",
            ctaHref: "/portfolios",
            items: [
              {
                id: "diversification",
                iconName: "Puzzle",
                title: "Diversification",
                content:
                  "Real estate historically strengthens portfolios by balancing exposure between stocks and bonds, reducing overall risk.",
              },
              {
                id: "income",
                iconName: "Coins",
                title: "Income",
                content:
                  "Real estate has consistently delivered higher yields than traditional fixed-income investments, even in inflationary periods.",
              },
              {
                id: "growth",
                iconName: "TrendingUp",
                title: "Growth Potential",
                content:
                  "Over time, real estate appreciates faster than inflation, supporting wealth preservation and long-term capital growth.",
              },
              {
                id: "stability",
                iconName: "Lock",
                title: "Stability",
                content:
                  "Real estate values typically fluctuate less than other assets, providing stability within a diversified investment portfolio.",
              },
            ],
          },
        },
        {
          type: "ICON_ACCORDION_GRID",
          data: {
            title: "The Access Advantage",
            subtitle: "Institutional-style real estate investing, now accessible to more investors.",
            background: "gray",
            ctaLabel: "Invest Now",
            ctaHref: "/contact",
            items: [
              {
                id: "minimums",
                iconName: "DollarSign",
                title: "Low Investment Minimums",
                content:
                  "Real estate investments are typically reserved for institutional investors, with minimums often ranging from $50,000 to $250,000. We're changing that dynamic. Accredited investors can start with $10,000, while crowdfunders can participate with as little as $100. By lowering investment thresholds, Access Properties makes real estate more accessible to a broader community of investors.",
              },
              {
                id: "safer",
                iconName: "ShieldCheck",
                title: "A Safer Approach",
                content:
                  "Rather than purchasing a single property or piecing together a portfolio independently, our members have the option to invest in diversified real estate portfolios with carefully selected assets. This approach minimizes risk and offers more consistent returns, providing greater security for investors over time.",
              },
              {
                id: "philosophy",
                iconName: "Lightbulb",
                title: "Investment Philosophy",
                content:
                  "Our investment approach is rooted in rigorous criteria: resilient locations, value-add potential, and downside protection. We pursue a variety of strategies, including Buy & Hold for steady income, BRRR (Buy, Renovate, Rent & Refinance) for capital recycling, and Fix & Flip for short-term gains. Each opportunity undergoes detailed financial analysis to meet our strict benchmarks.",
              },
              {
                id: "management",
                iconName: "BarChart3",
                title: "Active Portfolio Management",
                content:
                  "Our team is composed of licensed investment advisors and real estate agents with extensive local expertise. From acquisition to management and eventual exit, we oversee every detail, ensuring that our members enjoy steady, passive returns. Regular updates keep investors informed and confident in their portfolios.",
              },
              {
                id: "value",
                iconName: "Wrench",
                title: "Unlocking Value",
                content:
                  "Our strategy revolves around value-driven investments. We target properties with high potential, adding value through strategic improvements or repositioning. This enhances both the local community and investor returns by revitalizing underperforming assets and driving economic growth.",
              },
              {
                id: "integrated",
                iconName: "Link2",
                title: "Integrated Model",
                content:
                  "Part of Access Group, we leverage cost-effective property improvement advisory services, maximizing the impact of every dollar invested. This allows more capital to flow directly into the assets themselves, which enhances overall investment returns for our members.",
              },
            ],
          },
        },
        {
          type: "TESTIMONIALS",
          data: {
            title: "Testimonials",
            subtitle: "What our early supporters and investors are saying.",
            items: [
              {
                quote:
                  "I became an early investor in Access Properties because I had worked with the founder before and knew their track record firsthand. Their integrity and work ethic made investing an easy decision well before the platform launched, and I believed strongly in where the company was headed.",
                attribution: "— M.N., investor since 2023",
              },
              {
                quote:
                  "I'm an active investor in the public markets and startups, and after seeing the progress Access Properties had made and knowing the founder personally I felt comfortable joining at this point to support the next phase of the company's growth.",
                attribution: "— A.D., investor since 2025",
              },
            ],
          },
        },
        { type: "DISCLOSURE", data: {} },
        { type: "SOCIALS", data: {} },
      ],
    },
    {
      slug: "about",
      title: "About",
      status: "published",
      publishedAt: new Date(),
      sections: [
        {
          type: "HERO",
          data: {},
        },
        {
          type: "ICON_ACCORDION_GRID",
          data: {
            title: "How We're Changing Real Estate Investment",
            subtitle:
              "We remove long-standing barriers to property investing so more people can participate with clarity and confidence. Our platform gives members access to professionally managed portfolios through a streamlined digital experience.",
            items: [
              {
                id: "changing-digital",
                iconName: "Sparkles",
                title: "Digital Syndication & Automated Investment",
                content:
                  "Our proprietary technology powers a digital syndication model that connects crowdfunding participants and accredited investors within unified investment structures. From onboarding to reporting, every stage is designed to be simple, transparent, and automated.",
              },
              {
                id: "changing-asset",
                iconName: "BarChart3",
                title: "Asset Management & Portfolio Growth",
                content:
                  "We actively manage each portfolio through disciplined underwriting, operating improvements, and strategic execution to pursue long-term value creation and consistent performance.",
              },
            ],
          },
        },
        {
          type: "ICON_ACCORDION_GRID",
          data: {
            items: [
              {
                id: "story-expertise",
                iconName: "Briefcase",
                title: "Our Expertise",
                content:
                  "To deliver exceptional outcomes, Access Properties leverages deep industry knowledge, comprehensive market research, and rigorous financial analysis. Strengthened by strategic partnerships, our team works to optimize asset performance at every stage.",
              },
              {
                id: "story-approach",
                iconName: "Building2",
                title: "Our Approach",
                content:
                  "Access Properties pools member capital to build diversified real estate portfolios across multiple geographies. By identifying, acquiring, improving, and managing high-potential assets, we create opportunities for broad participation in markets traditionally dominated by institutions.",
              },
            ],
          },
        },
        {
          type: "PROFILE_CARDS",
          data: {
            title: "Leadership",
            subtitle: "Experienced operators and advisors committed to transparency.",
            cards: [
              {
                imageSrc: "/profiles/Dionysios Kaskarelis.jpg",
                roleLine: "Founder & Chief Executive Manager",
                name: "Dionysios Kaskarelis",
                paragraphs: [
                  "An investment advisor representative and Realtor, Dionysios brings over 15 years of experience in international development finance and investment banking, with a focus. Prior to founding Access Properties, he gained extensive experience investing in and exiting from real estate projects in the US and Europe. He holds a B.S. from Boston College and graduate degrees from the Sir John Cass Business School and the Fletcher School of Law and Diplomacy.",
                ],
                embeddedAudioSrc: "/audio/founder-story.mp3",
              },
              {
                imageSrc: "/profiles/Richard LeSavoy.jpg",
                roleLine: "Partnership Representative",
                name: "Richard LeSavoy",
                paragraphs: [
                  "After a 35-year career as a manufacturing executive and public company officer, Richard transitioned into financial planning, earning both his Certified Financial Planner and Certified Retirement Counselor credentials. In 2017, he became an IRS Enrolled Agent and founded FairTax Planning, LLC, a boutique tax advisory firm. He holds a B.S. from Philadelphia University and a Financial Planning Certificate from Boston University. while also serving as Treasurer for three non-profits.",
                ],
              },
            ],
          },
        },
        {
          type: "ADVISORY",
          data: {
            title: "Advisory & Board",
            subtitle: "Additional expertise across banking, finance, law, and construction.",
            image: "/profiles/partners.jpg",
            heading: "Managing Partners",
            subheading: "Strategic support & guidance",
            body:
              "We're supported by four additional managing partners who bring deep expertise across banking, finance, law, and construction. Beyond their seed investment, they actively contribute strategic insight and operational guidance, strengthening our foundation as we scale.",
          },
        },
        { type: "DISCLOSURE", data: {} },
        { type: "SOCIALS", data: {} },
      ],
    },
    {
      slug: "greater-boston",
      title: "Greater Boston",
      status: "published",
      publishedAt: new Date(),
      sections: [
        {
          type: "HERO",
          data: {},
        },
        {
          type: "GREATER_BOSTON_REASONS",
          data: {
            title: "Why Invest in Massachusetts",
            subtitle: "Key reasons Greater Boston remains a strong long-term real estate market.",
            imageUrl:
              "https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=2400&q=80",
            reasons: [
              "Strong Economy: Tech, Biotech, Education, Healthcare",
              "High Appreciation: Limited land + Demand = Value Growth",
              "Rental Demand: Urban cores & college towns",
              "Tourism & Culture: Short-term rental upside",
              "Institutions: Harvard, MIT, Tufts driving housing needs",
            ],
          },
        },
        {
          type: "PROPERTY_COLUMNS",
          data: {
            title: "Properties",
            subtitle: "Explore the current properties in the Greater Boston portfolio.",
            columns: ["Buy & Hold", "Buy, Renovate, Rent, and Refinance", "Fix & Flip"],
            mapping: {
              "Buy & Hold": {
                slug: "374-chestnut-hill-ave-3-brighton-ma-02135-2",
                image: "/properties/374/374_Chestnut_Hill_3.jpeg",
              },
              "Buy, Renovate, Rent, and Refinance": {
                slug: "340-main-st-703-melrose-ma-02176-2",
                image: "/properties/340/before/340_main_street_703.jpeg",
              },
              "Fix & Flip": {
                slug: "9-ledge-st-melrose-ma-02176-2",
                image: "/properties/9-ledge-street/9Ledge_Street.jpeg",
              },
            },
          },
        },
        { type: "DISCLOSURE", data: {} },
        { type: "SOCIALS", data: {} },
      ],
    },
    {
      slug: "portfolios",
      title: "Portfolios",
      status: "published",
      publishedAt: new Date(),
      sections: [
        {
          type: "HERO",
          data: {},
        },
        {
          type: "PORTFOLIO_CARD",
          data: {
            title: "Greater Boston",
            subtitle: "Access Properties Alternative Dividend Fund",
            ctaLabel: "Learn More",
            ctaHref: "/greater-boston",
            footnote: "CrowdFunders: $100 • Accredited investors: $10,000",
            stats: [
              { label: "2", value: "" },
              { label: "Min. investment Crowd investors", value: "$100" },
              { label: "Min. investment Accredited investors", value: "$10,000" },
              { label: "Liquidity", value: "Always Open" },
              { label: "Payment schedule", value: "Annual" },
              { label: "Properties", value: "3" },
            ],
          },
        },
        { type: "DISCLOSURE", data: {} },
        { type: "SOCIALS", data: {} },
      ],
    },
    {
      slug: "faq",
      title: "FAQ",
      status: "published",
      publishedAt: new Date(),
      sections: [
        {
          type: "FAQ_PAGE",
          data: {
            heroTitle: "Frequently Asked Questions",
            heroSubtitle: "Answers to common questions about investing with Access Properties.",
            categories: [
              { key: "legal", title: "Legal", iconName: "Scale" },
              { key: "operational", title: "Operational", iconName: "Settings" },
              { key: "tax", title: "Tax", iconName: "Calculator" },
              { key: "financial", title: "Financial", iconName: "DollarSign" },
            ],
          },
        },
        {
          type: "DISCLOSURE",
          data: {
            variant: "full",
            title: "Full Disclosure",
            bodyHtml:
              "<p>This website and its content are provided for informational purposes only. Nothing herein constitutes an offer to sell, or a solicitation of an offer to buy, any securities or investment products.</p>" +
              "<p><strong>Investing in real estate involves significant risks, including but not limited to:</strong></p>" +
              "<ul>" +
              "<li><strong>Market Risk</strong> - Real estate values may fluctuate due to economic, regulatory, and market conditions.</li>" +
              "<li><strong>Liquidity Risk</strong> - Real estate investments are typically illiquid and may not be easily sold or exchanged.</li>" +
              "<li><strong>Leverage Risk</strong> - The use of borrowing or leverage may amplify losses.</li>" +
              "<li><strong>Regulatory Risk</strong> - Changes in laws or regulations could adversely affect the investment.</li>" +
              "</ul>" +
              "<p>Past performance is not indicative of future results. There is no assurance that Access Properties will achieve their investment objectives or that any investment will be profitable. Real estate investments often require long holding periods, during which market conditions may change. Any information contained on this site is current as of the date published and may not reflect subsequent developments.</p>" +
              "<p>Prospective investors should conduct their own due diligence and consult independent legal, tax, and financial advisors before making any investment decision. Participation in Access Properties is governed exclusively by the detailed terms and conditions outlined in the official offering documents, including the Operating Agreement. Prospective investors must thoroughly review and understand these documents before investing.</p>" +
              "<p>Access Properties, its affiliates, and management make no representations or warranties, express or implied, regarding the accuracy or completeness of the information provided herein.</p>" +
              "<p><strong>By accessing this site and its materials, you acknowledge and agree to these terms.</strong></p>",
          },
        },
        { type: "SOCIALS", data: {} },
      ],
    },
    {
      slug: "contact",
      title: "Contact",
      status: "published",
      publishedAt: new Date(),
      sections: [
        {
          type: "CONTACT_FORM",
          data: {
            title: "SEND A MESSAGE",
            image: "/contactRightImage.png",
            imageAlt: "Contact Us",
          },
        },
        { type: "SOCIALS", data: {} },
      ],
    },
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      status: "published",
      publishedAt: new Date(),
      sections: [
        {
          type: "HERO",
          data: {
            title: "Privacy Policy",
            subtitle: "How we collect and use information.",
            overlayOpacity: 0.6,
          },
        },
        {
          type: "RICH_TEXT",
          data: {
            heading: "Overview",
            bodyHtml:
              "<p>This policy explains how we collect, use, and protect your personal information.</p>",
          },
        },
        { type: "DISCLOSURE", data: {} },
        { type: "SOCIALS", data: {} },
      ],
    },
  ];

  await Page.insertMany(pages);
};

const seedProperties = async () => {
  await Property.deleteMany({});
  await Property.insertMany([
    {
      slug: "374-chestnut-hill-ave-3-brighton-ma-02135-2",
      title: "374 Chestnut Hill Avenue #3",
      address: "374 Chestnut Hill Ave #3",
      city: "Brighton",
      state: "MA",
      zip: "02135",
      type: "Condominium",
      beds: 1,
      baths: 1,
      parking: "0",
      sqft: 568,
      status: "active",
      featured: true,
      description:
        "<p>Located directly across from the Chestnut Hill Reservoir and adjacent to Boston College, this first-floor condominium offers convenient city living with access to numerous neighborhood amenities. The unit features 1 bedroom, 1 bathroom, a living/dining room combination, and a kitchen with eat-in space, providing a functional layout suited for both comfort and efficiency.</p><p>Residents of the building enjoy access to an outdoor swimming pool, ideal for warmer days in the city, as well as professional management for building care and convenience.</p><p>The location offers excellent access to transportation and surrounding destinations. The Green Line is nearby, providing a direct route to Back Bay with eight stops to Copley Station. The property is also close to supermarkets, restaurants, cafes, and the growing Boston Landing development-home to expanding retail, dining, office, and athletic facilities.</p><p>A well-situated Brighton condo offering access to key city conveniences, recreation, and major transit connections.</p>",
      galleries: {
        beforeImages: [
          {
            url: "/properties/374/374_chestnut_hill_unit3_01_living_room.jpg",
            alt: "Living room",
          },
          { url: "/properties/374/374_chestnut_hill_unit3_02_kitchen.jpg", alt: "Kitchen" },
          { url: "/properties/374/374_chestnut_hill_unit3_03_bedroom.jpg", alt: "Bedroom" },
        ],
        duringImages: [],
        afterImages: [
          { url: "/properties/374/374_chest1.jpeg" },
          { url: "/properties/374/374_chest2.jpeg" },
          { url: "/properties/374/374_chest3.jpeg" },
          { url: "/properties/374/374_chest4.jpeg" },
          { url: "/properties/374/374_chest5.jpeg" },
          { url: "/properties/374/374_chest6.jpeg" },
        ],
      },
      highlights: ["Across from Chestnut Hill Reservoir", "Transit accessible"],
      facts: ["1 bed", "1 bath", "568 sq ft"],
    },
    {
      slug: "340-main-st-703-melrose-ma-02176-2",
      title: "340 Main Street #703",
      address: "340 Main Street #703",
      city: "Melrose",
      state: "MA",
      zip: "02176",
      type: "Condominium",
      beds: 2,
      baths: 1,
      parking: "1 (uncovered)",
      sqft: 738,
      status: "active",
      featured: true,
      description:
        "<p>Located in the heart of downtown Melrose, this fully renovated penthouse condominium offers modern living with exceptional convenience. Positioned on the 7th floor of an elevator building, Unit #703 features 2 bedrooms, 1 bathroom, and a redesigned interior completed in 2025.</p><p>The home includes a modern open-concept kitchen, raised ceilings, and panoramic windows that frame views of downtown Melrose and fill the space with natural light. The layout is designed for comfortable day-to-day living as well as easy entertaining.</p><p>Residents enjoy access to a large common balcony, a spacious community room, and professional management that oversees building care. The unit also comes with one outdoor, uncovered parking space.</p><p>Situated directly on Main Street, the property places everyday amenities within easy reach, including shops, restaurants, cafes, supermarkets, parks, schools, and the community swimming pool. Commuting is straightforward: the Melrose commuter rail station provides travel to North Station in just three stops, and the Oak Grove Orange Line is a 4-minute drive or 24-minute walk. Nearby highway access adds further convenience for regional travel.</p>",
      galleries: {
        beforeImages: [
          { url: "/properties/340/before/340_main_st_703_before_01_building_exterior.jpg" },
          { url: "/properties/340/before/340_main_st_703_before_02_living_room.jpg" },
          { url: "/properties/340/before/340_main_st_703_before_06_living_room_wide.jpg" },
          { url: "/properties/340/before/340_main_st_703_before_04_bedroom.jpg" },
          { url: "/properties/340/before/340_main_st_703_before_05_bathroom.jpg" },
          { url: "/properties/340/before/340_main_st_703_before_07_office_bonus_room.jpg" },
          { url: "/properties/340/before/340_main_st_703_before_03_rooftop_hvac.jpg" },
        ],
        duringImages: [],
        afterImages: [],
      },
      highlights: ["Downtown Melrose", "Elevator building"],
      facts: ["2 bed", "1 bath", "738 sq ft"],
    },
    {
      slug: "9-ledge-st-melrose-ma-02176-2",
      title: "9 Ledge Street",
      address: "9 Ledge Street",
      city: "Melrose",
      state: "MA",
      zip: "02176",
      type: "Single Family",
      beds: 3,
      baths: 2.5,
      parking: "2 (uncovered)",
      sqft: 1528,
      status: "coming_soon",
      featured: true,
      description:
        "<p>Access Properties will soon introduce a new-construction single-family home offering 1,528 sq. ft. of light-filled, open-concept living space with 3 bedrooms, 2.5 baths, and a study nook. A full project team-including a project manager, architect, designer, and builder-is already in place, and both the special permit and construction plans have been approved.</p><p>Situated on a 4,053 sq. ft. lot, the property will include new hardscaping for easier access, as well as updated landscaping for the backyard and surrounding lot.</p><p>The first floor features a modern open-concept kitchen, integrated dining area, and connected living room and TV room. Floor-to-ceiling sliding doors provide direct access to the patio and backyard. A mudroom, half bathroom, and first-floor washer/dryer add convenience to the layout. The home will also include a multi-zone heating and cooling system serving both floors.</p><p>On the second floor, the main bedroom includes an ensuite bathroom. Two additional bedrooms, a full bath, and a study nook complete the level.</p><p>Buyers will have the opportunity to choose customizable finishes as the project progresses.</p>",
      galleries: {
        beforeImages: [],
        duringImages: [],
        afterImages: [
          { url: "/properties/9-ledge/before/9_ledge_street_01_exterior_front.jpg" },
          { url: "/properties/9-ledge/before/9_ledge_street_02_exterior_side.jpg" },
          { url: "/properties/9-ledge/before/9_ledge_street_03_exterior_rear.jpg" },
          { url: "/properties/9-ledge/before/9_ledge_street_04_gas_meter.jpg" },
          { url: "/properties/9-ledge/before/9_ledge_street_05_living_room_1.jpg" },
          { url: "/properties/9-ledge/before/9_ledge_street_06_living_room_2.jpg" },
          { url: "/properties/9-ledge/before/9_ledge_street_07_living_room_3.jpg" },
          { url: "/properties/9-ledge/before/9_ledge_street_08_kitchen.jpg" },
          { url: "/properties/9-ledge/before/9_ledge_street_09_dining_area.jpg" },
          { url: "/properties/9-ledge/before/9_ledge_street_10_bedroom_1.jpg" },
          { url: "/properties/9-ledge/before/9_ledge_street_11_bedroom_2.jpg" },
          { url: "/properties/9-ledge/before/9_ledge_street_12_attic_bedroom.jpg" },
          { url: "/properties/9-ledge/before/9_ledge_street_13_attic_storage.jpg" },
          { url: "/properties/9-ledge/before/9_ledge_street_14_bathroom.jpg" },
        ],
      },
      highlights: ["New construction", "Approved permits"],
      facts: ["3 bed", "2.5 bath", "1,528 sq ft"],
    },
  ]);
};

const seedTeam = async () => {
  await TeamMember.deleteMany({});
  await TeamMember.insertMany([
    {
      name: "Dionysios Kaskarelis",
      role: "Founder & Chief Executive Manager",
      photoUrl: "/profiles/Dionysios Kaskarelis.jpg",
      bio: "Investment advisor representative and Realtor with 15+ years in development finance and investment banking.",
      socials: [],
      order: 1,
    },
    {
      name: "Richard LeSavoy",
      role: "Partnership Representative",
      photoUrl: "/profiles/Richard LeSavoy.jpg",
      bio: "Certified Financial Planner and Enrolled Agent with extensive leadership experience.",
      socials: [],
      order: 2,
    },
  ]);
};

const seedFaq = async () => {
  await FAQ.deleteMany({});
  await FAQ.insertMany([
    {
      question: "What is Access Properties?",
      answerHtml:
        "<p>Access Properties is a private real estate investment platform that allows investors to participate in professionally managed, diversified real estate portfolios with low minimum investments. We focus on acquiring, renovating, and managing properties in the Greater Boston area.</p>",
      category: "Legal",
      order: 1,
    },
    {
      question: "Who can invest with Access Properties?",
      answerHtml:
        "<p>Both accredited investors and non-accredited investors (crowdfunders) can invest, subject to applicable regulations and offering terms. Accredited investors typically have higher investment minimums, while crowdfunding allows participation starting at $100.</p>",
      category: "Legal",
      order: 2,
    },
    {
      question: "Who owns the properties?",
      answerHtml:
        "<p>Each property is owned by Access Properties LLC. By investing in Access Properties, you acquire an indirect fractional ownership interest in a managed, diversified real estate portfolio. You do not directly own individual properties.</p>",
      category: "Legal",
      order: 3,
    },
    {
      question: "What legal structure does Access Properties use?",
      answerHtml:
        "<p>Access Properties operates as a Limited Liability Company (LLC). Investors become members of the LLC and receive membership interests proportional to their investment. This structure provides liability protection and favorable tax treatment.</p>",
      category: "Legal",
      order: 4,
    },
    {
      question: "Are investments guaranteed?",
      answerHtml:
        "<p>No investment is guaranteed. Real estate investments involve risk, including the potential loss of principal. Market conditions, property performance, and economic factors can all impact returns. Past performance is not indicative of future results.</p>",
      category: "Legal",
      order: 5,
    },
    {
      question: "Where can I find full legal disclosures?",
      answerHtml:
        "<p>Full legal disclosures, including the Private Placement Memorandum (PPM), Operating Agreement, and all material risk factors are available within each portfolio's offering documents on the platform. We recommend reviewing these carefully before investing.</p>",
      category: "Legal",
      order: 6,
    },
    {
      question: "What are my rights as an investor?",
      answerHtml:
        "<p>As a member of the LLC, you have the right to receive distributions according to your ownership percentage, review annual financial statements, vote on major decisions as outlined in the Operating Agreement, and access regular property updates and performance reports.</p>",
      category: "Legal",
      order: 7,
    },
    {
      question: "Can I sell my investment?",
      answerHtml:
        "<p>Investments in Access Properties are generally illiquid and intended for long-term holding. While transfers may be possible under certain conditions and with company approval, there is no established secondary market. Exit opportunities typically occur upon property sales or refinancing events.</p>",
      category: "Legal",
      order: 8,
    },
    {
      question: "How does Access Properties select investments?",
      answerHtml:
        "<p>We focus on undervalued properties in strong Greater Boston markets with appreciation potential. Our selection criteria include location quality, renovation opportunities, rental demand, and alignment with our investment strategies (Buy & Hold, BRRR, or Fix & Flip).</p>",
      category: "Operational",
      order: 1,
    },
    {
      question: "What investment strategies does Access Properties employ?",
      answerHtml:
        "<p>Access Properties uses three primary strategies:</p><ul><li><strong>Buy &amp; Hold:</strong> Acquire stable properties for long-term rental income</li><li><strong>BRRR (Buy, Renovate, Rent, Refinance):</strong> Add value through renovations, stabilize with tenants, then refinance</li><li><strong>Fix &amp; Flip:</strong> Purchase distressed properties, renovate, and sell for profit</li></ul>",
      category: "Operational",
      order: 2,
    },
    {
      question: "Who manages the properties?",
      answerHtml:
        "<p>Properties are professionally managed by Access Properties' experienced team. We handle all aspects including tenant screening, rent collection, maintenance coordination, renovations, and regulatory compliance. Investors receive regular updates but are not involved in day-to-day operations.</p>",
      category: "Operational",
      order: 3,
    },
    {
      question: "How often will I receive updates on my investment?",
      answerHtml:
        "<p>Investors receive quarterly performance reports detailing property operations, financial performance, occupancy rates, and any significant developments. Major updates such as completed renovations, refinancing events, or property sales are communicated as they occur.</p>",
      category: "Operational",
      order: 4,
    },
    {
      question: "What happens if a property needs major repairs?",
      answerHtml:
        "<p>We maintain reserve funds for capital expenditures and unexpected repairs. Major repairs are budgeted into our initial underwriting. If extraordinary expenses exceed reserves, the company may defer distributions temporarily or, in rare cases, conduct a capital call from members.</p>",
      category: "Operational",
      order: 5,
    },
    {
      question: "How does Access Properties handle tenant issues?",
      answerHtml:
        "<p>Our property management team handles all tenant-related matters including lease enforcement, maintenance requests, conflict resolution, and if necessary, eviction proceedings. We maintain 24/7 emergency maintenance support and work to keep occupancy rates high through responsive service.</p>",
      category: "Operational",
      order: 6,
    },
    {
      question: "What insurance coverage is maintained?",
      answerHtml:
        "<p>All properties carry comprehensive insurance including property/casualty coverage, liability protection, and loss of rents coverage. The LLC also maintains general liability insurance. Insurance costs are factored into operating expenses and reflected in financial projections.</p>",
      category: "Operational",
      order: 7,
    },
    {
      question: "Can I visit the properties I've invested in?",
      answerHtml:
        "<p>Due to privacy concerns for tenants and operational considerations, property visits are generally not permitted for occupied units. However, we provide comprehensive photo documentation, virtual tours, and detailed progress reports for all properties in the portfolio.</p>",
      category: "Operational",
      order: 8,
    },
    {
      question: "What tax documents will I receive?",
      answerHtml:
        "<p>As an LLC member, you will receive a Schedule K-1 annually by March 15th (or extension date). The K-1 reports your proportionate share of the LLC's income, losses, deductions, and credits. You'll use this to complete your personal tax return.</p>",
      category: "Tax",
      order: 1,
    },
    {
      question: "How is rental income taxed?",
      answerHtml:
        "<p>Rental income flows through to you as passive income reported on your Schedule K-1. This income is offset by property expenses including depreciation, mortgage interest, property taxes, insurance, maintenance, and management fees. Most investors see tax losses in early years due to depreciation deductions.</p>",
      category: "Tax",
      order: 2,
    },
    {
      question: "What is depreciation and how does it benefit me?",
      answerHtml:
        "<p>Depreciation is a non-cash deduction that reduces taxable income. Residential rental properties are depreciated over 27.5 years. For example, a $275,000 building generates approximately $10,000 in annual depreciation deductions, reducing your taxable income even while the property may be appreciating in value.</p>",
      category: "Tax",
      order: 3,
    },
    {
      question: "Can I deduct losses from my investment?",
      answerHtml:
        "<p>Passive losses from real estate can generally offset passive income. If you have excess passive losses, they carry forward indefinitely to offset future passive income. Real estate professionals who materially participate may be able to deduct losses against ordinary income. Consult your tax advisor for your specific situation.</p>",
      category: "Tax",
      order: 4,
    },
    {
      question: "What happens tax-wise when a property is sold?",
      answerHtml:
        "<p>Property sales generate capital gains or losses reported on your K-1. Long-term capital gains (property held over 1 year) receive preferential tax rates. Depreciation recapture is taxed at a maximum 25% rate. In a 1031 exchange, gains can be deferred by reinvesting proceeds into new properties.</p>",
      category: "Tax",
      order: 5,
    },
    {
      question: "Are distributions taxable?",
      answerHtml:
        "<p>Distributions themselves are generally not taxable events - you're taxed on your share of the LLC's income regardless of whether distributions are made. However, distributions may reduce your tax basis in the investment. If distributions exceed your basis, the excess is treated as capital gain.</p>",
      category: "Tax",
      order: 6,
    },
    {
      question: "Do I need to file taxes in Massachusetts?",
      answerHtml:
        "<p>If you're not a Massachusetts resident but invest in Access Properties, you may need to file a Massachusetts non-resident tax return reporting your share of income from properties located in Massachusetts. Consult with a tax professional familiar with multi-state tax issues.</p>",
      category: "Tax",
      order: 7,
    },
    {
      question: "Can I use a self-directed IRA or 401(k) to invest?",
      answerHtml:
        "<p>Yes, self-directed retirement accounts can invest in Access Properties. The investment and all returns stay within the tax-advantaged account. However, income may be subject to Unrelated Business Taxable Income (UBTI) if the property uses debt financing. Consult your retirement account custodian and tax advisor.</p>",
      category: "Tax",
      order: 8,
    },
    {
      question: "What is the minimum investment?",
      answerHtml:
        "<p>Minimum investments vary by offering and investor type. Crowdfunding opportunities start at $100, making real estate accessible to most investors. Accredited investors typically have minimums starting at $10,000 for direct investment opportunities.</p>",
      category: "Financial",
      order: 1,
    },
    {
      question: "How are returns generated?",
      answerHtml:
        "<p>Returns come from three sources: (1) Rental income distributed periodically to investors, (2) Property appreciation realized when properties are sold or refinanced, and (3) Equity captured through strategic renovations that increase property values and rental rates.</p>",
      category: "Financial",
      order: 2,
    },
    {
      question: "What are the expected returns?",
      answerHtml:
        "<p>Target returns vary by strategy: Buy &amp; Hold targets 8-12% annual cash-on-cash returns plus appreciation; BRRR targets 12-18% IRR over 3-5 years; Fix &amp; Flip targets 15-25% returns over 6-18 months. Returns are projections only and not guaranteed. Actual performance may vary significantly.</p>",
      category: "Financial",
      order: 3,
    },
    {
      question: "How often are distributions paid?",
      answerHtml:
        "<p>Distribution schedules vary by property strategy and performance. Buy &amp; Hold properties typically distribute quarterly or annually once stabilized. BRRR properties may defer distributions until refinancing. Fix &amp; Flip investments distribute proceeds upon property sale. All distributions are subject to sufficient cash flow and company discretion.</p>",
      category: "Financial",
      order: 4,
    },
    {
      question: "What fees does Access Properties charge?",
      answerHtml:
        "<p>Fee structure varies by offering but typically includes:</p><ul><li><strong>Acquisition Fee:</strong> 1-2% of purchase price for sourcing and closing</li><li><strong>Asset Management Fee:</strong> 1-2% annually of invested capital</li><li><strong>Property Management Fee:</strong> 8-10% of collected rents</li><li><strong>Disposition Fee:</strong> 1-2% of sale price when properties are sold</li><li><strong>Performance Fee:</strong> 20% of profits above preferred return hurdle</li></ul><p>All fees are detailed in offering documents.</p>",
      category: "Financial",
      order: 5,
    },
    {
      question: "What is a preferred return?",
      answerHtml:
        "<p>A preferred return (typically 6-8% annually) means investors receive priority on distributions up to that rate before the sponsor receives performance fees. For example, with an 8% preferred return, investors receive the first 8% of returns, and profits above 8% are split between investors and sponsors (commonly 80/20).</p>",
      category: "Financial",
      order: 6,
    },
    {
      question: "How is property valuation determined?",
      answerHtml:
        "<p>Initial valuations are based on purchase price and comparable sales. Ongoing valuations use income approaches (capitalization rate applied to net operating income) and sales comparison approaches. Independent appraisals are obtained for refinancing and sales. Annual statements may show estimated values between formal appraisals.</p>",
      category: "Financial",
      order: 7,
    },
    {
      question: "What is the typical hold period?",
      answerHtml:
        "<p>Hold periods vary by strategy: Buy &amp; Hold properties are held 5-10+ years for long-term appreciation and income; BRRR properties typically 3-5 years through the renovation and stabilization cycle; Fix &amp; Flip properties 6-18 months from acquisition through renovation to sale. Extensions may occur based on market conditions.</p>",
      category: "Financial",
      order: 8,
    },
    {
      question: "What risks should I be aware of?",
      answerHtml:
        "<p>Real estate investing involves multiple risks including:</p><ul><li><strong>Market Risk:</strong> Property values and rental rates may decline</li><li><strong>Liquidity Risk:</strong> Investments are illiquid with limited exit options</li><li><strong>Operational Risk:</strong> Unexpected repairs, vacancies, or management issues</li><li><strong>Financing Risk:</strong> Interest rate changes or refinancing challenges</li><li><strong>Concentration Risk:</strong> Portfolio focused on Greater Boston market</li><li><strong>Regulatory Risk:</strong> Changes in landlord-tenant laws or zoning</li></ul><p>Review the full risk disclosures in offering documents.</p>",
      category: "Financial",
      order: 9,
    },
    {
      question: "How do I track my investment performance?",
      answerHtml:
        "<p>Investors receive quarterly reports showing property performance, occupancy, rental income, expenses, and distributions. Annual K-1 tax documents provide comprehensive financial details. You can also access a secure investor portal with real-time property information, documents, and performance dashboards.</p>",
      category: "Financial",
      order: 10,
    },
  ]);
};

const seedSettings = async () => {
  await SiteSettings.deleteMany({});
  await SiteSettings.create({
    siteName: "Access Properties",
    logo: "/logo192.png",
    favicon: "/favicon.ico",
    navLinks: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Portfolios", href: "/portfolios" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
    footer: {
      address: "Greater Boston, MA",
      emails: ["info@ap.boston"],
      phones: ["+1 (617) 000-0000"],
      socialLinks: [
        { label: "Facebook", url: "https://www.facebook.com/profile.php?id=61584055630471" },
        { label: "LinkedIn", url: "https://www.linkedin.com/company/access-properties" },
        { label: "Instagram", url: "https://www.instagram.com/access_properties_2022/" },
      ],
      quickLinks: [
        { label: "Invest Now", href: "/greater-boston" },
        { label: "FAQ", href: "/faq" },
        { label: "Contact Us", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy-policy" },
      ],
      ctaLine: "Start investing in real estate today.",
    },
    defaultSeo: {
      metaTitle: "Access Properties",
      metaDescription: "Real estate investing made accessible.",
    },
  });
};

const run = async () => {
  await connectDb();
  await seedAdmin();
  await seedPages();
  await seedProperties();
  await seedTeam();
  await seedFaq();
  await seedSettings();
  console.log("Seed complete");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
