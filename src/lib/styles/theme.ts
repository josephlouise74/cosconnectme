import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
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

export const theme = {
    colors: roseTheme,
    fonts: {
        heading: "var(--font-bebas-neue)",
        body: "var(--font-poppins)",
    },
    shadows: {
        DEFAULT: "0 4px 6px -1px rgba(225, 29, 72, 0.1), 0 2px 4px -1px rgba(225, 29, 72, 0.06)",
        md: "0 6px 8px -1px rgba(225, 29, 72, 0.1), 0 4px 6px -1px rgba(225, 29, 72, 0.05)",
        lg: "0 10px 15px -3px rgba(225, 29, 72, 0.1), 0 4px 6px -2px rgba(225, 29, 72, 0.05)",
    },
    borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
    },
};



export default theme;