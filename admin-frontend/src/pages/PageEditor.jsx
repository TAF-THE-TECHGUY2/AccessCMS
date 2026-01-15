import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  Grid,
  Menu,
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editMode, setEditMode] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [loaded, setLoaded] = useState(isNew);
  const livePath = form.slug.trim() === "home" || form.slug.trim() === "/" ? "/" : `/${form.slug.trim()}`;

  useEffect(() => {
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
      setLastSaved(new Date().toLocaleTimeString());
      setToast({ open: true, message: "Saved successfully.", severity: "success" });
      fetch(`${API_BASE_URL}/api/pages/slug/${encodeURIComponent(payload.slug)}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Public page not updated yet.");
          }
        })
        .catch(() => {
          setToast({ open: true, message: "Saved, but public page not found.", severity: "warning" });
        });
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
        await api.pages.update(id, payload);
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
          <Typography variant="h5">{isNew ? "New Page" : "Edit Page"}</Typography>
          <Typography variant="body2" color="text.secondary">
            {lastSaved ? `Last saved at ${lastSaved}` : "Autosave is on for drafts."}
          </Typography>
          {!isNew ? (
            <Typography variant="body2" color="text.secondary">
              Live URL:{" "}
              <a href={livePath} target="_blank" rel="noreferrer">
                {livePath}
              </a>
            </Typography>
          ) : null}
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2">Edit mode</Typography>
          <Switch checked={editMode} onChange={(e) => setEditMode(e.target.checked)} />
          <Button variant="outlined" onClick={() => navigate("/pages")}>
            Back
          </Button>
          <Button variant="contained" onClick={onSave} disabled={saving}>
            Save
          </Button>
          <Button onClick={onPublish} disabled={saving || isNew}>
            Publish
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
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
                helperText='Use "home" for homepage, e.g. "about"'
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
          <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, bgcolor: "#fff", height: "100%" }}>
            <SectionInspector
              section={selectedSection}
              onChange={(nextSection) => onUpdateSection(selectedIndex, nextSection)}
              onRemove={() => onRemoveSection(selectedIndex)}
            />
          </Box>
        </Grid>
      </Grid>

      {error ? <Typography color="error">{error}</Typography> : null}

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
