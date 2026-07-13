import React from "react";
import HeroSection from "./sections/HeroSection.jsx";
import RichTextSection from "./sections/RichTextSection.jsx";
import SimpleContentSection from "./sections/SimpleContentSection.jsx";
import TitleImageSection from "./sections/TitleImageSection.jsx";
import StatsSection from "./sections/StatsSection.jsx";
import CtaSection from "./sections/CtaSection.jsx";
import TeamGridSection from "./sections/TeamGridSection.jsx";
import FaqAccordionSection from "./sections/FaqAccordionSection.jsx";
import PropertyGridSection from "./sections/PropertyGridSection.jsx";
import GallerySection from "./sections/GallerySection.jsx";
import ImageBannerSection from "./sections/ImageBannerSection.jsx";
import DividerSection from "./sections/DividerSection.jsx";
import DisclosureSection from "./sections/DisclosureSection.jsx";
import IconAccordionGridSection from "./sections/IconAccordionGridSection.jsx";
import IconCardGridSection from "./sections/IconCardGridSection.jsx";
import TestimonialsSection from "./sections/TestimonialsSection.jsx";
import SocialLinksSection from "./sections/SocialLinksSection.jsx";
import PortfolioCardSection from "./sections/PortfolioCardSection.jsx";
import GreaterBostonReasonsSection from "./sections/GreaterBostonReasonsSection.jsx";
import PropertyColumnsSection from "./sections/PropertyColumnsSection.jsx";
import ProfileCardsSection from "./sections/ProfileCardsSection.jsx";
import AdvisorySection from "./sections/AdvisorySection.jsx";
import ContactFormSection from "./sections/ContactFormSection.jsx";
import FaqPageSection from "./sections/FaqPageSection.jsx";
import NewsletterSection from "./sections/NewsletterSection.jsx";

const SectionMap = {
  HERO: HeroSection,
  RICH_TEXT: RichTextSection,
  SIMPLE_CONTENT: SimpleContentSection,
  TITLE_IMAGE: TitleImageSection,
  STATS: StatsSection,
  CTA: CtaSection,
  TEAM_GRID: TeamGridSection,
  FAQ_ACCORDION: FaqAccordionSection,
  PROPERTY_GRID: PropertyGridSection,
  GALLERY: GallerySection,
  IMAGE_BANNER: ImageBannerSection,
  DIVIDER: DividerSection,
  SPACER: DividerSection,
  DISCLOSURE: DisclosureSection,
  ICON_ACCORDION_GRID: IconAccordionGridSection,
  ICON_CARD_GRID: IconCardGridSection,
  TESTIMONIALS: TestimonialsSection,
  SOCIALS: SocialLinksSection,
  PORTFOLIO_CARD: PortfolioCardSection,
  GREATER_BOSTON_REASONS: GreaterBostonReasonsSection,
  PROPERTY_COLUMNS: PropertyColumnsSection,
  PROFILE_CARDS: ProfileCardsSection,
  ADVISORY: AdvisorySection,
  CONTACT_FORM: ContactFormSection,
  FAQ_PAGE: FaqPageSection,
  NEWSLETTER: NewsletterSection,
};

export default function SectionRenderer({ sections = [] }) {
  // Group consecutive PORTFOLIO_CARD sections so they render side by side
  // instead of stacking. Any other section stands on its own.
  const groups = [];
  sections.forEach((section, idx) => {
    const last = groups[groups.length - 1];
    if (section.type === "PORTFOLIO_CARD" && last?.type === "PORTFOLIO_CARD") {
      last.items.push({ section, idx });
    } else {
      groups.push({ type: section.type, items: [{ section, idx }] });
    }
  });

  return (
    <>
      {groups.map((group, gIdx) => {
        if (group.type === "PORTFOLIO_CARD" && group.items.length > 1) {
          return (
            <section key={`portfolio-group-${gIdx}`} className="py-20 md:py-24">
              <div className="max-w-6xl mx-auto px-4 grid gap-8 md:grid-cols-2 items-start">
                {group.items.map(({ section, idx }) => (
                  <PortfolioCardSection key={`${section.type}-${idx}`} data={section.data || {}} embedded />
                ))}
              </div>
            </section>
          );
        }
        return group.items.map(({ section, idx }) => {
          const Component = SectionMap[section.type];
          if (!Component) return null;
          return <Component key={`${section.type}-${idx}`} data={section.data || {}} />;
        });
      })}
    </>
  );
}
