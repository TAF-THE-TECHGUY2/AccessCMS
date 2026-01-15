import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { Button, Stack, TextField, Typography, MenuItem } from "@mui/material";

export default function Users() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ email: "", name: "", role: "editor", password: "" });

  const load = async () => {
    const data = await api.users.list();
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async () => {
    if (!form.email || !form.password) return;
    await api.users.create(form);
    setForm({ email: "", name: "", role: "editor", password: "" });
    await load();
  };

  const onDelete = async (id) => {
    await api.users.remove(id);
    await load();
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Users</Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <TextField
          label="Role"
          select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="editor">Editor</MenuItem>
        </TextField>
        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button variant="contained" onClick={onCreate}>
          Add User
        </Button>
      </Stack>
      {items.map((item) => (
        <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center">
          <Typography>{item.name} — {item.email} ({item.role})</Typography>
          <Button color="error" size="small" onClick={() => onDelete(item.id)}>
            Delete
          </Button>
        </Stack>
      ))}
    </Stack>
  );
}
