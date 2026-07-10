import React, { useEffect, useState } from "react";
import { api, API_BASE_URL } from "../api.js";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadIcon from "@mui/icons-material/Upload";

const fullUrl = (url) => (url.startsWith("http") ? url : `${API_BASE_URL}${url}`);

export default function Media() {
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // item or null
  const [copied, setCopied] = useState(false);

  const load = async () => {
    const data = await api.media.list();
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await api.media.upload(file);
    setUploading(false);
    e.target.value = "";
    await load();
  };

  const onDelete = async (id) => {
    await api.media.remove(id);
    setConfirmDelete(null);
    await load();
  };

  const onCopy = async (item) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
    } catch {
      // clipboard unavailable (http/permissions) — show the URL to copy manually
      window.prompt("Copy the image URL:", item.url);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Media Library</Typography>
        <Button variant="contained" color="secondary" component="label" disabled={uploading} startIcon={<UploadIcon />}>
          {uploading ? "Uploading…" : "Upload"}
          <input type="file" hidden accept="image/*" onChange={onUpload} />
        </Button>
      </Stack>
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item._id}>
            <Paper
              variant="outlined"
              sx={{
                overflow: "hidden",
                transition: "border-color .15s, box-shadow .15s",
                "&:hover": { borderColor: "secondary.main", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
              }}
            >
              <Box
                sx={{
                  aspectRatio: "4 / 3",
                  backgroundImage: `url(${fullUrl(item.url)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  bgcolor: "#f0f1f3",
                }}
              />
              <Stack direction="row" alignItems="center" sx={{ px: 1.5, py: 0.75 }} spacing={0.5}>
                <Typography variant="caption" noWrap sx={{ flex: 1 }} title={item.key}>
                  {item.key}
                </Typography>
                <Tooltip title="Copy URL (paste into any image field)">
                  <IconButton size="small" onClick={() => onCopy(item)}>
                    <ContentCopyIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" color="error" onClick={() => setConfirmDelete(item)}>
                    <DeleteOutlineIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>
          </Grid>
        ))}
        {items.length === 0 ? (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 5, textAlign: "center" }}>
              <Typography color="text.secondary">
                No images yet. Upload one to use it on pages and properties.
              </Typography>
            </Paper>
          </Grid>
        ) : null}
      </Grid>

      <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete this image?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            “{confirmDelete?.key}” will be permanently deleted. Any page or property still using
            it will show a broken image.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={() => onDelete(confirmDelete._id)}>
            Delete image
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Image URL copied"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </Stack>
  );
}
