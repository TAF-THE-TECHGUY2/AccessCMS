import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { api } from "../api.js";

export default function Pages() {
  const [pages, setPages] = useState([]);

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
    await load();
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Pages</Typography>
        <Button component={Link} to="/pages/new" variant="contained">
          New Page
        </Button>
      </Stack>
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
          {pages.map((page) => (
            <TableRow key={page._id}>
              <TableCell>{page.title}</TableCell>
              <TableCell>{page.slug === "home" ? "home (/)" : page.slug}</TableCell>
              <TableCell>{page.status}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button component={Link} to={`/pages/${page._id}`} size="small">
                    Edit
                  </Button>
                  <Button size="small" onClick={() => onPublish(page._id)}>
                    Publish
                  </Button>
                  <Button color="error" size="small" onClick={() => onDelete(page._id)}>
                    Delete
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  );
}
