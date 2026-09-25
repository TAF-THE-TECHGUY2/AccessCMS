import React, { useState } from "react";
import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { api } from "../../api.js";

// MEMBER_GATE is the invitation to sign in. Locking it would hide the only way
// through, so it is never included in a bulk lock.
const NEVER_LOCK = new Set(["MEMBER_GATE"]);

/**
 * Walks a section's data for uploaded-file references.
 *
 * Section shapes vary a lot -- `image`, `backgroundImage`, `items[].image`,
 * `mapping[key].image` -- so rather than enumerate them, collect every string
 * that points at /uploads. Over-collecting is harmless; missing one would
 * leave a file downloadable after its section was locked.
 */
const collectUploadPaths = (value, found = new Set()) => {
  if (typeof value === "string") {
    if (value.startsWith("/uploads/")) found.add(value);
    return found;
  }
  if (Array.isArray(value)) {
    value.forEach((v) => collectUploadPaths(v, found));
    return found;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((v) => collectUploadPaths(v, found));
  }
  return found;
};

export default function MemberAccessPanel({ sections, onChange }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const lockable = sections.filter((s) => !NEVER_LOCK.has(s.type));
  const lockedCount = lockable.filter((s) => s.access === "MEMBERS").length;

  const uploadsIn = (list) =>
    list.reduce((acc, s) => collectUploadPaths(s.data || {}, acc), new Set());

  const inLocked = uploadsIn(lockable.filter((s) => s.access === "MEMBERS"));
  // A file used by a section that stays public cannot be locked: doing so would
  // break that section for everyone. Flag it instead of silently doing damage.
  const inPublic = uploadsIn(sections.filter((s) => s.access !== "MEMBERS"));

  const shared = Array.from(inLocked).filter((p) => inPublic.has(p));
  const lockedUploads = Array.from(inLocked).filter((p) => !inPublic.has(p));

  const setAll = (access) => {
    setResult(null);
    onChange(
      sections.map((s) => (NEVER_LOCK.has(s.type) ? { ...s, access: "PUBLIC" } : { ...s, access }))
    );
  };

  // Locking a section hides the image URL from the API response, but the file
  // stays fetchable at that path. This is the second half of the job.
  const lockFiles = async () => {
    setBusy(true);
    setResult(null);
    try {
      const media = await api.media.list();
      const byPath = new Map(media.map((m) => [m.url, m]));

      const targets = lockedUploads
        .map((p) => byPath.get(p))
        .filter((m) => m && m.access !== "MEMBERS");

      const missing = lockedUploads.filter((p) => !byPath.has(p));
      const failures = [];

      for (const m of targets) {
        try {
          await api.media.setAccess(m._id, "MEMBERS");
        } catch (err) {
          failures.push(`${m.key}: ${err?.message || "failed"}`);
        }
      }

      setResult({
        severity: failures.length ? "warning" : "success",
        message: [
          `Locked ${targets.length - failures.length} of ${lockedUploads.length} file(s).`,
          missing.length
            ? `${missing.length} not found in the Media Library (uploaded outside it) — lock or re-upload manually.`
            : "",
          failures.length ? `Failed: ${failures.join("; ")}` : "",
        ]
          .filter(Boolean)
          .join(" "),
      });
    } catch (err) {
      setResult({ severity: "error", message: err?.message || "Could not reach the Media Library." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography variant="subtitle2">Members access</Typography>
        <Chip
          size="small"
          color={lockedCount ? "warning" : "default"}
          variant="outlined"
          icon={lockedCount ? <LockIcon sx={{ fontSize: 14 }} /> : <LockOpenIcon sx={{ fontSize: 14 }} />}
          label={
            lockedCount
              ? `${lockedCount} of ${lockable.length} sections members-only`
              : "Everything public"
          }
        />
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button size="small" variant="outlined" startIcon={<LockIcon />} onClick={() => setAll("MEMBERS")}>
          Lock all sections
        </Button>
        <Button size="small" variant="outlined" startIcon={<LockOpenIcon />} onClick={() => setAll("PUBLIC")}>
          Make all public
        </Button>
        <Button
          size="small"
          variant="contained"
          color="warning"
          disabled={busy || lockedUploads.length === 0}
          onClick={lockFiles}
        >
          {busy
            ? "Locking files…"
            : `Lock ${lockedUploads.length} file${lockedUploads.length === 1 ? "" : "s"} used by locked sections`}
        </Button>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Locking a section stops its content being sent to signed-out visitors. Any
        image inside it stays downloadable by direct URL until the file itself is
        locked too — that is what the third button does. Save the page first so the
        section changes are what these files are matched against.
      </Typography>

      {result ? (
        <Alert severity={result.severity} onClose={() => setResult(null)}>
          {result.message}
        </Alert>
      ) : null}

      {shared.length ? (
        <Alert severity="info">
          {shared.length} file{shared.length === 1 ? " is" : "s are"} used by a
          public section as well, so {shared.length === 1 ? "it" : "they"} will not
          be locked — that would break the public section. Upload a separate copy
          for the members-only section if {shared.length === 1 ? "it" : "they"}{" "}
          should be restricted.
        </Alert>
      ) : null}

      {lockedCount === lockable.length && lockable.length > 0 ? (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Every section is locked. Consider leaving the hero and your Important
            Disclosures public — a disclaimer behind a login is not doing its job.
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
}
