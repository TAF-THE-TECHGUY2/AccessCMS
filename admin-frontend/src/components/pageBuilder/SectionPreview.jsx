import React from "react";
import { Box, Chip, Divider, Stack, Typography } from "@mui/material";
import InlineText from "./InlineText.jsx";

const SectionShell = ({ title, selected, onClick, children, dragProps }) => (
  <Box
    onClick={onClick}
    sx={{
      border: selected ? "2px solid #111" : "1px solid #e0e0e0",
      borderRadius: 2,
      p: 3,
      backgroundColor: "#fff",
      boxShadow: selected ? "0 8px 30px rgba(0,0,0,0.08)" : "none",
      cursor: "pointer",
      position: "relative",
    }}
    {...dragProps}
  >
    <Chip label={title} size="small" sx={{ position: "absolute", top: 12, right: 12 }} />
    {children}
  </Box>
);

export default function SectionPreview({ section, selected, editMode, onSelect, onUpdate, dragProps }) {
  const data = section.data || {};
  const update = (key, value) => onUpdate({ ...section, data: { ...data, [key]: value } });

  const baseProps = {
    selected,
    onClick: onSelect,
    dragProps,
  };

  switch (section.type) {
    case "HERO":
      return (
        <SectionShell title="Hero" {...baseProps}>
          <Stack spacing={2}>
            <InlineText
              editMode={editMode}
              value={data.title}
              variant="h4"
              onChange={(val) => update("title", val)}
            />
            {editMode ? (
              <InlineText
                editMode={editMode}
                value={data.subtitle}
                variant="h6"
                onChange={(val) => update("subtitle", val)}
                sx={{ color: "text.secondary" }}
              />
            ) : (
              <Typography color="text.secondary">{data.subtitle}</Typography>
            )}
            <Stack direction="row" spacing={2}>
              <Box sx={{ px: 3, py: 1.2, borderRadius: 2, backgroundColor: "#111", color: "#fff" }}>
                {data.primaryButton?.label || "Primary"}
              </Box>
              <Box sx={{ px: 3, py: 1.2, borderRadius: 2, border: "1px solid #111" }}>
                {data.secondaryButton?.label || "Secondary"}
              </Box>
            </Stack>
          </Stack>
        </SectionShell>
      );
    case "RICH_TEXT":
      return (
        <SectionShell title="Rich Text" {...baseProps}>
          <Stack spacing={2}>
            <InlineText
              editMode={editMode}
              value={data.heading}
              variant="h5"
              onChange={(val) => update("heading", val)}
            />
            <Typography color="text.secondary">
              {data.bodyHtml ? "Rich text content" : "Add rich text content"}
            </Typography>
          </Stack>
        </SectionShell>
      );
    case "IMAGE_BANNER":
      return (
        <SectionShell title="Image Banner" {...baseProps}>
          <Box
            sx={{
              width: "100%",
              aspectRatio: "16 / 5",
              borderRadius: 2,
              border: "1px dashed #bbb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#777",
            }}
          >
            {data.image ? "Image set" : "Add image"}
          </Box>
          <Typography sx={{ mt: 2 }}>{data.caption || "Banner caption"}</Typography>
        </SectionShell>
      );
    case "STATS":
      return (
        <SectionShell title="Stats" {...baseProps}>
          <Stack spacing={2}>
            <InlineText
              editMode={editMode}
              value={data.heading}
              variant="h5"
              onChange={(val) => update("heading", val)}
            />
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              {(data.items || []).map((item, idx) => (
                <Box key={`stat-${idx}`} sx={{ p: 2, border: "1px solid #eee", borderRadius: 2 }}>
                  <Typography variant="h6">{item.value}</Typography>
                  <Typography color="text.secondary">{item.label}</Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </SectionShell>
      );
    case "CTA":
      return (
        <SectionShell title="CTA" {...baseProps}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <InlineText
              editMode={editMode}
              value={data.headline}
              variant="h5"
              onChange={(val) => update("headline", val)}
            />
            <Typography color="text.secondary">{data.subtext || "CTA subtext"}</Typography>
          </Stack>
        </SectionShell>
      );
    case "TEAM_GRID":
      return (
        <SectionShell title="Team Grid" {...baseProps}>
          <Stack spacing={2}>
            <InlineText
              editMode={editMode}
              value={data.heading}
              variant="h5"
              onChange={(val) => update("heading", val)}
            />
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              {(data.members || []).map((member, idx) => (
                <Box key={`member-${idx}`} sx={{ p: 2, border: "1px solid #eee", borderRadius: 2 }}>
                  <Typography variant="subtitle1">{member.name}</Typography>
                  <Typography color="text.secondary">{member.role}</Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </SectionShell>
      );
    case "FAQ_ACCORDION":
      return (
        <SectionShell title="FAQ Accordion" {...baseProps}>
          <Stack spacing={2}>
            <InlineText
              editMode={editMode}
              value={data.heading}
              variant="h5"
              onChange={(val) => update("heading", val)}
            />
            {(data.items || []).slice(0, 2).map((item, idx) => (
              <Box key={`faq-${idx}`} sx={{ p: 2, border: "1px solid #eee", borderRadius: 2 }}>
                <Typography variant="subtitle1">{item.question}</Typography>
                <Typography color="text.secondary">{item.answer}</Typography>
              </Box>
            ))}
          </Stack>
        </SectionShell>
      );
    case "PROPERTY_GRID":
      return (
        <SectionShell title="Property Grid" {...baseProps}>
          <Stack spacing={2}>
            <InlineText
              editMode={editMode}
              value={data.heading}
              variant="h5"
              onChange={(val) => update("heading", val)}
            />
            <Typography color="text.secondary">{data.subtext}</Typography>
            <Divider />
            <Typography color="text.secondary">Property cards render on public site.</Typography>
          </Stack>
        </SectionShell>
      );
    case "GALLERY":
      return (
        <SectionShell title="Gallery" {...baseProps}>
          <Stack spacing={2}>
            <InlineText
              editMode={editMode}
              value={data.heading}
              variant="h5"
              onChange={(val) => update("heading", val)}
            />
            <Typography color="text.secondary">
              {data.category ? `Category: ${data.category}` : "Gallery category"}
            </Typography>
            <Stack direction="row" spacing={2}>
              {(data.images || []).slice(0, 3).map((image, idx) => (
                <Box
                  key={`gallery-${idx}`}
                  sx={{ width: 120, height: 80, borderRadius: 1, border: "1px solid #eee" }}
                />
              ))}
            </Stack>
          </Stack>
        </SectionShell>
      );
    case "DIVIDER":
    case "SPACER":
      return (
        <SectionShell title={section.type === "DIVIDER" ? "Divider" : "Spacer"} {...baseProps}>
          <Divider />
        </SectionShell>
      );
    case "DISCLOSURE":
      return (
        <SectionShell title="Disclosure" {...baseProps}>
          <Stack spacing={1}>
            <InlineText
              editMode={editMode}
              value={data.title}
              variant="h6"
              onChange={(val) => update("title", val)}
            />
            <Typography color="text.secondary">Disclosure content (edit in inspector).</Typography>
          </Stack>
        </SectionShell>
      );
    case "ICON_ACCORDION_GRID":
    case "ICON_CARD_GRID":
    case "TESTIMONIALS":
    case "SOCIALS":
    case "PORTFOLIO_CARD":
    case "GREATER_BOSTON_REASONS":
    case "PROPERTY_COLUMNS":
    case "PROFILE_CARDS":
    case "ADVISORY":
    case "CONTACT_FORM":
    case "FAQ_PAGE":
      return (
        <SectionShell title={section.type.replace(/_/g, " ").toLowerCase()} {...baseProps}>
          <Stack spacing={1}>
            <Typography variant="h6">{data.heading || "Section heading"}</Typography>
            <Typography color="text.secondary">Edit this section in the inspector.</Typography>
          </Stack>
        </SectionShell>
      );
    default:
      return (
        <SectionShell title={section.type} {...baseProps}>
          <Typography color="text.secondary">Unsupported section type.</Typography>
        </SectionShell>
      );
  }
}
