import React, { useState } from "react";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { api, API_BASE_URL } from "../../api.js";

const resolveAudioUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;
  return url;
};

export default function AudioPicker({
  label,
  value,
  onChange,
  placeholder = "Paste audio URL",
  buttonLabel = "Upload Audio",
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onUpload = async (file) => {
    setUploading(true);
    setError("");
    try {
      const res = await api.media.upload(file);
      const url = res?.url || res?.media?.url || "";
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
        placeholder={placeholder}
      />
      <Button component="label" variant="outlined" disabled={uploading}>
        {uploading ? "Uploading..." : buttonLabel}
        <input
          hidden
          type="file"
          accept="audio/*"
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
      {value ? <audio controls preload="metadata" src={resolveAudioUrl(value)} /> : null}
    </Stack>
  );
}
