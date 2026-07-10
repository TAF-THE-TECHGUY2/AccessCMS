import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { api } from "../api.js";

export default function Pages() {
  const [pages, setPages] = useState([]);
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null); // page object or null

  const load = async () => {
    const data = await api.pages.list();
    setPages(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onPublish = async (id) => {
    await api.pages.publish(id);
    await load();
  };

  const onDelete = async (id) => {
    await api.pages.remove(id);
    setConfirmDelete(null);
    await load();
  };

  const q = query.trim().toLowerCase();
  const visiblePages = q
    ? pages.filter(
        (p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
      )
    : pages;

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Pages</Typography>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            size="small"
            placeholder="Search pages…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button component={Link} to="/pages/new" variant="contained" color="secondary">
            New Page
          </Button>
        </Stack>
      </Stack>
      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visiblePages.map((page) => (
              <TableRow key={page._id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{page.title}</TableCell>
                <TableCell>{page.slug === "home" ? "home (/)" : `/${page.slug}`}</TableCell>
                <TableCell>
                  <Chip
                    label={page.status === "published" ? "Published" : "Draft"}
                    size="small"
                    color={page.status === "published" ? "success" : "default"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button component={Link} to={`/pages/${page._id}`} size="small" variant="outlined">
                      Edit
                    </Button>
                    <Button size="small" onClick={() => onPublish(page._id)} disabled={page.status === "published"}>
                      Publish
                    </Button>
                    <Button color="error" size="small" onClick={() => setConfirmDelete(page)}>
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete “{confirmDelete?.title}”?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently deletes the page and all its sections. Visitors going to /
            {confirmDelete?.slug} will see an error. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={() => onDelete(confirmDelete._id)}>
            Delete page
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
