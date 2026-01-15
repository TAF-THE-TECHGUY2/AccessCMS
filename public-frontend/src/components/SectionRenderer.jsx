import React from "react";
import HeroSection from "./sections/HeroSection.jsx";
import RichTextSection from "./sections/RichTextSection.jsx";
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

const SectionMap = {
  HERO: HeroSection,
  RICH_TEXT: RichTextSection,
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
};

export default function SectionRenderer({ sections = [] }) {
  return (
    <>
      {sections.map((section, idx) => {
        const Component = SectionMap[section.type];
        if (!Component) return null;
        return <Component key={`${section.type}-${idx}`} data={section.data || {}} />;
      })}
    </>
  );
}
