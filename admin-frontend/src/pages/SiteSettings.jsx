import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { Button, Stack, TextField, Typography } from "@mui/material";
import ImagePicker from "../components/pageBuilder/ImagePicker.jsx";

export default function SiteSettings() {
  const [siteName, setSiteName] = useState("");
  const [logo, setLogo] = useState("");
  const [json, setJson] = useState("{}");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await api.settings.get();
      if (!data) return;
      setSiteName(data.siteName || "");
      setLogo(data.logo || "");
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
    payload.logo = logo;
    const saved = await api.settings.update(payload);
    if (saved) setJson(JSON.stringify(saved, null, 2));
    setMessage("Saved.");
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Site Settings</Typography>
      <TextField label="Site Name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
      <ImagePicker label="Logo" value={logo} onChange={setLogo} />
      <TextField
        label="Settings JSON (advanced)"
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
