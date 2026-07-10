import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Menu,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import { api, API_BASE_URL } from "../api.js";
import SectionPreview from "../components/pageBuilder/SectionPreview.jsx";
import SectionInspector from "../components/pageBuilder/SectionInspector.jsx";
import { SECTION_TYPES, createSection } from "../components/pageBuilder/sectionDefaults.js";
import { moveItem } from "../components/pageBuilder/utils.js";

export default function PageEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const autosaveRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    status: "draft",
  });
  const [sections, setSections] = useState([]);
  const [aliases, setAliases] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editMode, setEditMode] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [loaded, setLoaded] = useState(isNew);
  const livePath = form.slug.trim() === "home" || form.slug.trim() === "/" ? "/" : `/${form.slug.trim()}`;
  // The public website's address — the admin runs on its own domain, so the
  // live link must be absolute or it points at the admin host and 404s.
  const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || "https://ap.boston";
  const liveUrl = `${PUBLIC_SITE_URL}${livePath}`;

  useEffect(() => {
    setError(""); // don't carry a stale error into another page or "New Page"
    if (isNew) return;
    const load = async () => {
      try {
        const pages = await api.pages.list();
        const page = pages.find((p) => p._id === id);
        if (!page) {
          setError("Page not found.");
          return;
        }
        setForm({ title: page.title, slug: page.slug, status: page.status });
        setSections(page.sections || []);
        setAliases(page.aliases || []);
        setSelectedIndex(0);
      } catch (err) {
        setError(err.message || "Failed to load page.");
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, [id, isNew]);

  const payload = useMemo(() => {
    const trimmedSlug = form.slug.trim();
    const normalizedSlug = trimmedSlug === "/" ? "home" : trimmedSlug;
    return { ...form, slug: normalizedSlug, sections };
  }, [form, sections]);

  const onReorder = (from, to) => {
    setSections((prev) => moveItem(prev, from, to));
    setSelectedIndex(to);
  };

  const onSave = async () => {
    setError("");
    if (!payload.title || !payload.slug) {
      setError("Title and slug are required.");
      setToast({ open: true, message: "Title and slug are required.", severity: "error" });
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const created = await api.pages.create(payload);
        navigate(`/pages/${created._id}`);
        return;
      }
      const updated = await api.pages.update(id, payload);
      setForm((prev) => ({ ...prev, title: updated.title, slug: updated.slug, status: updated.status }));
      setSections(updated.sections || []);
      setAliases(updated.aliases || []);
      setLastSaved(new Date().toLocaleTimeString());
      setToast({ open: true, message: "Saved successfully.", severity: "success" });
      if (updated.status === "published") {
        fetch(`${API_BASE_URL}/api/pages/slug/${encodeURIComponent(payload.slug)}`)
          .then((res) => {
            if (!res.ok) {
              throw new Error("Public page not updated yet.");
            }
          })
          .catch(() => {
            setToast({ open: true, message: "Saved, but public page not found.", severity: "warning" });
          });
      }
    } catch (err) {
      const message = err.message || "Save failed.";
      setError(message);
      setToast({ open: true, message, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const onPublish = async () => {
    if (isNew) {
      setError("Save the page before publishing.");
      return;
    }
    setSaving(true);
    try {
      const updated = await api.pages.update(id, payload);
      const published = await api.pages.publish(id);
      setForm((prev) => ({
        ...prev,
        title: updated.title,
        slug: updated.slug,
        status: published.status || "published",
      }));
      setSections(updated.sections || []);
      setAliases(updated.aliases || []);
      setLastSaved(new Date().toLocaleTimeString());
      setToast({ open: true, message: "Published successfully.", severity: "success" });
      fetch(`${API_BASE_URL}/api/pages/slug/${encodeURIComponent(payload.slug)}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Public page not updated yet.");
          }
        })
        .catch(() => {
          setToast({ open: true, message: "Published, but public page not found.", severity: "warning" });
        });
    } catch (err) {
      const message = err.message || "Publish failed.";
      setError(message);
      setToast({ open: true, message, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (isNew || !editMode || !loaded) return;
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(async () => {
      try {
        // Slug changes only apply on explicit Save/Publish so a half-typed
        // slug never goes live or gets recorded as a redirect alias.
        await api.pages.update(id, { ...payload, slug: undefined });
        setLastSaved(new Date().toLocaleTimeString());
      } catch {
        // ignore autosave errors
      }
    }, 1200);
    return () => {
      if (autosaveRef.current) clearTimeout(autosaveRef.current);
    };
  }, [payload, id, editMode, isNew]);

  const selectedSection = sections[selectedIndex];

  const onAddSection = (type) => {
    const nextSection = createSection(type);
    setSections((prev) => [...prev, nextSection]);
    setSelectedIndex(sections.length);
    setMenuAnchor(null);
  };

  const onUpdateSection = (index, nextSection) => {
    setSections((prev) => prev.map((section, idx) => (idx === index ? nextSection : section)));
  };

  const onRemoveSection = (index) => {
    setSections((prev) => prev.filter((_, idx) => idx !== index));
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="h5">
              {isNew ? "New Page" : form.title || "Edit Page"}
            </Typography>
            <Chip
              label={form.status === "published" ? "Published" : "Draft"}
              size="small"
              color={form.status === "published" ? "success" : "default"}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {lastSaved ? `Last saved at ${lastSaved}` : "Autosave is on for drafts."}
          </Typography>
          {!isNew ? (
            <Typography variant="body2" color="text.secondary">
              Live URL:{" "}
              <a href={liveUrl} target="_blank" rel="noreferrer">
                {liveUrl}
              </a>
            </Typography>
          ) : null}
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2">Edit mode</Typography>
          <Switch checked={editMode} onChange={(e) => setEditMode(e.target.checked)} />
          <Button variant="outlined" color="inherit" onClick={() => navigate("/pages")}>
            Back
          </Button>
          <Button variant="outlined" onClick={onSave} disabled={saving}>
            Save
          </Button>
          <Button variant="contained" color="secondary" onClick={onPublish} disabled={saving || isNew}>
            Publish
          </Button>
        </Stack>
      </Stack>

      {error ? (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Stack component={Paper} variant="outlined" spacing={2} sx={{ p: 2.5 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Slug"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                helperText={
                  aliases.length
                    ? `Old links ${aliases.map((a) => `/${a}`).join(", ")} redirect here. Changing the slug keeps old links working.`
                    : 'Use "home" for homepage, e.g. "about". Changing the slug keeps old links working (they redirect).'
                }
                fullWidth
              />
              <TextField
                label="Status"
                select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </TextField>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="subtitle1">Page Canvas</Typography>
              <Button variant="outlined" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                Add Section
              </Button>
              <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                {SECTION_TYPES.map((section) => (
                  <MenuItem key={section.type} onClick={() => onAddSection(section.type)}>
                    {section.label}
                  </MenuItem>
                ))}
              </Menu>
              <Typography variant="body2" color="text.secondary">
                Drag sections to reorder
              </Typography>
            </Stack>

            <Stack spacing={2}>
              {sections.map((section, idx) => (
                <SectionPreview
                  key={`${section.type}-${idx}`}
                  section={section}
                  selected={selectedIndex === idx}
                  editMode={editMode}
                  onSelect={() => setSelectedIndex(idx)}
                  onUpdate={(nextSection) => onUpdateSection(idx, nextSection)}
                  dragProps={{
                    draggable: true,
                    onDragStart: (e) => e.dataTransfer.setData("text/plain", String(idx)),
                    onDragOver: (e) => e.preventDefault(),
                    onDrop: (e) => {
                      const from = Number(e.dataTransfer.getData("text/plain"));
                      onReorder(from, idx);
                    },
                  }}
                />
              ))}
              {sections.length === 0 ? (
                <Box sx={{ p: 4, border: "1px dashed #ccc", borderRadius: 2, textAlign: "center" }}>
                  <Typography>Add your first section to start building this page.</Typography>
                </Box>
              ) : null}
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ height: "100%" }}>
            <SectionInspector
              section={selectedSection}
              onChange={(nextSection) => onUpdateSection(selectedIndex, nextSection)}
              onRemove={() => onRemoveSection(selectedIndex)}
            />
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
