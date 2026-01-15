import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { Button, Stack, TextField, Typography } from "@mui/material";

export default function Faq() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ question: "", answerHtml: "", category: "" });

  const load = async () => {
    const data = await api.faq.list();
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async () => {
    if (!form.question || !form.answerHtml) return;
    await api.faq.create(form);
    setForm({ question: "", answerHtml: "", category: "" });
    await load();
  };

  const onDelete = async (id) => {
    await api.faq.remove(id);
    await load();
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">FAQ</Typography>
      <TextField
        label="Question"
        value={form.question}
        onChange={(e) => setForm({ ...form, question: e.target.value })}
      />
      <TextField
        label="Answer (HTML)"
        value={form.answerHtml}
        onChange={(e) => setForm({ ...form, answerHtml: e.target.value })}
        multiline
        minRows={3}
      />
      <TextField
        label="Category"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />
      <Button variant="contained" onClick={onCreate}>
        Add FAQ
      </Button>
      {items.map((item) => (
        <Stack key={item._id} direction="row" justifyContent="space-between" alignItems="center">
          <Typography>{item.question}</Typography>
          <Button color="error" size="small" onClick={() => onDelete(item._id)}>
            Delete
          </Button>
        </Stack>
      ))}
    </Stack>
  );
}
