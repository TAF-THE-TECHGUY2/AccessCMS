import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  AddPhotoAlternate,
  ArrowDownward,
  ArrowUpward,
  Delete,
  DragIndicator,
} from "@mui/icons-material";
import { api, API_BASE_URL } from "../api.js";
import RichTextEditor from "../components/RichTextEditor.jsx";

const emptyGalleries = { beforeImages: [], duringImages: [], afterImages: [] };
const stageOptions = [
  { key: "beforeImages", label: "Before" },
  { key: "duringImages", label: "During" },
  { key: "afterImages", label: "After" },
];

const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${API_BASE_URL}${url}`;
  return url;
};

const sortByOrder = (items) => {
  const list = Array.isArray(items) ? [...items] : [];
  const hasOrder = list.some((item) => typeof item?.order === "number");
  if (!hasOrder) return list;
  return list.sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
};

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
  const [galleries, setGalleries] = useState(emptyGalleries);
  const [uploadingStage, setUploadingStage] = useState("");
  const [dragItem, setDragItem] = useState(null);
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
      setGalleries({
        beforeImages: sortByOrder(item.galleries?.beforeImages),
        duringImages: sortByOrder(item.galleries?.duringImages),
        afterImages: sortByOrder(item.galleries?.afterImages),
      });
    };
    load();
  }, [id, isNew]);

  const setGalleryItem = (stageKey, index, patch) => {
    setGalleries((prev) => {
      const updated = [...(prev[stageKey] || [])];
      updated[index] = { ...updated[index], ...patch };
      return { ...prev, [stageKey]: updated };
    });
  };

  const removeGalleryItem = (stageKey, index) => {
    setGalleries((prev) => {
      const updated = [...(prev[stageKey] || [])];
      updated.splice(index, 1);
      return { ...prev, [stageKey]: updated };
    });
  };

  const moveImage = (fromStage, fromIndex, toStage, toIndex) => {
    setGalleries((prev) => {
      const source = [...(prev[fromStage] || [])];
      if (!source[fromIndex]) return prev;
      const [item] = source.splice(fromIndex, 1);
      const destination = fromStage === toStage ? source : [...(prev[toStage] || [])];
      let insertIndex = typeof toIndex === "number" ? toIndex : destination.length;
      if (fromStage === toStage && insertIndex > fromIndex) {
        insertIndex = Math.max(0, insertIndex - 1);
      }
      destination.splice(insertIndex, 0, item);
      return {
        ...prev,
        [fromStage]: source,
        [toStage]: destination,
      };
    });
  };

  const handleStageChange = (fromStage, index, nextStage) => {
    if (fromStage === nextStage) return;
    moveImage(fromStage, index, nextStage);
  };

  const handleDragStart = (stageKey, index, event) => {
    event.dataTransfer.effectAllowed = "move";
    setDragItem({ stageKey, index });
  };

  const handleDrop = (stageKey, index) => {
    if (!dragItem) return;
    moveImage(dragItem.stageKey, dragItem.index, stageKey, index);
    setDragItem(null);
  };

  const handleDropToEnd = (stageKey) => {
    if (!dragItem) return;
    moveImage(dragItem.stageKey, dragItem.index, stageKey);
    setDragItem(null);
  };

  const handleUpload = async (stageKey, files) => {
    const fileList = Array.from(files || []);
    if (!fileList.length) return;
    setUploadingStage(stageKey);
    try {
      const uploaded = [];
      for (const file of fileList) {
        const media = await api.media.upload(file);
        uploaded.push({ url: media.url, key: media.key, caption: "", alt: "" });
      }
      setGalleries((prev) => ({
        ...prev,
        [stageKey]: [...(prev[stageKey] || []), ...uploaded],
      }));
    } catch (uploadError) {
      setError(uploadError.message || "Upload failed.");
    } finally {
      setUploadingStage("");
    }
  };

  const orderedGalleries = useMemo(() => {
    const applyOrder = (items) =>
      (items || []).map((item, index) => ({
        ...item,
        order: index + 1,
      }));
    return {
      beforeImages: applyOrder(galleries.beforeImages),
      duringImages: applyOrder(galleries.duringImages),
      afterImages: applyOrder(galleries.afterImages),
    };
  }, [galleries]);

  const onSave = async () => {
    setError("");
    const payload = {
      ...form,
      beds: form.beds ? Number(form.beds) : undefined,
      baths: form.baths ? Number(form.baths) : undefined,
      sqft: form.sqft ? Number(form.sqft) : undefined,
      lotSqft: form.lotSqft ? Number(form.lotSqft) : undefined,
      description,
      galleries: orderedGalleries,
    };
    try {
      if (isNew) {
        await api.properties.create(payload);
      } else {
        await api.properties.update(id, payload);
      }
      navigate("/properties");
    } catch (saveError) {
      setError(saveError.message || "Save failed.");
    }
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
      <Stack spacing={2}>
        <Typography variant="h6">Photo Galleries</Typography>
        <Typography variant="body2" color="text.secondary">
          Drag images to reorder. Use the stage menu to move photos between Before, During, and After.
        </Typography>
        {stageOptions.map((stage) => {
          const items = galleries[stage.key] || [];
          return (
            <Paper key={stage.key} variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1">
                    {stage.label} Photos {stage.key === "duringImages" ? "(optional)" : ""}
                  </Typography>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<AddPhotoAlternate />}
                    disabled={uploadingStage === stage.key}
                  >
                    {uploadingStage === stage.key ? "Uploading..." : "Add Images"}
                    <input
                      hidden
                      multiple
                      accept="image/*"
                      type="file"
                      onChange={(event) => {
                        const files = Array.from(event.target.files || []);
                        event.target.value = "";
                        handleUpload(stage.key, files);
                      }}
                    />
                  </Button>
                </Stack>
                <Divider />
                {items.length === 0 ? (
                  <Typography color="text.secondary">No images yet.</Typography>
                ) : (
                  <Stack
                    spacing={1}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDropToEnd(stage.key)}
                  >
                    {items.map((item, index) => (
                      <Paper
                        key={`${item.url}-${index}`}
                        variant="outlined"
                        sx={{ p: 1.5 }}
                        draggable
                        onDragStart={(event) => handleDragStart(stage.key, index, event)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleDrop(stage.key, index)}
                        onDragEnd={() => setDragItem(null)}
                      >
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <DragIndicator fontSize="small" color="action" />
                            <Box
                              component="img"
                              src={resolveUrl(item.url)}
                              alt={item.alt || "Property photo"}
                              sx={{
                                width: 110,
                                height: 80,
                                objectFit: "cover",
                                borderRadius: 1,
                                border: "1px solid #e0e0e0",
                              }}
                            />
                          </Stack>
                          <Stack spacing={1} flex={1} minWidth={240}>
                            <TextField
                              label="Caption"
                              size="small"
                              value={item.caption || ""}
                              onChange={(event) =>
                                setGalleryItem(stage.key, index, { caption: event.target.value })
                              }
                              fullWidth
                            />
                            <TextField
                              label="Alt text"
                              size="small"
                              value={item.alt || ""}
                              onChange={(event) =>
                                setGalleryItem(stage.key, index, { alt: event.target.value })
                              }
                              fullWidth
                            />
                          </Stack>
                          <Stack spacing={1} minWidth={160}>
                            <TextField
                              label="Stage"
                              select
                              size="small"
                              value={stage.key}
                              onChange={(event) =>
                                handleStageChange(stage.key, index, event.target.value)
                              }
                            >
                              {stageOptions.map((option) => (
                                <MenuItem key={option.key} value={option.key}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </TextField>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                aria-label="Move up"
                                size="small"
                                onClick={() => moveImage(stage.key, index, stage.key, index - 1)}
                                disabled={index === 0}
                              >
                                <ArrowUpward fontSize="inherit" />
                              </IconButton>
                              <IconButton
                                aria-label="Move down"
                                size="small"
                                onClick={() => moveImage(stage.key, index, stage.key, index + 2)}
                                disabled={index === items.length - 1}
                              >
                                <ArrowDownward fontSize="inherit" />
                              </IconButton>
                              <IconButton
                                aria-label="Remove image"
                                size="small"
                                color="error"
                                onClick={() => removeGalleryItem(stage.key, index)}
                              >
                                <Delete fontSize="inherit" />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
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
