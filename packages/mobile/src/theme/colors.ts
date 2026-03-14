/**
 * Design tokens matching web's oklch-based system.
 * Converted to hex for React Native compatibility.
 */

export const lightColors = {
  background: "#FAFAFA",
  foreground: "#0F172A",
  card: "#FFFFFF",
  cardForeground: "#18181B",
  primary: "#059669",
  primaryForeground: "#FFFFFF",
  secondary: "#F4F4F5",
  secondaryForeground: "#18181B",
  muted: "#F4F4F5",
  mutedForeground: "#64748B",
  accent: "#F4F4F5",
  accentForeground: "#18181B",
  destructive: "#DC2626",
  destructiveForeground: "#FAFAFA",
  border: "#E5E7EB",
  ring: "#059669",
  // Brand — Emerald (aligned with web)
  brandFrom: "#059669",
  brandTo: "#10B981",
  // Priority
  priorityP0: "#EF4444",
  priorityP1: "#F97316",
  priorityP2: "#3B82F6",
  priorityP3: "#A1A1AA",
  // Fragment types
  fragmentText: "#A78BFA",
  fragmentVoice: "#F472B6",
  fragmentImage: "#2DD4BF",
  fragmentUrl: "#60A5FA",
  fragmentEvent: "#FBBF24",
  fragmentUncertain: "#FB923C",
  // Status
  statusSuccess: "#22C55E",
  statusProcessing: "#8B5CF6",
} as const

export const darkColors = {
  background: "#09090B",
  foreground: "#F8FAFC",
  card: "#18181B",
  cardForeground: "#F8FAFC",
  primary: "#10B981",
  primaryForeground: "#FFFFFF",
  secondary: "#27272A",
  secondaryForeground: "#F8FAFC",
  muted: "#27272A",
  mutedForeground: "#94A3B8",
  accent: "#27272A",
  accentForeground: "#F8FAFC",
  destructive: "#DC2626",
  destructiveForeground: "#FAFAFA",
  border: "#27272A",
  ring: "#10B981",
  // Brand — Emerald (aligned with web)
  brandFrom: "#10B981",
  brandTo: "#059669",
  // Priority (same across themes)
  priorityP0: "#EF4444",
  priorityP1: "#F97316",
  priorityP2: "#3B82F6",
  priorityP3: "#71717A",
  // Fragment types (same across themes)
  fragmentText: "#A78BFA",
  fragmentVoice: "#F472B6",
  fragmentImage: "#2DD4BF",
  fragmentUrl: "#60A5FA",
  fragmentEvent: "#FBBF24",
  fragmentUncertain: "#FB923C",
  // Status
  statusSuccess: "#22C55E",
  statusProcessing: "#8B5CF6",
} as const

export type Colors = { [K in keyof typeof lightColors]: string }
