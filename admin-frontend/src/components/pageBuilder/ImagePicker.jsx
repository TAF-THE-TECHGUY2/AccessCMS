import React, { useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { api } from "../../api.js";

export default function ImagePicker({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onUpload = async (file) => {
    setUploading(true);
    setError("");
    try {
      const res = await api.media.upload(file);
      const url = res?.media?.url || res?.url || "";
      if (url) onChange(url);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{label}</Typography>
      <TextField
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste image URL"
      />
      <Button component="label" variant="outlined" disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
        <input
          hidden
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
      </Button>
      {error ? (
        <Typography color="error" variant="caption">
          {error}
        </Typography>
      ) : null}
      {value ? (
        <Box
          sx={{
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            backgroundImage: `url(${value})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : null}
    </Stack>
  );
}
