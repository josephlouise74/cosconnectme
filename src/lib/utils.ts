import { type ClassValue, clsx } from "clsx"
import { Check, Clock, Package, X } from "lucide-react";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Rose color palette - primary colors for the theme
export const roseTheme = {
  primary: {
    DEFAULT: "#e11d48", // Rose-600
    hover: "#be123c", // Rose-700
    50: "#fff1f2",
    100: "#ffe4e6",
    200: "#fecdd3",
    300: "#fda4af",
    400: "#fb7185",
    500: "#f43f5e",
    600: "#e11d48",
    700: "#be123c",
    800: "#9f1239",
    900: "#881337",
    950: "#4c0519",
  },
  secondary: {
    DEFAULT: "#475569", // Slate-600
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },
  background: {
    DEFAULT: "#ffffff",
    dark: "#0f172a",
    muted: "#f8fafc", // Slate-50
    mutedDark: "#1e293b", // Slate-800
  },
  text: {
    DEFAULT: "#0f172a", // Slate-900
    dark: "#f8fafc", // Slate-50
    muted: "#64748b", // Slate-500
    mutedDark: "#94a3b8", // Slate-400
    onPrimary: "#ffffff",
  },
  accent: {
    yellow: "#fbbf24", // Amber-400
    orange: "#fb923c", // Orange-400
    green: "#22c55e", // Green-500
  },
  border: {
    DEFAULT: "#e2e8f0", // Slate-200
    dark: "#334155", // Slate-700
    hover: "#e11d48", // Primary
  }
};

export const COLORS = {
  primary: roseTheme.primary.DEFAULT,
  primaryHover: roseTheme.primary.hover,
  error: "#ef4444", // Red-500 for error states
  light: {
    bg: roseTheme.background.DEFAULT,
    bgSecondary: roseTheme.background.muted,
    text: roseTheme.text.DEFAULT,
    textSecondary: roseTheme.text.muted,
    textMuted: roseTheme.text.muted,
    border: roseTheme.border.DEFAULT,
  },
  dark: {
    bg: roseTheme.background.dark,
    bgSecondary: roseTheme.background.mutedDark,
    text: roseTheme.text.dark,
    textSecondary: roseTheme.text.mutedDark,
    textMuted: roseTheme.text.mutedDark,
    border: roseTheme.border.dark,
  }
};

export const TYPOGRAPHY = {
  fonts: {
    // Playful display font for headings - great for costume/cosplay theme
    heading: "var(--font-righteous)", // Fun, bold, and playful font
    // Clean, readable font for body text
    body: "var(--font-inter)", // Modern, clean, and highly readable
    // Decorative font for special elements
    accent: "var(--font-pacifico)", // Playful, decorative font for special text
  },
  sizes: {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    h4: "text-2xl tracking-wide", // Added tracking for better readability
    h3: "text-3xl tracking-wide",
    h2: "text-4xl tracking-wide",
    h1: "text-5xl tracking-wide",
  },
  weights: {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  },
  // Added new styles for costume theme
  styles: {
    costume: "font-accent tracking-wider", // For special costume-related text
    fantasy: "font-heading tracking-widest", // For fantasy-themed elements
    modern: "font-body", // For regular content
  }
};


// Helper function to format offer type
export const formatOfferType = (type: string | undefined | null) => {
  // Handle null, undefined, or empty string
  if (!type || typeof type !== 'string') {
    return 'N/A';
  }

  const typeMap: Record<string, string> = {
    // Basic types
    'wig_only': 'Wig Only',
    'shoes_only': 'Shoes Only',
    'costume_only': 'Costume Only',
    'props_only': 'Props Only',
    'accessories_only': 'Accessories Only',

    // Full sets with costume
    'full_set_costume_wig': 'Full Set (Costume + Wig)',
    'full_set_costume_shoes': 'Full Set (Costume + Shoes)',
    'full_set_costume_wig_shoes': 'Full Set (Costume + Wig + Shoes)',
    'full_set_costume_props': 'Full Set (Costume + Props)',
    'full_set_costume_wig_props': 'Full Set (Costume + Wig + Props)',
    'full_set_costume_shoes_props': 'Full Set (Costume + Shoes + Props)',
    'full_set_costume_wig_shoes_props': 'Complete Set (Costume + Wig + Shoes + Props)',

    // Sets without costume
    'full_set_wig_shoes': 'Wig + Shoes Set',
    'full_set_wig_props': 'Wig + Props Set',
    'full_set_shoes_props': 'Shoes + Props Set',
    'full_set_wig_shoes_props': 'Wig + Shoes + Props Set',

    // Legacy types (for backward compatibility)
    'full_set_shoes': 'Full Set + Shoes',
    'full_set_weapon': 'Full Set + Weapon',
    'full_set_shoes_weapon': 'Full Set + Shoes + Weapon'
  };

  // If we have a direct mapping, use it
  if (typeMap[type]) {
    return typeMap[type];
  }

  // For unknown types, try to format them nicely
  if (type.includes('_')) {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // For single words, just capitalize
  return type.charAt(0).toUpperCase() + type.slice(1);
};


export const statusConfig = {
  pending_approval: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    text: "Pending Approval",
    icon: Clock
  },
  approved: {
    color: "bg-green-100 text-green-800 border-green-200",
    text: "Approved",
    icon: Check
  },
  rejected: {
    color: "bg-red-100 text-red-800 border-red-200",
    text: "Rejected",
    icon: X
  },
  expired: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    text: "Expired",
    icon: Clock
  },
  cancelled: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    text: "Cancelled",
    icon: X
  },
  // Legacy status support
  pending: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    text: "Pending Approval",
    icon: Clock
  },
  confirmed: {
    color: "bg-green-100 text-green-800 border-green-200",
    text: "Approved",
    icon: Check
  },
  active: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    text: "Active",
    icon: Package
  },
  completed: {
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    text: "Completed",
    icon: Check
  },
}