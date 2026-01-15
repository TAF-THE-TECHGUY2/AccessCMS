import React, { useEffect, useState } from "react";
import { api } from "../api.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";

export default function Media() {
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(false);

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
    await load();
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Media Library</Typography>
        <Button variant="contained" component="label" disabled={uploading}>
          Upload
          <input type="file" hidden onChange={onUpload} />
        </Button>
      </Stack>
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 2 }}>
              <img
                src={item.url.startsWith("http") ? item.url : `${API_BASE_URL}${item.url}`}
                alt={item.key}
                style={{ width: "100%", borderRadius: 8 }}
              />
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                <Typography variant="caption">{item.key}</Typography>
                <Button size="small" color="error" onClick={() => onDelete(item._id)}>
                  Delete
                </Button>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
