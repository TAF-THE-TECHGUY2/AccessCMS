import React, { useEffect, useState, useCallback } from "react";
import { api } from "../api.js";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Link,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  MarkEmailRead as MarkReadIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

const FILTERS = [
  { label: "New", value: "new" },
  { label: "Read", value: "read" },
  { label: "Archived", value: "archived" },
  { label: "All", value: "" },
];

const STATUS_COLOR = {
  new: "primary",
  read: "default",
  archived: "warning",
};

const formatDate = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
};

export default function Messages() {
  const [filter, setFilter] = useState("new");
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.contact.list(filter);
      setMessages(data.messages || []);
      setUnread(data.unread || 0);
    } catch (err) {
      setError(err.message || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id, status) => {
    setBusyId(id);
    try {
      await api.contact.update(id, { status });
      await load();
    } catch (err) {
      setError(err.message || "Failed to update message.");
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this message permanently?")) return;
    setBusyId(id);
    try {
      await api.contact.remove(id);
      if (expandedId === id) setExpandedId(null);
      await load();
    } catch (err) {
      setError(err.message || "Failed to delete message.");
    } finally {
      setBusyId(null);
    }
  };

  const onExpand = (message) => {
    const next = expandedId === message._id ? null : message._id;
    setExpandedId(next);
    // Opening a "new" message marks it read.
    if (next && message.status === "new") {
      setStatus(message._id, "read");
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="h5">Messages</Typography>
          {unread > 0 ? (
            <Chip color="primary" size="small" label={`${unread} new`} sx={{ fontWeight: 700 }} />
          ) : null}
        </Stack>
        <Tooltip title="Refresh">
          <IconButton onClick={load} aria-label="refresh">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Messages submitted through the public site contact form.
      </Typography>

      <Tabs
        value={filter}
        onChange={(_e, value) => {
          setFilter(value);
          setExpandedId(null);
        }}
        sx={{ minHeight: 0 }}
      >
        {FILTERS.map((f) => (
          <Tab key={f.value} label={f.label} value={f.value} sx={{ minHeight: 0, py: 1 }} />
        ))}
      </Tabs>

      {error ? (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      ) : null}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : messages.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No messages here.</Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {messages.map((m) => {
            const isOpen = expandedId === m._id;
            return (
              <Paper
                key={m._id}
                variant="outlined"
                sx={{
                  p: 2,
                  borderLeft: m.status === "new" ? "4px solid" : "4px solid transparent",
                  borderLeftColor: m.status === "new" ? "primary.main" : "transparent",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  justifyContent="space-between"
                  spacing={2}
                  sx={{ cursor: "pointer" }}
                  onClick={() => onExpand(m)}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                      <Typography sx={{ fontWeight: m.status === "new" ? 700 : 600 }}>
                        {m.subject}
                      </Typography>
                      <Chip
                        size="small"
                        label={m.status}
                        color={STATUS_COLOR[m.status] || "default"}
                        variant={m.status === "new" ? "filled" : "outlined"}
                      />
                      {m.topic ? (
                        <Chip size="small" variant="outlined" label={m.topic} />
                      ) : null}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {m.name} · {m.email}
                      {m.phone ? ` · ${m.phone}` : ""}
                    </Typography>
                    {!isOpen ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 560,
                        }}
                      >
                        {m.message}
                      </Typography>
                    ) : null}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                    {formatDate(m.createdAt)}
                  </Typography>
                </Stack>

                {isOpen ? (
                  <Box sx={{ mt: 1.5 }}>
                    <Divider sx={{ mb: 1.5 }} />
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
                      {m.message}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Button
                        size="small"
                        variant="outlined"
                        component={Link}
                        href={`mailto:${m.email}?subject=${encodeURIComponent(
                          `Re: ${m.subject}`
                        )}`}
                      >
                        Reply by email
                      </Button>
                      {m.status !== "read" ? (
                        <Button
                          size="small"
                          startIcon={<MarkReadIcon />}
                          disabled={busyId === m._id}
                          onClick={() => setStatus(m._id, "read")}
                        >
                          Mark read
                        </Button>
                      ) : null}
                      {m.status !== "archived" ? (
                        <Button
                          size="small"
                          startIcon={<ArchiveIcon />}
                          disabled={busyId === m._id}
                          onClick={() => setStatus(m._id, "archived")}
                        >
                          Archive
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          disabled={busyId === m._id}
                          onClick={() => setStatus(m._id, "new")}
                        >
                          Move to New
                        </Button>
                      )}
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        disabled={busyId === m._id}
                        onClick={() => onDelete(m._id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Box>
                ) : null}
              </Paper>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
