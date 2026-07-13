import React from "react";
import { Box, Chip, Divider, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InlineText from "./InlineText.jsx";

const SectionShell = ({ title, selected, onClick, children, dragProps, toolbar }) => (
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
      // Reveal the toolbar on hover (it is always shown when selected)
      "&:hover .section-toolbar": { opacity: 1 },
    }}
    {...dragProps}
  >
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={{ position: "absolute", top: 8, right: 12, zIndex: 2 }}
    >
      {toolbar ? (
        <Stack
          direction="row"
          spacing={0.5}
          className="section-toolbar"
          sx={{
            opacity: selected ? 1 : 0,
            transition: "opacity .15s",
            bgcolor: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: 1.5,
            mr: 0.5,
          }}
        >
          {toolbar}
        </Stack>
      ) : null}
      <Chip label={title} size="small" />
    </Stack>
    {children}
  </Box>
);

export default function SectionPreview({
  section,
  selected,
  editMode,
  onSelect,
  onUpdate,
  dragProps,
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp = false,
  canMoveDown = false,
}) {
  const data = section.data || {};
  const update = (key, value) => onUpdate({ ...section, data: { ...data, [key]: value } });

  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn?.();
  };

  const toolbar = (
    <>
      <Tooltip title="Move up">
        <span>
          <IconButton size="small" disabled={!canMoveUp} onClick={stop(onMoveUp)}>
            <ArrowUpwardIcon fontSize="inherit" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Move down">
        <span>
          <IconButton size="small" disabled={!canMoveDown} onClick={stop(onMoveDown)}>
            <ArrowDownwardIcon fontSize="inherit" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Remove section">
        <IconButton size="small" color="error" onClick={stop(onRemove)}>
          <DeleteOutlineIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </>
  );

  const baseProps = {
    selected,
    onClick: onSelect,
    dragProps,
    toolbar,
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
    case "SIMPLE_CONTENT":
      return (
        <SectionShell title="Title + Content" {...baseProps}>
          <Stack spacing={1.5}>
            <InlineText
              editMode={editMode}
              value={data.title}
              variant="h5"
              onChange={(val) => update("title", val)}
            />
            {data.subtitle ? <Typography color="text.secondary">{data.subtitle}</Typography> : null}
            <Typography color="text.secondary">
              {data.bodyHtml ? "Content added" : "Add content in the inspector"}
            </Typography>
          </Stack>
        </SectionShell>
      );
    case "TITLE_IMAGE":
      return (
        <SectionShell title="Title + Image" {...baseProps}>
          <Stack spacing={2}>
            <InlineText
              editMode={editMode}
              value={data.title}
              variant="h5"
              onChange={(val) => update("title", val)}
            />
            <Box
              sx={{
                width: "100%",
                aspectRatio: "16 / 7",
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
    case "NEWSLETTER":
      return (
        <SectionShell title="Newsletter" {...baseProps}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <InlineText
              editMode={editMode}
              value={data.title}
              variant="h5"
              onChange={(val) => update("title", val)}
            />
            <Typography color="text.secondary">{data.subtitle || "Newsletter blurb"}</Typography>
            <Box sx={{ px: 4, py: 1.2, borderRadius: 2, backgroundColor: "#374151", color: "#fff" }}>
              {data.buttonLabel || "Subscribe"}
            </Box>
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
      return (
        <SectionShell title={section.type.replace(/_/g, " ").toLowerCase()} {...baseProps}>
          <Stack spacing={1}>
            <Typography variant="h6">{data.heading || data.title || "Section heading"}</Typography>
            <Typography color="text.secondary">Edit this section in the inspector.</Typography>
          </Stack>
        </SectionShell>
      );
    case "FOUNDER_INTERVIEW_DROPDOWN":
      return (
        <SectionShell title="founder interview dropdown" {...baseProps}>
          <Stack spacing={1.5}>
            <Typography variant="h6">{data.title || "Hear the Founder's Story"}</Typography>
            <Typography color="text.secondary">
              {(data.snippets || []).length} snippet{(data.snippets || []).length === 1 ? "" : "s"} configured
            </Typography>
            <Box
              sx={{
                border: "1px solid #eee",
                borderRadius: 3,
                p: 2,
                backgroundColor: "#f8f8f8",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Dropdown + single audio player render on the public site.
              </Typography>
            </Box>
          </Stack>
        </SectionShell>
      );
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
