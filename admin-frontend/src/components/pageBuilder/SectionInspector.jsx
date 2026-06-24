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
import AudioPicker from "./AudioPicker.jsx";
import { setValueAtPath } from "./utils.js";

const rowGap = 2;
const createPropertyColumnId = () => `property-column-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const createPropertyColumnPropertyId = () => `property-link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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
  const interviewSnippets = data.snippets || [];
  const updateInterviewSnippet = (index, patch) =>
    updateArray(
      "snippets",
      interviewSnippets.map((snippet, idx) => (idx === index ? { ...snippet, ...patch } : snippet))
    );
  const addInterviewSnippet = () =>
    updateArray("snippets", [
      ...interviewSnippets,
      {
        label: "",
        description: "",
        audioSrc: "",
        startTime: "",
        endTime: "",
        buttonLabel: "",
      },
    ]);
  const removeInterviewSnippet = (index) =>
    updateArray(
      "snippets",
      interviewSnippets.filter((_, idx) => idx !== index)
    );
  const profileCards = data.cards || [];
  const updateProfileCard = (index, patch) =>
    updateArray(
      "cards",
      profileCards.map((card, idx) => (idx === index ? { ...card, ...patch } : card))
    );
  const addProfileCard = () =>
    updateArray("cards", [
      ...profileCards,
      {
        name: "",
        roleLine: "",
        imageSrc: "",
        embeddedAudioSrc: "",
        interviewEyebrow: "Founder Interview",
        interviewTitle: "Hear the Founder's Story",
        interviewSubtitle: "",
        interviewSelectLabel: "Choose A Segment",
        paragraphs: [],
        interviewSnippets: [],
      },
    ]);
  const removeProfileCard = (index) =>
    updateArray(
      "cards",
      profileCards.filter((_, idx) => idx !== index)
    );
  const updateProfileCardSnippets = (cardIndex, nextSnippets) =>
    updateProfileCard(cardIndex, { interviewSnippets: nextSnippets });
  const updateProfileCardSnippet = (cardIndex, snippetIndex, patch) =>
    updateProfileCardSnippets(
      cardIndex,
      (profileCards[cardIndex]?.interviewSnippets || []).map((snippet, idx) =>
        idx === snippetIndex ? { ...snippet, ...patch } : snippet
      )
    );
  const addProfileCardSnippet = (cardIndex) =>
    updateProfileCardSnippets(cardIndex, [
      ...(profileCards[cardIndex]?.interviewSnippets || []),
      {
        label: "",
        description: "",
        audioSrc: "",
        startTime: "",
        endTime: "",
        buttonLabel: "",
      },
    ]);
  const removeProfileCardSnippet = (cardIndex, snippetIndex) =>
    updateProfileCardSnippets(
      cardIndex,
      (profileCards[cardIndex]?.interviewSnippets || []).filter((_, idx) => idx !== snippetIndex)
    );

  const legacyPropertyMappings = Object.entries(data.mapping || {});
  const propertyColumnItems =
    Array.isArray(data.items) && data.items.length
      ? data.items.map((item, index) => ({
          id: item?.id || `property-column-${index + 1}`,
          label: item?.label || "",
          properties:
            Array.isArray(item?.properties) && item.properties.length
              ? item.properties.map((property, propertyIndex) => ({
                  id: property?.id || `property-link-${index + 1}-${propertyIndex + 1}`,
                  slug: property?.slug || "",
                  image: property?.image || "",
                }))
              : [
                  {
                    id: `property-link-${index + 1}-1`,
                    slug: item?.slug || "",
                    image: item?.image || "",
                  },
                ].filter((property) => property.slug || property.image),
        }))
      : (data.columns || []).map((column, index) => {
          const entry = (data.mapping || {})[column] ?? legacyPropertyMappings[index]?.[1];
          const propertyEntries = Array.isArray(entry)
            ? entry
            : entry
              ? [entry]
              : [];
          return {
            id: `property-column-${index + 1}`,
            label: column || "",
            properties: propertyEntries
              .map((property, propertyIndex) => ({
                id: `property-link-${index + 1}-${propertyIndex + 1}`,
                slug: typeof property === "string" ? property : property?.slug || "",
                image: typeof property === "object" ? property?.image || "" : "",
              }))
              .filter((property) => property.slug || property.image),
          };
        });

  const updatePropertyColumnItems = (items) => {
    const normalizedItems = items.map((item, index) => ({
      id: item?.id || `property-column-${index + 1}`,
      label: item?.label || "",
      properties: (item?.properties || []).map((property, propertyIndex) => ({
        id: property?.id || `property-link-${index + 1}-${propertyIndex + 1}`,
        slug: property?.slug || "",
        image: property?.image || "",
      })),
    }));
    onChange({
      ...section,
      data: {
        ...data,
        items: normalizedItems,
        columns: normalizedItems.map((item) => item.label).filter(Boolean),
        mapping: normalizedItems.reduce((acc, item) => {
          if (!item.label) return acc;
          const filledProperties = item.properties.filter((property) => property.slug || property.image);
          if (filledProperties.length > 1) {
            acc[item.label] = filledProperties.map((property) =>
              property.image ? { slug: property.slug, image: property.image } : property.slug
            );
            return acc;
          }
          const firstProperty = filledProperties[0];
          if (!firstProperty) return acc;
          acc[item.label] = firstProperty.image ? { slug: firstProperty.slug, image: firstProperty.image } : firstProperty.slug;
          return acc;
        }, {}),
      },
    });
  };

  const setPropertyColumnItem = (index, patch) => {
    const next = propertyColumnItems.map((item, idx) => (idx === index ? { ...item, ...patch } : item));
    updatePropertyColumnItems(next);
  };

  const addPropertyColumnItem = () =>
    updatePropertyColumnItems([
      ...propertyColumnItems,
      { id: createPropertyColumnId(), label: "", properties: [] },
    ]);

  const removePropertyColumnItem = (index) => {
    const next = propertyColumnItems.filter((_, idx) => idx !== index);
    updatePropertyColumnItems(next);
  };

  const setPropertyColumnProperty = (itemIndex, propertyIndex, patch) => {
    const next = propertyColumnItems.map((item, idx) => {
      if (idx !== itemIndex) return item;
      return {
        ...item,
        properties: (item.properties || []).map((property, currentPropertyIndex) =>
          currentPropertyIndex === propertyIndex ? { ...property, ...patch } : property
        ),
      };
    });
    updatePropertyColumnItems(next);
  };

  const addPropertyColumnProperty = (itemIndex) => {
    const next = propertyColumnItems.map((item, idx) => {
      if (idx !== itemIndex) return item;
      return {
        ...item,
        properties: [...(item.properties || []), { id: createPropertyColumnPropertyId(), slug: "", image: "" }],
      };
    });
    updatePropertyColumnItems(next);
  };

  const removePropertyColumnProperty = (itemIndex, propertyIndex) => {
    const next = propertyColumnItems.map((item, idx) => {
      if (idx !== itemIndex) return item;
      return {
        ...item,
        properties: (item.properties || []).filter((_, currentPropertyIndex) => currentPropertyIndex !== propertyIndex),
      };
    });
    updatePropertyColumnItems(next);
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

      {section.type === "SIMPLE_CONTENT" ? (
        <Stack spacing={rowGap}>
          <TextField label="Title" value={data.title || ""} onChange={(e) => update("title", e.target.value)} />
          <TextField
            label="Subtitle"
            value={data.subtitle || ""}
            onChange={(e) => update("subtitle", e.target.value)}
            helperText="Optional"
          />
          <Typography variant="subtitle2">Content</Typography>
          <ReactQuill
            theme="snow"
            value={data.bodyHtml || ""}
            onChange={(value) => update("bodyHtml", value)}
          />
        </Stack>
      ) : null}

      {section.type === "TITLE_IMAGE" ? (
        <Stack spacing={rowGap}>
          <TextField label="Title" value={data.title || ""} onChange={(e) => update("title", e.target.value)} />
          <ImagePicker label="Image" value={data.image} onChange={(val) => update("image", val)} />
          <TextField
            label="Image Alt Text"
            value={data.imageAlt || ""}
            onChange={(e) => update("imageAlt", e.target.value)}
            helperText="Describes the image for accessibility and SEO (optional)"
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
          <TextField
            label="Show Icons"
            select
            value={data.showIcons === false ? "hide" : "show"}
            onChange={(e) => update("showIcons", e.target.value === "show")}
          >
            <MenuItem value="show">Show</MenuItem>
            <MenuItem value="hide">Hide</MenuItem>
          </TextField>
          <TextField
            label="Content Alignment"
            select
            value={data.contentAlign || "left"}
            onChange={(e) => update("contentAlign", e.target.value)}
          >
            <MenuItem value="left">Left</MenuItem>
            <MenuItem value="center">Center</MenuItem>
            <MenuItem value="right">Right</MenuItem>
          </TextField>
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
          <TextField
            label="Show Icons"
            select
            value={data.showIcons === false ? "hide" : "show"}
            onChange={(e) => update("showIcons", e.target.value === "show")}
          >
            <MenuItem value="show">Show</MenuItem>
            <MenuItem value="hide">Hide</MenuItem>
          </TextField>
          <TextField
            label="Content Alignment"
            select
            value={data.contentAlign || "left"}
            onChange={(e) => update("contentAlign", e.target.value)}
          >
            <MenuItem value="left">Left</MenuItem>
            <MenuItem value="center">Center</MenuItem>
            <MenuItem value="right">Right</MenuItem>
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
          <TextField
            label="Disclosure"
            value={data.disclosure || ""}
            onChange={(e) => update("disclosure", e.target.value)}
            multiline
            minRows={4}
          />
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
          <TextField
            label="Auto-scroll"
            select
            value={data.autoScroll ? "enabled" : "disabled"}
            onChange={(e) => update("autoScroll", e.target.value === "enabled")}
          >
            <MenuItem value="disabled">Off</MenuItem>
            <MenuItem value="enabled">On</MenuItem>
          </TextField>
          <Typography variant="body2" color="text.secondary">
            When enabled, the carousel automatically advances every five seconds.
          </Typography>
          <Stack spacing={2}>
            <Typography variant="subtitle2">Property Cards</Typography>
            <Stack spacing={2}>
              {propertyColumnItems.map((item, index) => (
                <Box key={item.id || `property-column-${index}`} sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">Property Card {index + 1}</Typography>
                      <Button color="error" size="small" onClick={() => removePropertyColumnItem(index)}>
                        Remove
                      </Button>
                    </Stack>
                    <TextField
                      label="Card Title"
                      value={item.label || ""}
                      onChange={(e) => setPropertyColumnItem(index, { label: e.target.value })}
                    />
                    <Stack spacing={1.5}>
                      <Typography variant="body2" color="text.secondary">
                        Linked Properties In This Category
                      </Typography>
                      {(item.properties || []).map((property, propertyIndex) => (
                        <Box
                          key={property.id || `property-link-${index}-${propertyIndex}`}
                          sx={{ p: 1.5, border: "1px solid #ededed", borderRadius: 2, backgroundColor: "#fafafa" }}
                        >
                          <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2">Property {propertyIndex + 1}</Typography>
                              <Button
                                color="error"
                                size="small"
                                onClick={() => removePropertyColumnProperty(index, propertyIndex)}
                              >
                                Remove
                              </Button>
                            </Stack>
                            <TextField
                              label="Property Slug"
                              value={property.slug || ""}
                              onChange={(e) =>
                                setPropertyColumnProperty(index, propertyIndex, { slug: e.target.value })
                              }
                            />
                            <ImagePicker
                              label="Image Override"
                              value={property.image || ""}
                              onChange={(val) => setPropertyColumnProperty(index, propertyIndex, { image: val })}
                            />
                          </Stack>
                        </Box>
                      ))}
                      <Button variant="outlined" onClick={() => addPropertyColumnProperty(index)}>
                        Add Property To Category
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
            <Button variant="outlined" onClick={addPropertyColumnItem}>
              Add Property Card
            </Button>
          </Stack>
        </Stack>
      ) : null}

      {section.type === "PROFILE_CARDS" ? (
        <Stack spacing={rowGap}>
          <TextField label="Title" value={data.title || ""} onChange={(e) => update("title", e.target.value)} />
          <TextField label="Subtitle" value={data.subtitle || ""} onChange={(e) => update("subtitle", e.target.value)} />
          <Stack spacing={2}>
            <Typography variant="subtitle2">Profiles</Typography>
            {profileCards.map((card, index) => (
              <Box key={`profile-card-${index}`} sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">Profile {index + 1}</Typography>
                    <Button color="error" size="small" onClick={() => removeProfileCard(index)}>
                      Remove
                    </Button>
                  </Stack>
                  <TextField
                    label="Name"
                    value={card.name || ""}
                    onChange={(e) => updateProfileCard(index, { name: e.target.value })}
                  />
                  <TextField
                    label="Role Line"
                    value={card.roleLine || ""}
                    onChange={(e) => updateProfileCard(index, { roleLine: e.target.value })}
                  />
                  <ImagePicker
                    label="Image URL"
                    value={card.imageSrc || ""}
                    onChange={(val) => updateProfileCard(index, { imageSrc: val })}
                  />
                  <TextField
                    label="Paragraphs (one per line)"
                    value={(card.paragraphs || []).join("\n")}
                    onChange={(e) =>
                      updateProfileCard(index, {
                        paragraphs: e.target.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean),
                      })
                    }
                    multiline
                    minRows={4}
                  />
                  <AudioPicker
                    label="Default Interview Audio"
                    value={card.embeddedAudioSrc || ""}
                    onChange={(val) => updateProfileCard(index, { embeddedAudioSrc: val })}
                    buttonLabel="Upload Interview Audio"
                  />
                  <TextField
                    label="Interview Eyebrow"
                    value={card.interviewEyebrow || ""}
                    onChange={(e) => updateProfileCard(index, { interviewEyebrow: e.target.value })}
                  />
                  <TextField
                    label="Interview Title"
                    value={card.interviewTitle || ""}
                    onChange={(e) => updateProfileCard(index, { interviewTitle: e.target.value })}
                  />
                  <TextField
                    label="Interview Subtitle"
                    value={card.interviewSubtitle || ""}
                    onChange={(e) => updateProfileCard(index, { interviewSubtitle: e.target.value })}
                    multiline
                    minRows={2}
                  />
                  <TextField
                    label="Segment Picker Label"
                    value={card.interviewSelectLabel || ""}
                    onChange={(e) => updateProfileCard(index, { interviewSelectLabel: e.target.value })}
                  />
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">Interview Snippets</Typography>
                    {(card.interviewSnippets || []).map((snippet, snippetIndex) => (
                      <Box
                        key={`profile-card-${index}-snippet-${snippetIndex}`}
                        sx={{ p: 2, border: "1px solid #ededed", borderRadius: 2, backgroundColor: "#fafafa" }}
                      >
                        <Stack spacing={1.5}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2">Snippet {snippetIndex + 1}</Typography>
                            <Button
                              color="error"
                              size="small"
                              onClick={() => removeProfileCardSnippet(index, snippetIndex)}
                            >
                              Remove
                            </Button>
                          </Stack>
                          <TextField
                            label="Label / Title"
                            value={snippet.label || ""}
                            onChange={(e) =>
                              updateProfileCardSnippet(index, snippetIndex, { label: e.target.value })
                            }
                          />
                          <TextField
                            label="Short Description"
                            value={snippet.description || ""}
                            onChange={(e) =>
                              updateProfileCardSnippet(index, snippetIndex, { description: e.target.value })
                            }
                            multiline
                            minRows={3}
                          />
                          <AudioPicker
                            label="Audio URL Override"
                            value={snippet.audioSrc || ""}
                            onChange={(val) => updateProfileCardSnippet(index, snippetIndex, { audioSrc: val })}
                            buttonLabel="Upload Snippet Audio"
                          />
                          <TextField
                            label="Start Time (seconds)"
                            type="number"
                            value={snippet.startTime ?? ""}
                            onChange={(e) =>
                              updateProfileCardSnippet(index, snippetIndex, { startTime: e.target.value })
                            }
                            inputProps={{ min: 0, step: "0.1" }}
                          />
                          <TextField
                            label="End Time (seconds)"
                            type="number"
                            value={snippet.endTime ?? ""}
                            onChange={(e) =>
                              updateProfileCardSnippet(index, snippetIndex, { endTime: e.target.value })
                            }
                            inputProps={{ min: 0, step: "0.1" }}
                          />
                          <TextField
                            label="Optional Button Label"
                            value={snippet.buttonLabel || ""}
                            onChange={(e) =>
                              updateProfileCardSnippet(index, snippetIndex, { buttonLabel: e.target.value })
                            }
                          />
                        </Stack>
                      </Box>
                    ))}
                    <Button variant="outlined" onClick={() => addProfileCardSnippet(index)}>
                      Add Snippet
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))}
            <Button variant="outlined" onClick={addProfileCard}>
              Add Profile
            </Button>
          </Stack>
        </Stack>
      ) : null}

      {section.type === "FOUNDER_INTERVIEW_DROPDOWN" ? (
        <Stack spacing={rowGap}>
          <TextField label="Title" value={data.title || ""} onChange={(e) => update("title", e.target.value)} />
          <TextField
            label="Subtitle / Helper Text"
            value={data.subtitle || ""}
            onChange={(e) => update("subtitle", e.target.value)}
          />
          <TextField
            label="Intro Text"
            value={data.introText || ""}
            onChange={(e) => update("introText", e.target.value)}
            multiline
            minRows={3}
          />
          <AudioPicker label="Default Audio URL" value={data.audioSrc || ""} onChange={(val) => update("audioSrc", val)} />
          <Stack spacing={2}>
            <Typography variant="subtitle2">Snippets</Typography>
            {interviewSnippets.map((snippet, index) => (
              <Box key={`founder-snippet-${index}`} sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">Snippet {index + 1}</Typography>
                    <Button color="error" size="small" onClick={() => removeInterviewSnippet(index)}>
                      Remove
                    </Button>
                  </Stack>
                  <TextField
                    label="Label / Title"
                    value={snippet.label || ""}
                    onChange={(e) => updateInterviewSnippet(index, { label: e.target.value })}
                  />
                  <TextField
                    label="Short Description"
                    value={snippet.description || ""}
                    onChange={(e) => updateInterviewSnippet(index, { description: e.target.value })}
                    multiline
                    minRows={3}
                  />
                  <AudioPicker
                    label="Audio URL Override"
                    value={snippet.audioSrc || ""}
                    onChange={(val) => updateInterviewSnippet(index, { audioSrc: val })}
                    buttonLabel="Upload Snippet Audio"
                  />
                  <TextField
                    label="Start Time (seconds)"
                    type="number"
                    value={snippet.startTime ?? ""}
                    onChange={(e) => updateInterviewSnippet(index, { startTime: e.target.value })}
                    inputProps={{ min: 0, step: "0.1" }}
                  />
                  <TextField
                    label="End Time (seconds)"
                    type="number"
                    value={snippet.endTime ?? ""}
                    onChange={(e) => updateInterviewSnippet(index, { endTime: e.target.value })}
                    inputProps={{ min: 0, step: "0.1" }}
                  />
                  <TextField
                    label="Optional Button Label"
                    value={snippet.buttonLabel || ""}
                    onChange={(e) => updateInterviewSnippet(index, { buttonLabel: e.target.value })}
                  />
                </Stack>
              </Box>
            ))}
            <Button variant="outlined" onClick={addInterviewSnippet}>
              Add Snippet
            </Button>
          </Stack>
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
