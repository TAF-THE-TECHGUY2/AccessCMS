import { connectDb } from "../config/db.js";
import { Page, PageSection } from "../models/Page.js";

// Home and Contact never stored a newsletter block: the public site injected
// one at render time whenever the page had no NEWSLETTER section, and the page
// builder did the same on open. Deleting the block therefore did nothing --
// both fallbacks read "no NEWSLETTER section" as "legacy page, add the
// default" and put it straight back.
//
// This backfill writes that block into those pages as a real section, in the
// position the fallback rendered it, so the fallbacks can be removed and an
// absent newsletter can finally mean the editor deleted it.
//
// Safe to re-run: pages that already have a NEWSLETTER section are skipped.

// "/" is the legacy spelling of the home slug (see normalizeSlug in
// pages.routes.ts), so both forms have to be covered.
const LEGACY_NEWSLETTER_SLUGS = ["/", "home", "contact"];

// Mirrors the defaults NewsletterSignup renders with no props, so the public
// page looks identical before and after this runs.
const newsletterSection = (): PageSection => ({
  type: "NEWSLETTER",
  access: "PUBLIC",
  data: {
    title: "Subscribe to Our Newsletter",
    subtitle: "Get periodic updates from Access Properties.",
    buttonLabel: "Subscribe",
    buttonHref: "https://mailchi.mp/052b0234689c/access-properties",
  },
});

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// Ported from the public PageRenderer's anchor matching. On home the injected
// newsletter sat directly after the intro section rather than at the end, so
// the backfill has to reproduce that or the block moves down the page.
const homeNewsletterAnchorMatchers = [
  "who we are",
  "access properties is a real estate investment manager focused on expanding access to professionally managed real estate through a simple, transparent platform.",
];

const isHomeNewsletterAnchor = (section: PageSection) => {
  const data = (section?.data || {}) as Record<string, unknown>;
  const textCandidates = [
    data.title,
    data.subtitle,
    data.heading,
    data.body,
    data.bodyHtml,
    data.heroTitle,
    data.heroSubtitle,
    data.introText,
  ]
    .map(normalizeText)
    .filter(Boolean);

  return homeNewsletterAnchorMatchers.some((matcher) =>
    textCandidates.some((candidate) => candidate.includes(matcher))
  );
};

const insertionIndex = (slug: string, sections: PageSection[]) => {
  if (slug === "/" || slug === "home") {
    const anchor = sections.findIndex((section) => isHomeNewsletterAnchor(section));
    if (anchor >= 0) return anchor + 1;
  }
  // Contact, and home with no intro section, appended the block at the end.
  return sections.length;
};

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  await connectDb();

  const pages = await Page.find({ slug: { $in: LEGACY_NEWSLETTER_SLUGS } });
  if (pages.length === 0) {
    console.log(`No pages matched ${LEGACY_NEWSLETTER_SLUGS.join(", ")}. Nothing to do.`);
    process.exit(0);
  }

  let changed = 0;
  for (const page of pages) {
    const sections = (page.sections || []) as PageSection[];
    if (sections.some((section) => section.type === "NEWSLETTER")) {
      console.log(`skip  ${page.slug} — already has a NEWSLETTER section`);
      continue;
    }

    const index = insertionIndex(page.slug, sections);
    const position = index === sections.length ? "at the end" : `after section ${index} (${sections[index - 1]?.type})`;
    console.log(`${dryRun ? "would" : "write"} ${page.slug} — insert NEWSLETTER ${position}`);

    if (dryRun) continue;

    page.sections = [...sections.slice(0, index), newsletterSection(), ...sections.slice(index)];
    page.markModified("sections");
    await page.save();
    changed += 1;
  }

  console.log(
    dryRun
      ? "Dry run complete — no pages written."
      : `Backfill complete — ${changed} page(s) updated.`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
