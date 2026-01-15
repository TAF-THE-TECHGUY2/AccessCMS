import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { Button, Stack, TextField, Typography } from "@mui/material";

export default function Team() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", role: "", photoUrl: "", bio: "" });

  const load = async () => {
    const data = await api.team.list();
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async () => {
    if (!form.name || !form.role) return;
    await api.team.create(form);
    setForm({ name: "", role: "", photoUrl: "", bio: "" });
    await load();
  };

  const onDelete = async (id) => {
    await api.team.remove(id);
    await load();
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Team</Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <TextField label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        <TextField label="Photo URL" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
        <TextField label="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <Button variant="contained" onClick={onCreate}>
          Add
        </Button>
      </Stack>
      {items.map((item) => (
        <Stack key={item._id} direction="row" justifyContent="space-between" alignItems="center">
          <Typography>{item.name} — {item.role}</Typography>
          <Button color="error" size="small" onClick={() => onDelete(item._id)}>
            Delete
          </Button>
        </Stack>
      ))}
    </Stack>
  );
}
