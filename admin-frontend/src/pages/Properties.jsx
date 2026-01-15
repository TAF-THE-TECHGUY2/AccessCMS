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

export default function Properties() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const data = await api.properties.list();
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    await api.properties.remove(id);
    await load();
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Properties</Typography>
        <Button component={Link} to="/properties/new" variant="contained">
          New Property
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
          {items.map((item) => (
            <TableRow key={item._id}>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.slug}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button component={Link} to={`/properties/${item._id}`} size="small">
                    Edit
                  </Button>
                  <Button color="error" size="small" onClick={() => onDelete(item._id)}>
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
