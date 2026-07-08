import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ImagePicker from "../components/pageBuilder/ImagePicker.jsx";

const moveInArray = (arr, from, to) => {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

export default function SiteSettings() {
  const [siteName, setSiteName] = useState("");
  const [logo, setLogo] = useState("");
  const [menu, setMenu] = useState([]);
  const [json, setJson] = useState("{}");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await api.settings.get();
      if (!data) return;
      setSiteName(data.siteName || "");
      setLogo(data.logo || "");
      setMenu(
        (data.navLinks || []).map((item) => ({
          label: item.label || "",
          href: item.href || "",
          children: (item.children || []).map((c) => ({
            label: c.label || "",
            href: c.href || "",
          })),
        }))
      );
      setJson(JSON.stringify(data, null, 2));
    };
    load();
  }, []);

  const updateItem = (idx, patch) =>
    setMenu((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  const removeItem = (idx) => setMenu((prev) => prev.filter((_, i) => i !== idx));
  const moveItem = (idx, dir) => setMenu((prev) => moveInArray(prev, idx, idx + dir));
  const addItem = () => setMenu((prev) => [...prev, { label: "", href: "", children: [] }]);

  const updateChild = (idx, cIdx, patch) =>
    setMenu((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              children: item.children.map((c, j) => (j === cIdx ? { ...c, ...patch } : c)),
            }
          : item
      )
    );
  const removeChild = (idx, cIdx) =>
    setMenu((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, children: item.children.filter((_, j) => j !== cIdx) } : item
      )
    );
  const moveChild = (idx, cIdx, dir) =>
    setMenu((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, children: moveInArray(item.children, cIdx, cIdx + dir) } : item
      )
    );
  const addChild = (idx) =>
    setMenu((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, children: [...item.children, { label: "", href: "" }] } : item
      )
    );

  const onSave = async () => {
    let payload;
    try {
      payload = JSON.parse(json);
    } catch {
      setMessage("Invalid JSON.");
      return;
    }
    payload.siteName = siteName;
    payload.logo = logo;
    payload.navLinks = menu
      .filter((item) => item.label.trim() && item.href.trim())
      .map((item) => ({
        label: item.label.trim(),
        href: item.href.trim(),
        children: item.children
          .filter((c) => c.label.trim() && c.href.trim())
          .map((c) => ({ label: c.label.trim(), href: c.href.trim() })),
      }));
    try {
      const saved = await api.settings.update(payload);
      if (saved) setJson(JSON.stringify(saved, null, 2));
      setMessage("Saved.");
    } catch (err) {
      setMessage(err.message || "Save failed.");
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Site Settings</Typography>
      <TextField label="Site Name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
      <ImagePicker label="Logo" value={logo} onChange={setLogo} />

      <Divider />

      <Box>
        <Typography variant="h6">Navigation Menu</Typography>
        <Typography variant="body2" color="text.secondary">
          Controls the menu on the public website. Use links like /funds — if you rename a
          page's slug in Pages, update its menu link here to match.
        </Typography>
      </Box>
      <Stack spacing={1.5}>
        {menu.map((item, idx) => (
          <Box key={idx} sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 1.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                label="Label"
                size="small"
                value={item.label}
                onChange={(e) => updateItem(idx, { label: e.target.value })}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Link"
                size="small"
                value={item.href}
                onChange={(e) => updateItem(idx, { href: e.target.value })}
                sx={{ flex: 1 }}
              />
              <IconButton size="small" onClick={() => moveItem(idx, -1)} disabled={idx === 0}>
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => moveItem(idx, 1)} disabled={idx === menu.length - 1}>
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
              <Tooltip title="Remove menu item">
                <IconButton size="small" onClick={() => removeItem(idx)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            {item.children.map((child, cIdx) => (
              <Stack key={cIdx} direction="row" spacing={1} alignItems="center" sx={{ pl: 4, mt: 1 }}>
                <TextField
                  label="Sub-item label"
                  size="small"
                  value={child.label}
                  onChange={(e) => updateChild(idx, cIdx, { label: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Link"
                  size="small"
                  value={child.href}
                  onChange={(e) => updateChild(idx, cIdx, { href: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <IconButton size="small" onClick={() => moveChild(idx, cIdx, -1)} disabled={cIdx === 0}>
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => moveChild(idx, cIdx, 1)}
                  disabled={cIdx === item.children.length - 1}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
                <Tooltip title="Remove sub-item">
                  <IconButton size="small" onClick={() => removeChild(idx, cIdx)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            ))}
            <Button size="small" startIcon={<AddIcon />} onClick={() => addChild(idx)} sx={{ mt: 1, ml: 4 }}>
              Sub-item (dropdown)
            </Button>
          </Box>
        ))}
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addItem} sx={{ alignSelf: "flex-start" }}>
          Add menu item
        </Button>
      </Stack>

      <Divider />

      <TextField
        label="Settings JSON (advanced)"
        value={json}
        onChange={(e) => setJson(e.target.value)}
        multiline
        minRows={12}
        helperText="Advanced settings. The menu above overrides navLinks in this JSON on save."
      />
      {message ? <Typography>{message}</Typography> : null}
      <Button variant="contained" onClick={onSave}>
        Save
      </Button>
    </Stack>
  );
}
