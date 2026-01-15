import React from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ArrayEditor({ label, items = [], fields = [], onChange, onAdd }) {
  const updateItem = (index, key, value) => {
    const next = items.map((item, idx) => (idx === index ? { ...item, [key]: value } : item));
    onChange(next);
  };

  const removeItem = (index) => {
    const next = items.filter((_, idx) => idx !== index);
    onChange(next);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">{label}</Typography>
      <Stack spacing={2}>
        {items.map((item, index) => (
          <Box key={`${label}-${index}`} sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Item {index + 1}</Typography>
                <IconButton size="small" onClick={() => removeItem(index)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
              {fields.map((field) => (
                <TextField
                  key={`${label}-${index}-${field.name}`}
                  label={field.label}
                  value={item[field.name] ?? ""}
                  onChange={(e) => updateItem(index, field.name, e.target.value)}
                  multiline={field.multiline}
                  minRows={field.multiline ? 3 : undefined}
                />
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
      <Button variant="outlined" onClick={onAdd}>
        Add {label}
      </Button>
    </Stack>
  );
}
