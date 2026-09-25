import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RichTextEditor from "../components/RichTextEditor.jsx";

const normCat = (c) => (c || "").trim().toLowerCase();
const emptyForm = { question: "", answerHtml: "", category: "" };

export default function Faq() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [dragId, setDragId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const data = await api.faq.list();
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const categoryOptions = useMemo(
    () => Array.from(new Set(items.map((i) => (i.category || "").trim()).filter(Boolean))),
    [items]
  );

  // Group by category, preserving the order in which categories first appear.
  const groups = useMemo(() => {
    const out = [];
    const idx = {};
    items.forEach((item) => {
      const key = (item.category || "").trim() || "Uncategorized";
      if (!(key in idx)) {
        idx[key] = out.length;
        out.push({ key, items: [] });
      }
      out[idx[key]].items.push(item);
    });
    return out;
  }, [items]);

  const onCreate = async () => {
    if (!form.question || !form.answerHtml) return;
    setBusy(true);
    try {
      await api.faq.create({
        question: form.question,
        answerHtml: form.answerHtml,
        category: form.category || undefined,
      });
      setForm(emptyForm);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      question: item.question || "",
      answerHtml: item.answerHtml || "",
      category: item.category || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const saveEdit = async () => {
    if (!editForm.question || !editForm.answerHtml) return;
    setBusy(true);
    try {
      await api.faq.update(editingId, {
        question: editForm.question,
        answerHtml: editForm.answerHtml,
        category: editForm.category || undefined,
      });
      cancelEdit();
      await load();
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    await api.faq.remove(id);
    if (editingId === id) cancelEdit();
    await load();
  };

  // ---- Drag and drop (within a single category) ----
  const onDragEnter = (overId) => {
    if (!dragId || dragId === overId) return;
    const drag = items.find((i) => i._id === dragId);
    const over = items.find((i) => i._id === overId);
    if (!drag || !over || normCat(drag.category) !== normCat(over.category)) return;
    const without = items.filter((i) => i._id !== dragId);
    const overIdx = without.findIndex((i) => i._id === overId);
    setItems([...without.slice(0, overIdx), drag, ...without.slice(overIdx)]);
  };

  const onDragEnd = async () => {
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const drag = items.find((i) => i._id === id);
    if (!drag) return;
    const cat = normCat(drag.category);
    const payload = items
      .filter((i) => normCat(i.category) === cat)
      .map((i, order) => ({ id: i._id, order }));
    setBusy(true);
    try {
      const updated = await api.faq.reorder(payload);
      setItems(updated);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5">FAQ</Typography>

      {/* Add new FAQ */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1">Add a new FAQ</Typography>
          <TextField
            label="Question"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
          />
          <Autocomplete
            freeSolo
            options={categoryOptions}
            value={form.category}
            onChange={(_e, val) => setForm({ ...form, category: val || "" })}
            onInputChange={(_e, val) => setForm({ ...form, category: val })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                helperText="Must match a category key on the FAQ page section"
              />
            )}
          />
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Answer
            </Typography>
            <RichTextEditor
              value={form.answerHtml}
              onChange={(val) => setForm({ ...form, answerHtml: val })}
            />
          </Box>
          <Box>
            <Button variant="contained" onClick={onCreate} disabled={busy}>
              Add FAQ
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Typography variant="body2" color="text.secondary">
        Drag the <DragIndicatorIcon fontSize="inherit" sx={{ verticalAlign: "middle" }} /> handle to
        reorder questions within a category. This order is what appears on the website.
      </Typography>

      {/* Grouped list */}
      {groups.map((group) => (
        <Paper key={group.key} variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
            <Typography variant="subtitle1">{group.key}</Typography>
            <Chip size="small" label={group.items.length} />
          </Stack>
          <Divider sx={{ mb: 1 }} />
          <Stack spacing={1}>
            {group.items.map((item) => {
              const editing = editingId === item._id;
              return (
                <Box
                  key={item._id}
                  draggable={!editing}
                  onDragStart={() => setDragId(item._id)}
                  onDragEnter={() => onDragEnter(item._id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnd={onDragEnd}
                  sx={{
                    border: "1px solid",
                    borderColor: dragId === item._id ? "primary.main" : "#e0e0e0",
                    borderRadius: 1,
                    bgcolor: dragId === item._id ? "action.hover" : "background.paper",
                    p: 1,
                  }}
                >
                  {editing ? (
                    <Stack spacing={2} sx={{ p: 1 }}>
                      <TextField
                        label="Question"
                        value={editForm.question}
                        onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                      />
                      <Autocomplete
                        freeSolo
                        options={categoryOptions}
                        value={editForm.category}
                        onChange={(_e, val) => setEditForm({ ...editForm, category: val || "" })}
                        onInputChange={(_e, val) => setEditForm({ ...editForm, category: val })}
                        renderInput={(params) => <TextField {...params} label="Category" />}
                      />
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Answer
                        </Typography>
                        <RichTextEditor
                          value={editForm.answerHtml}
                          onChange={(val) => setEditForm({ ...editForm, answerHtml: val })}
                        />
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Button variant="contained" onClick={saveEdit} disabled={busy}>
                          Save
                        </Button>
                        <Button onClick={cancelEdit} disabled={busy}>
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <DragIndicatorIcon
                        sx={{ color: "text.disabled", cursor: "grab" }}
                        fontSize="small"
                      />
                      <Typography sx={{ flex: 1 }}>{item.question}</Typography>
                      <IconButton size="small" onClick={() => startEdit(item)} aria-label="Edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(item._id)}
                        aria-label="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
