import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Stack, TextField, Typography, MenuItem } from "@mui/material";
import { api } from "../api.js";
import RichTextEditor from "../components/RichTextEditor.jsx";

const emptyGalleries = JSON.stringify(
  { beforeImages: [], duringImages: [], afterImages: [] },
  null,
  2
);

export default function PropertyEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    type: "",
    beds: "",
    baths: "",
    parking: "",
    sqft: "",
    lotSqft: "",
    status: "active",
  });
  const [description, setDescription] = useState("");
  const [galleriesJson, setGalleriesJson] = useState(emptyGalleries);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew) return;
    const load = async () => {
      const items = await api.properties.list();
      const item = items.find((p) => p._id === id);
      if (!item) return;
      setForm({
        title: item.title || "",
        slug: item.slug || "",
        address: item.address || "",
        city: item.city || "",
        state: item.state || "",
        zip: item.zip || "",
        type: item.type || "",
        beds: item.beds ?? "",
        baths: item.baths ?? "",
        parking: item.parking || "",
        sqft: item.sqft ?? "",
        lotSqft: item.lotSqft ?? "",
        status: item.status || "active",
      });
      setDescription(item.description || "");
      setGalleriesJson(JSON.stringify(item.galleries || {}, null, 2));
    };
    load();
  }, [id, isNew]);

  const onSave = async () => {
    let galleries;
    try {
      galleries = JSON.parse(galleriesJson);
    } catch {
      setError("Galleries JSON is invalid.");
      return;
    }
    setError("");
    const payload = {
      ...form,
      beds: form.beds ? Number(form.beds) : undefined,
      baths: form.baths ? Number(form.baths) : undefined,
      sqft: form.sqft ? Number(form.sqft) : undefined,
      lotSqft: form.lotSqft ? Number(form.lotSqft) : undefined,
      description,
      galleries,
    };
    if (isNew) {
      await api.properties.create(payload);
    } else {
      await api.properties.update(id, payload);
    }
    navigate("/properties");
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">{isNew ? "New Property" : "Edit Property"}</Typography>
      <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <TextField label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
      <TextField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      <TextField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
      <TextField label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
      <TextField label="Zip" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
      <TextField label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
      <TextField label="Beds" value={form.beds} onChange={(e) => setForm({ ...form, beds: e.target.value })} />
      <TextField label="Baths" value={form.baths} onChange={(e) => setForm({ ...form, baths: e.target.value })} />
      <TextField label="Parking" value={form.parking} onChange={(e) => setForm({ ...form, parking: e.target.value })} />
      <TextField label="Sqft" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })} />
      <TextField label="Lot Sqft" value={form.lotSqft} onChange={(e) => setForm({ ...form, lotSqft: e.target.value })} />
      <TextField
        label="Status"
        select
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
      >
        <MenuItem value="coming_soon">Coming Soon</MenuItem>
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="sold">Sold</MenuItem>
      </TextField>
      <Typography variant="subtitle2">Description</Typography>
      <RichTextEditor value={description} onChange={setDescription} />
      <TextField
        label="Galleries JSON"
        value={galleriesJson}
        onChange={(e) => setGalleriesJson(e.target.value)}
        multiline
        minRows={8}
      />
      {error ? <Typography color="error">{error}</Typography> : null}
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={onSave}>
          Save
        </Button>
        <Button onClick={() => navigate("/properties")}>Cancel</Button>
      </Stack>
    </Stack>
  );
}
