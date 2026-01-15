import React from "react";
import { InputBase, Typography } from "@mui/material";

export default function InlineText({
  value,
  onChange,
  editMode,
  variant = "h5",
  placeholder = "Click to edit",
  sx,
}) {
  if (!editMode) {
    return (
      <Typography variant={variant} sx={sx}>
        {value || placeholder}
      </Typography>
    );
  }

  return (
    <InputBase
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      sx={{
        fontSize: variant === "h4" ? 32 : variant === "h6" ? 18 : 24,
        fontWeight: 600,
        width: "100%",
        ...sx,
      }}
    />
  );
}
