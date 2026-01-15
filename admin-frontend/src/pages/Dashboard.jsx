import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { Grid, Paper, Typography } from "@mui/material";

const StatCard = ({ label, value }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="overline" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h4">{value}</Typography>
  </Paper>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    pages: 0,
    properties: 0,
    media: 0,
    team: 0,
    faq: 0,
  });

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
    };
    load();
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard label="Pages" value={stats.pages} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard label="Properties" value={stats.properties} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard label="Media" value={stats.media} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard label="Team" value={stats.team} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard label="FAQs" value={stats.faq} />
      </Grid>
    </Grid>
  );
}
