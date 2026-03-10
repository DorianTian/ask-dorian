/**
 * Design tokens matching web's oklch-based system.
 * Converted to hex for React Native compatibility.
 */

export const lightColors = {
  background: "#FFFFFF",
  foreground: "#18181B",
  card: "#FFFFFF",
  cardForeground: "#18181B",
  primary: "#18181B",
  primaryForeground: "#FAFAFA",
  secondary: "#F4F4F5",
  secondaryForeground: "#18181B",
  muted: "#F4F4F5",
  mutedForeground: "#71717A",
  accent: "#F4F4F5",
  accentForeground: "#18181B",
  destructive: "#DC2626",
  destructiveForeground: "#FAFAFA",
  border: "#E4E4E7",
  ring: "#A1A1AA",
  // Brand
  brandFrom: "#6366F1",
  brandTo: "#8B5CF6",
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
  foreground: "#FAFAFA",
  card: "#18181B",
  cardForeground: "#FAFAFA",
  primary: "#FAFAFA",
  primaryForeground: "#18181B",
  secondary: "#27272A",
  secondaryForeground: "#FAFAFA",
  muted: "#27272A",
  mutedForeground: "#A1A1AA",
  accent: "#27272A",
  accentForeground: "#FAFAFA",
  destructive: "#DC2626",
  destructiveForeground: "#FAFAFA",
  border: "#3F3F46",
  ring: "#71717A",
  // Brand (same across themes)
  brandFrom: "#6366F1",
  brandTo: "#8B5CF6",
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
