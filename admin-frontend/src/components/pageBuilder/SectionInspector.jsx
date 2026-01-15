import React from "react";
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ArrayEditor from "./ArrayEditor.jsx";
import ImagePicker from "./ImagePicker.jsx";
import { setValueAtPath } from "./utils.js";

const rowGap = 2;

export default function SectionInspector({ section, onChange, onRemove }) {
  if (!section) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle1">Select a section</Typography>
        <Typography variant="body2" color="text.secondary">
          Click a section in the canvas to edit its content.
        </Typography>
      </Box>
    );
  }

  const data = section.data || {};
  const update = (path, value) => {
    const nextData = setValueAtPath(data, path, value);
    onChange({ ...section, data: nextData });
  };

  const updateArray = (key, nextItems) => {
    onChange({ ...section, data: { ...data, [key]: nextItems } });
  };

  return (
    <Stack spacing={rowGap} sx={{ p: 3 }}>
      <Stack spacing={1}>
        <Typography variant="overline">Section</Typography>
        <Typography variant="h6">{section.type.replace(/_/g, " ")}</Typography>
      </Stack>

      <Divider />

      {section.type === "HERO" ? (
        <Stack spacing={rowGap}>
          <TextField label="Title" value={data.title || ""} onChange={(e) => update("title", e.target.value)} />
          <TextField
            label="Subtitle"
            value={data.subtitle || ""}
            onChange={(e) => update("subtitle", e.target.value)}
          />
          <TextField
            label="Badge Text"
            value={data.badgeText || ""}
            onChange={(e) => update("badgeText", e.target.value)}
          />
          <ImagePicker label="Background Image" value={data.backgroundImage} onChange={(val) => update("backgroundImage", val)} />
          <TextField
            label="Overlay Opacity"
            type="number"
            value={data.overlayOpacity ?? 0.35}
            onChange={(e) => update("overlayOpacity", Number(e.target.value))}
          />
          <TextField
            label="Primary Button Label"
            value={data.primaryButton?.label || ""}
            onChange={(e) => update("primaryButton.label", e.target.value)}
          />
          <TextField
            label="Primary Button Href"
            value={data.primaryButton?.href || ""}
            onChange={(e) => update("primaryButton.href", e.target.value)}
          />
          <TextField
            label="Secondary Button Label"
            value={data.secondaryButton?.label || ""}
            onChange={(e) => update("secondaryButton.label", e.target.value)}
          />
          <TextField
            label="Secondary Button Href"
            value={data.secondaryButton?.href || ""}
            onChange={(e) => update("secondaryButton.href", e.target.value)}
          />
        </Stack>
      ) : null}

      {section.type === "RICH_TEXT" ? (
        <Stack spacing={rowGap}>
          <TextField label="Heading" value={data.heading || ""} onChange={(e) => update("heading", e.target.value)} />
          <Typography variant="subtitle2">Body</Typography>
          <ReactQuill
            theme="snow"
            value={data.bodyHtml || ""}
            onChange={(value) => update("bodyHtml", value)}
          />
        </Stack>
      ) : null}

      {section.type === "IMAGE_BANNER" ? (
        <Stack spacing={rowGap}>
          <ImagePicker label="Image" value={data.image} onChange={(val) => update("image", val)} />
          <TextField label="Caption" value={data.caption || ""} onChange={(e) => update("caption", e.target.value)} />
          <TextField
            label="Alignment"
            select
            value={data.alignment || "center"}
            onChange={(e) => update("alignment", e.target.value)}
          >
            <MenuItem value="left">Left</MenuItem>
            <MenuItem value="center">Center</MenuItem>
            <MenuItem value="right">Right</MenuItem>
          </TextField>
        </Stack>
      ) : null}

      {section.type === "STATS" ? (
        <Stack spacing={rowGap}>
          <TextField label="Heading" value={data.heading || ""} onChange={(e) => update("heading", e.target.value)} />
          <ArrayEditor
            label="Stat"
            items={data.items || []}
            fields={[
              { name: "label", label: "Label" },
              { name: "value", label: "Value" },
              { name: "iconName", label: "Icon Name" },
            ]}
            onChange={(items) => updateArray("items", items)}
            onAdd={() =>
              updateArray("items", [...(data.items || []), { label: "", value: "", iconName: "" }])
            }
          />
        </Stack>
      ) : null}

      {section.type === "CTA" ? (
        <Stack spacing={rowGap}>
          <TextField label="Headline" value={data.headline || ""} onChange={(e) => update("headline", e.target.value)} />
          <TextField label="Subtext" value={data.subtext || ""} onChange={(e) => update("subtext", e.target.value)} />
          <ArrayEditor
            label="Button"
            items={data.buttons || []}
            fields={[
              { name: "label", label: "Label" },
              { name: "href", label: "Href" },
            ]}
            onChange={(items) => updateArray("buttons", items)}
            onAdd={() => updateArray("buttons", [...(data.buttons || []), { label: "", href: "" }])}
          />
        </Stack>
      ) : null}

      {section.type === "TEAM_GRID" ? (
        <Stack spacing={rowGap}>
          <TextField label="Heading" value={data.heading || ""} onChange={(e) => update("heading", e.target.value)} />
          <ArrayEditor
            label="Team Member"
            items={data.members || []}
            fields={[
              { name: "name", label: "Name" },
              { name: "role", label: "Role" },
              { name: "bio", label: "Bio", multiline: true },
              { name: "photo", label: "Photo URL" },
            ]}
            onChange={(items) => updateArray("members", items)}
            onAdd={() =>
              updateArray("members", [...(data.members || []), { name: "", role: "", bio: "", photo: "" }])
            }
          />
        </Stack>
      ) : null}

      {section.type === "FAQ_ACCORDION" || section.type === "FAQ_PAGE" ? (
        <Stack spacing={rowGap}>
          {section.type === "FAQ_PAGE" ? (
            <>
              <TextField
                label="Hero Title"
                value={data.heroTitle || ""}
                onChange={(e) => update("heroTitle", e.target.value)}
              />
              <TextField
                label="Hero Subtitle"
                value={data.heroSubtitle || ""}
                onChange={(e) => update("heroSubtitle", e.target.value)}
              />
              <ImagePicker label="Hero Image" value={data.heroImage} onChange={(val) => update("heroImage", val)} />
              <ArrayEditor
                label="Category"
                items={data.categories || []}
                fields={[
                  { name: "key", label: "Key" },
                  { name: "title", label: "Title" },
                  { name: "iconName", label: "Icon Name" },
                ]}
                onChange={(items) => updateArray("categories", items)}
                onAdd={() =>
                  updateArray("categories", [
                    ...(data.categories || []),
                    { key: "", title: "", iconName: "" },
                  ])
                }
              />
            </>
          ) : (
            <>
              <TextField
                label="Heading"
                value={data.heading || ""}
                onChange={(e) => update("heading", e.target.value)}
              />
              <ArrayEditor
                label="FAQ"
                items={data.items || []}
                fields={[
                  { name: "question", label: "Question" },
                  { name: "answer", label: "Answer", multiline: true },
                ]}
                onChange={(items) => updateArray("items", items)}
                onAdd={() => updateArray("items", [...(data.items || []), { question: "", answer: "" }])}
              />
            </>
          )}
        </Stack>
      ) : null}

      {section.type === "PROPERTY_GRID" ? (
        <Stack spacing={rowGap}>
          <TextField label="Heading" value={data.heading || ""} onChange={(e) => update("heading", e.target.value)} />
          <TextField label="Subtext" value={data.subtext || ""} onChange={(e) => update("subtext", e.target.value)} />
          <TextField
            label="Show Featured Only"
            select
            value={data.showFeaturedOnly ? "yes" : "no"}
            onChange={(e) => update("showFeaturedOnly", e.target.value === "yes")}
          >
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </TextField>
        </Stack>
      ) : null}

      {section.type === "GALLERY" ? (
        <Stack spacing={rowGap}>
          <TextField label="Heading" value={data.heading || ""} onChange={(e) => update("heading", e.target.value)} />
          <TextField
            label="Category"
            select
            value={data.category || "before"}
            onChange={(e) => update("category", e.target.value)}
          >
            <MenuItem value="before">Before</MenuItem>
            <MenuItem value="during">During</MenuItem>
            <MenuItem value="after">After</MenuItem>
          </TextField>
          <ArrayEditor
            label="Image"
            items={data.images || []}
            fields={[
              { name: "url", label: "URL" },
              { name: "caption", label: "Caption" },
              { name: "alt", label: "Alt text" },
              { name: "order", label: "Order" },
            ]}
            onChange={(items) => updateArray("images", items)}
            onAdd={() =>
              updateArray("images", [...(data.images || []), { url: "", caption: "", alt: "", order: 1 }])
            }
          />
        </Stack>
      ) : null}

      {section.type === "DIVIDER" || section.type === "SPACER" ? (
        <Stack spacing={rowGap}>
          <TextField
            label="Size"
            type="number"
            value={data.size ?? 48}
            onChange={(e) => update("size", Number(e.target.value))}
          />
        </Stack>
      ) : null}

      {section.type === "DISCLOSURE" ? (
        <Stack spacing={rowGap}>
          <TextField label="Title" value={data.title || ""} onChange={(e) => update("title", e.target.value)} />
          <Typography variant="subtitle2">Body</Typography>
          <ReactQuill
            theme="snow"
            value={data.bodyHtml || data.body || ""}
            onChange={(value) => update("bodyHtml", value)}
          />
          <TextField
            label="Variant"
            select
            value={data.variant || "default"}
            onChange={(e) => update("variant", e.target.value)}
          >
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="simple">Simple</MenuItem>
          </TextField>
        </Stack>
      ) : null}

      {section.type === "ICON_ACCORDION_GRID" ? (
        <Stack spacing={rowGap}>
          <TextField label="Title" value={data.title || ""} onChange={(e) => update("title", e.target.value)} />
          <TextField label="Subtitle" value={data.subtitle || ""} onChange={(e) => update("subtitle", e.target.value)} />
          <TextField
            label="Background"
            select
            value={data.background || "none"}
            onChange={(e) => update("background", e.target.value === "none" ? undefined : e.target.value)}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="gray">Gray</MenuItem>
          </TextField>
          <TextField label="CTA Label" value={data.ctaLabel || ""} onChange={(e) => update("ctaLabel", e.target.value)} />
          <TextField label="CTA Href" value={data.ctaHref || ""} onChange={(e) => update("ctaHref", e.target.value)} />
          <ArrayEditor
            label="Item"
            items={data.items || []}
            fields={[
              { name: "id", label: "Id" },
              { name: "title", label: "Title" },
              { name: "content", label: "Body", multiline: true },
              { name: "iconName", label: "Icon Name" },
            ]}
            onChange={(items) => updateArray("items", items)}
            onAdd={() =>
              updateArray("items", [...(data.items || []), { id: "", title: "", content: "", iconName: "" }])
            }
          />
        </Stack>
      ) : null}

      {section.type === "ICON_CARD_GRID" ? (
        <Stack spacing={rowGap}>
          <TextField label="Title" value={data.title || ""} onChange={(e) => update("title", e.target.value)} />
          <TextField label="Subtitle" value={data.subtitle || ""} onChange={(e) => update("subtitle", e.target.value)} />
          <TextField
            label="Background"
            select
            value={data.background || "none"}
            onChange={(e) => update("background", e.target.value === "none" ? undefined : e.target.value)}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="gray">Gray</MenuItem>
          </TextField>
          <ArrayEditor
            label="Card"
            items={data.items || []}
            fields={[
              { name: "title", label: "Title" },
              { name: "iconName", label: "Icon Name" },
            ]}
            onChange={(items) => updateArray("items", items)}
            onAdd={() => updateArray("items", [...(data.items || []), { title: "", iconName: "" }])}
          />
        </Stack>
      ) : null}

      {section.type === "TESTIMONIALS" ? (
        <Stack spacing={rowGap}>
          <TextField label="Title" value={data.title || ""} onChange={(e) => update("title", e.target.value)} />
          <TextField label="Subtitle" value={data.subtitle || ""} onChange={(e) => update("subtitle", e.target.value)} />
          <ArrayEditor
            label="Testimonial"
            items={data.items || []}
            fields={[
              { name: "quote", label: "Quote", multiline: true },
              { name: "attribution", label: "Attribution" },
              { name: "label", label: "Label" },
            ]}
            onChange={(items) => updateArray("items", items)}
            onAdd={() =>
              updateArray("items", [...(data.items || []), { quote: "", attribution: "", label: "" }])
            }
          />
        </Stack>
      ) : null}

      {section.type === "SOCIALS" ? (
        <Stack spacing={rowGap}>
          <TextField label="Title" value={data.title || ""} onChange={(e) => update("title", e.target.value)} />
          <ArrayEditor
            label="Link"
            items={data.links || []}
            fields={[
              { name: "label", label: "Label" },
              { name: "url", label: "URL" },
            ]}
            onChange={(items) => updateArray("links", items)}
            onAdd={() => updateArray("links", [...(data.links || []), { label: "", url: "" }])}
          />
        </Stack>
      ) : null}

      {section.type === "PORTFOLIO_CARD" ? (
        <Stack spacing={rowGap}>
          <TextField label="Title" value={data.title || ""} onChange={(e) => update("title", e.target.value)} />
          <TextField label="Subtitle" value={data.subtitle || ""} onChange={(e) => update("subtitle", e.target.value)} />
          <TextField label="CTA Label" value={data.ctaLabel || ""} onChange={(e) => update("ctaLabel", e.target.value)} />
          <TextField label="CTA Href" value={data.ctaHref || ""} onChange={(e) => update("ctaHref", e.target.value)} />
          <TextField label="Footnote" value={data.footnote || ""} onChange={(e) => update("footnote", e.target.value)} />
          <ArrayEditor
            label="Stat"
            items={data.stats || []}
            fields={[
              { name: "label", label: "Label" },
              { name: "value", label: "Value" },
            ]}
            onChange={(items) => updateArray("stats", items)}
            onAdd={() => updateArray("stats", [...(data.stats || []), { label: "", value: "" }])}
          />
        </Stack>
      ) : null}

      {section.type === "GREATER_BOSTON_REASONS" ? (
        <Stack spacing={rowGap}>
          <TextField label="Title" value={data.title || ""} onChange={(e) => update("title", e.target.value)} />
          <TextField label="Subtitle" value={data.subtitle || ""} onChange={(e) => update("subtitle", e.target.value)} />
          <ImagePicker label="Image" value={data.imageUrl} onChange={(val) => update("imageUrl", val)} />
          <TextField label="Image Alt" value={data.imageAlt || ""} onChange={(e) => update("imageAlt", e.target.value)} />
          <ArrayEditor
            label="Reason"
            items={(data.reasons || []).map((reason) => ({ text: reason }))}
            fields={[{ name: "text", label: "Text", multiline: true }]}
            onChange={(items) => update("reasons", items.map((item) => item.text).filter(Boolean))}
            onAdd={() => update("reasons", [...(data.reasons || []), ""])}
          />
        </Stack>
      ) : null}

      {section.type === "PROPERTY_COLUMNS" ? (
        <Stack spacing={rowGap}>
          <TextField label="Title" value={data.title || ""} onChange={(e) => update("title", e.target.value)} />
          <TextField label="Subtitle" value={data.subtitle || ""} onChange={(e) => update("subtitle", e.target.value)} />
          <ArrayEditor
            label="Column"
            items={(data.columns || []).map((label) => ({ label }))}
            fields={[{ name: "label", label: "Label" }]}
            onChange={(items) => update("columns", items.map((item) => item.label).filter(Boolean))}
            onAdd={() => update("columns", [...(data.columns || []), ""])}
          />
          <ArrayEditor
            label="Mapping"
            items={Object.entries(data.mapping || {}).map(([column, entry]) => ({
              column,
              slug: typeof entry === "string" ? entry : entry?.slug,
              image: typeof entry === "object" ? entry?.image : "",
            }))}
            fields={[
              { name: "column", label: "Column" },
              { name: "slug", label: "Property Slug" },
              { name: "image", label: "Image Override" },
            ]}
            onChange={(items) =>
              update(
                "mapping",
                items.reduce((acc, item) => {
                  if (!item.column) return acc;
                  acc[item.column] = item.image ? { slug: item.slug, image: item.image } : item.slug;
                  return acc;
                }, {})
              )
            }
            onAdd={() =>
              update(
                "mapping",
                Object.assign({}, data.mapping || {}, { "": { slug: "", image: "" } })
              )
            }
          />
        </Stack>
      ) : null}

      {section.type === "PROFILE_CARDS" ? (
        <Stack spacing={rowGap}>
          <TextField label="Title" value={data.title || ""} onChange={(e) => update("title", e.target.value)} />
          <TextField label="Subtitle" value={data.subtitle || ""} onChange={(e) => update("subtitle", e.target.value)} />
          <ArrayEditor
            label="Profile"
            items={(data.cards || []).map((card) => ({
              ...card,
              paragraphsText: (card.paragraphs || []).join("\n"),
            }))}
            fields={[
              { name: "name", label: "Name" },
              { name: "roleLine", label: "Role Line" },
              { name: "imageSrc", label: "Image URL" },
              { name: "embeddedAudioSrc", label: "Audio URL" },
              { name: "paragraphsText", label: "Paragraphs (one per line)", multiline: true },
            ]}
            onChange={(items) =>
              updateArray(
                "cards",
                items.map((item) => ({
                  ...item,
                  paragraphs: (item.paragraphsText || "")
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                }))
              )
            }
            onAdd={() =>
              updateArray("cards", [
                ...(data.cards || []),
                { name: "", roleLine: "", imageSrc: "", embeddedAudioSrc: "", paragraphs: [] },
              ])
            }
          />
        </Stack>
      ) : null}

      {section.type === "ADVISORY" ? (
        <Stack spacing={rowGap}>
          <TextField label="Title" value={data.title || ""} onChange={(e) => update("title", e.target.value)} />
          <TextField label="Subtitle" value={data.subtitle || ""} onChange={(e) => update("subtitle", e.target.value)} />
          <ImagePicker label="Image" value={data.image} onChange={(val) => update("image", val)} />
          <TextField label="Image Alt" value={data.imageAlt || ""} onChange={(e) => update("imageAlt", e.target.value)} />
          <TextField label="Heading" value={data.heading || ""} onChange={(e) => update("heading", e.target.value)} />
          <TextField label="Subheading" value={data.subheading || ""} onChange={(e) => update("subheading", e.target.value)} />
          <TextField
            label="Body"
            value={data.body || ""}
            onChange={(e) => update("body", e.target.value)}
            multiline
            minRows={4}
          />
        </Stack>
      ) : null}

      {section.type === "CONTACT_FORM" ? (
        <Stack spacing={rowGap}>
          <TextField label="Title" value={data.title || ""} onChange={(e) => update("title", e.target.value)} />
          <ImagePicker label="Image" value={data.image} onChange={(val) => update("image", val)} />
          <TextField label="Image Alt" value={data.imageAlt || ""} onChange={(e) => update("imageAlt", e.target.value)} />
        </Stack>
      ) : null}

      <Divider />
      <Button color="error" variant="outlined" onClick={onRemove}>
        Remove Section
      </Button>
    </Stack>
  );
}
