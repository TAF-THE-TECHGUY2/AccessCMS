import React, { useMemo, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import LandscapeIcon from "@mui/icons-material/Landscape";
import NotesIcon from "@mui/icons-material/Notes";
import ImageIcon from "@mui/icons-material/Image";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import PanoramaIcon from "@mui/icons-material/Panorama";
import BarChartIcon from "@mui/icons-material/BarChart";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import GroupsIcon from "@mui/icons-material/Groups";
import QuizIcon from "@mui/icons-material/Quiz";
import GridViewIcon from "@mui/icons-material/GridView";
import CollectionsIcon from "@mui/icons-material/Collections";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import HeightIcon from "@mui/icons-material/Height";
import GavelIcon from "@mui/icons-material/Gavel";
import ViewListIcon from "@mui/icons-material/ViewList";
import AppsIcon from "@mui/icons-material/Apps";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import ShareIcon from "@mui/icons-material/Share";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import BadgeIcon from "@mui/icons-material/Badge";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import WidgetsIcon from "@mui/icons-material/Widgets";
import { SECTION_TYPES } from "./sectionDefaults.js";

const ICONS = {
  HERO: <LandscapeIcon />,
  SIMPLE_CONTENT: <NotesIcon />,
  TITLE_IMAGE: <ImageIcon />,
  RICH_TEXT: <TextFieldsIcon />,
  IMAGE_BANNER: <PanoramaIcon />,
  STATS: <BarChartIcon />,
  CTA: <AdsClickIcon />,
  TEAM_GRID: <GroupsIcon />,
  FAQ_ACCORDION: <QuizIcon />,
  PROPERTY_GRID: <GridViewIcon />,
  GALLERY: <CollectionsIcon />,
  DIVIDER: <HorizontalRuleIcon />,
  SPACER: <HeightIcon />,
  DISCLOSURE: <GavelIcon />,
  ICON_ACCORDION_GRID: <ViewListIcon />,
  ICON_CARD_GRID: <AppsIcon />,
  TESTIMONIALS: <FormatQuoteIcon />,
  SOCIALS: <ShareIcon />,
  PORTFOLIO_CARD: <BusinessCenterIcon />,
  GREATER_BOSTON_REASONS: <LocationCityIcon />,
  PROPERTY_COLUMNS: <ViewColumnIcon />,
  PROFILE_CARDS: <BadgeIcon />,
  ADVISORY: <SupportAgentIcon />,
  CONTACT_FORM: <ContactMailIcon />,
  FAQ_PAGE: <HelpOutlineIcon />,
  NEWSLETTER: <MarkEmailReadIcon />,
};

export default function SectionPickerDialog({ open, onClose, onPick }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTION_TYPES;
    return SECTION_TYPES.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Add a section
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          size="small"
          autoFocus
          placeholder="Search sections…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Grid container spacing={1.5}>
          {filtered.map((section) => (
            <Grid item xs={12} sm={6} key={section.type}>
              <Stack
                direction="row"
                spacing={1.5}
                onClick={() => onPick(section.type)}
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  cursor: "pointer",
                  height: "100%",
                  alignItems: "flex-start",
                  transition: "border-color .15s, background-color .15s",
                  "&:hover": { borderColor: "secondary.main", bgcolor: "rgba(179,161,122,0.06)" },
                }}
              >
                <Box sx={{ color: "secondary.main", mt: 0.25 }}>
                  {ICONS[section.type] || <WidgetsIcon />}
                </Box>
                <Box>
                  <Typography variant="subtitle2">{section.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {section.description}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
          {filtered.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                No sections match “{query}”.
              </Typography>
            </Grid>
          ) : null}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
