/**
 * Design tokens aligned with web's globals.css (:root / .dark).
 * Every hardcoded color in screen files MUST reference these tokens
 * via `useColors()` so light/dark switching works.
 */

export const lightColors = {
  // --- Core (from web :root) ---
  background: "#FAFAFA",       // --bg
  foreground: "#0F172A",       // --text (main heading text)
  card: "#FFFFFF",             // --surface
  cardForeground: "#0F172A",   // --card-foreground
  primary: "#059669",          // --primary (light uses deeper emerald)
  primaryForeground: "#FFFFFF",
  secondary: "#F5F5F5",        // --secondary
  secondaryForeground: "#0F172A",
  muted: "#F5F5F5",            // --muted
  mutedForeground: "#64748B",  // --muted-foreground
  accent: "#F0FDF4",           // --accent (light emerald tint)
  accentForeground: "#0F172A",
  destructive: "#EF4444",      // --destructive
  destructiveForeground: "#FAFAFA",
  border: "#E5E7EB",           // --border
  input: "#E5E7EB",            // --input
  ring: "#059669",             // --ring

  // --- Brand (Emerald) ---
  brandFrom: "#059669",
  brandTo: "#10B981",

  // --- Text scale (slate palette, light mode) ---
  textPrimary: "#0F172A",      // slate-900 — headings, emphasis
  textSecondary: "#334155",    // slate-700 — body text
  textTertiary: "#64748B",     // slate-500 — secondary labels
  textMuted: "#94A3B8",        // slate-400 — muted, timestamps
  textSubtle: "#CBD5E1",       // slate-300 — very subtle, disabled

  // --- Surface scale ---
  surfaceElevated: "#F1F5F9",  // slate-100 — elevated card bg
  surfaceHover: "#F8FAFC",     // slate-50 — hover state

  // --- Border scale ---
  borderLight: "#E2E8F0",      // slate-200 — subtle borders
  borderDark: "#CBD5E1",       // slate-300 — stronger borders

  // --- Priority ---
  priorityP0: "#EF4444",
  priorityP1: "#F97316",
  priorityP2: "#3B82F6",
  priorityP3: "#A1A1AA",

  // --- Fragment types ---
  fragmentText: "#7C3AED",
  fragmentVoice: "#DB2777",
  fragmentImage: "#0D9488",
  fragmentUrl: "#2563EB",
  fragmentEvent: "#D97706",
  fragmentUncertain: "#EA580C",

  // --- Status ---
  statusSuccess: "#16A34A",
  statusProcessing: "#7C3AED",
} as const

export const darkColors = {
  // --- Core (from web .dark) ---
  background: "#09090B",       // --bg
  foreground: "#F8FAFC",       // --text (main heading text)
  card: "#18181B",             // --surface
  cardForeground: "#F8FAFC",   // --card-foreground
  primary: "#10B981",          // --primary
  primaryForeground: "#FFFFFF",
  secondary: "#27272A",        // --secondary
  secondaryForeground: "#F8FAFC",
  muted: "#27272A",            // --muted
  mutedForeground: "#94A3B8",  // --muted-foreground
  accent: "#27272A",           // --accent
  accentForeground: "#F8FAFC",
  destructive: "#EF4444",      // --destructive
  destructiveForeground: "#FAFAFA",
  border: "#27272A",           // --border
  input: "#27272A",            // --input
  ring: "#10B981",             // --ring

  // --- Brand (Emerald) ---
  brandFrom: "#10B981",
  brandTo: "#059669",

  // --- Text scale (slate palette, dark mode) ---
  textPrimary: "#F1F5F9",     // slate-100 — headings, emphasis
  textSecondary: "#CBD5E1",   // slate-300 — body text
  textTertiary: "#94A3B8",    // slate-400 — secondary labels
  textMuted: "#64748B",       // slate-500 — muted, timestamps
  textSubtle: "#475569",      // slate-600 — very subtle, disabled

  // --- Surface scale ---
  surfaceElevated: "#1E293B", // slate-800 — elevated card bg
  surfaceHover: "#334155",    // slate-700 — hover state

  // --- Border scale ---
  borderLight: "#334155",     // slate-700 — subtle borders
  borderDark: "#475569",      // slate-600 — stronger borders

  // --- Priority ---
  priorityP0: "#EF4444",
  priorityP1: "#F97316",
  priorityP2: "#3B82F6",
  priorityP3: "#71717A",

  // --- Fragment types ---
  fragmentText: "#A78BFA",
  fragmentVoice: "#F472B6",
  fragmentImage: "#2DD4BF",
  fragmentUrl: "#60A5FA",
  fragmentEvent: "#FBBF24",
  fragmentUncertain: "#FB923C",

  // --- Status ---
  statusSuccess: "#22C55E",
  statusProcessing: "#8B5CF6",
} as const

export type Colors = { [K in keyof typeof lightColors]: string }
