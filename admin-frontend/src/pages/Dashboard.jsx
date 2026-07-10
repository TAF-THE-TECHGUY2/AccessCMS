import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import PeopleIcon from "@mui/icons-material/People";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LaunchIcon from "@mui/icons-material/Launch";

const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || "https://ap.boston";

const StatCard = ({ label, value, icon, to }) => (
  <Paper
    component={Link}
    to={to}
    variant="outlined"
    sx={{
      p: 2,
      display: "flex",
      alignItems: "center",
      gap: 2,
      textDecoration: "none",
      color: "inherit",
      transition: "border-color .15s, box-shadow .15s",
      "&:hover": { borderColor: "secondary.main", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(179,161,122,0.15)",
        color: "secondary.main",
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4 }}>
        {label}
      </Typography>
      <Typography variant="h5">{value}</Typography>
    </Box>
  </Paper>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ pages: 0, properties: 0, media: 0, team: 0, faq: 0 });
  const [recentPages, setRecentPages] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [pages, properties, media, team, faq] = await Promise.all([
        api.pages.list(),
        api.properties.list(),
        api.media.list(),
        api.team.list(),
        api.faq.list(),
      ]);
      setStats({
        pages: pages.length,
        properties: properties.length,
        media: media.length,
        team: team.length,
        faq: faq.length,
      });
      setRecentPages(pages.slice(0, 5));
    };
    load();
  }, []);

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
        <Typography variant="h5">Dashboard</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button component={Link} to="/pages/new" variant="contained" color="secondary" startIcon={<AddIcon />}>
            New Page
          </Button>
          <Button component={Link} to="/media" variant="outlined" startIcon={<UploadIcon />}>
            Upload Media
          </Button>
          <Button component={Link} to="/settings" variant="outlined" startIcon={<MenuBookIcon />}>
            Edit Menu
          </Button>
          <Button
            href={PUBLIC_SITE_URL}
            target="_blank"
            rel="noreferrer"
            variant="outlined"
            color="inherit"
            startIcon={<LaunchIcon />}
          >
            View Site
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard label="Pages" value={stats.pages} icon={<DescriptionIcon />} to="/pages" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard label="Properties" value={stats.properties} icon={<HomeWorkIcon />} to="/properties" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard label="Media" value={stats.media} icon={<PhotoLibraryIcon />} to="/media" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard label="Team" value={stats.team} icon={<PeopleIcon />} to="/team" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard label="FAQs" value={stats.faq} icon={<HelpOutlineIcon />} to="/faq" />
        </Grid>
      </Grid>

      <Paper variant="outlined">
        <Box sx={{ px: 2, pt: 2 }}>
          <Typography variant="subtitle1">Recently updated pages</Typography>
        </Box>
        <Table size="small" sx={{ mt: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentPages.map((page) => (
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
                <TableCell>
                  {page.updatedAt ? new Date(page.updatedAt).toLocaleString() : "—"}
                </TableCell>
                <TableCell align="right">
                  <Button component={Link} to={`/pages/${page._id}`} size="small">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
