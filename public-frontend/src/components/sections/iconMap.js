import {
  Puzzle,
  Coins,
  TrendingUp,
  Lock,
  DollarSign,
  ShieldCheck,
  Lightbulb,
  BarChart3,
  Wrench,
  Link2,
  BadgeCheck,
  Scale,
  Shield,
  LayoutDashboard,
  Briefcase,
  Building2,
  ChevronDown,
  Settings,
  Calculator,
  Quote,
  Sparkles,
} from "lucide-react";

export const iconMap = {
  Puzzle,
  Coins,
  TrendingUp,
  Lock,
  DollarSign,
  ShieldCheck,
  Lightbulb,
  BarChart3,
  Wrench,
  Link2,
  BadgeCheck,
  Scale,
  Shield,
  LayoutDashboard,
  Briefcase,
  Building2,
  ChevronDown,
  Settings,
  Calculator,
  Quote,
  Sparkles,
};

export const normalizeIconName = (name) => {
  const normalized = String(name || "")
    .trim()
    .replace(/[\s_-]+/g, "")
    .toLowerCase();

  if (!normalized) return null;

  return Object.keys(iconMap).find((key) => key.toLowerCase() === normalized) || null;
};

export const getIcon = (name) => {
  const resolvedName = normalizeIconName(name);
  return iconMap[resolvedName || "Lightbulb"] || Lightbulb;
};
