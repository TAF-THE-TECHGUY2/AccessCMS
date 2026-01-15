import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { Button, Stack, TextField, Typography } from "@mui/material";

export default function SiteSettings() {
  const [siteName, setSiteName] = useState("");
  const [json, setJson] = useState("{}");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await api.settings.get();
      if (!data) return;
      setSiteName(data.siteName || "");
      setJson(JSON.stringify(data, null, 2));
    };
    load();
  }, []);

  const onSave = async () => {
    let payload;
    try {
      payload = JSON.parse(json);
    } catch {
      setMessage("Invalid JSON.");
      return;
    }
    payload.siteName = siteName;
    await api.settings.update(payload);
    setMessage("Saved.");
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Site Settings</Typography>
      <TextField label="Site Name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
      <TextField
        label="Settings JSON"
        value={json}
        onChange={(e) => setJson(e.target.value)}
        multiline
        minRows={12}
      />
      {message ? <Typography>{message}</Typography> : null}
      <Button variant="contained" onClick={onSave}>
        Save
      </Button>
    </Stack>
  );
}
