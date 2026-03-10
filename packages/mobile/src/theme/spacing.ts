/** 4px base spacing scale */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
} as const

/** Typography presets for React Native */
export const typography = {
  h1: { fontSize: 24, fontWeight: "700" as const, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: "600" as const, lineHeight: 28 },
  h3: { fontSize: 16, fontWeight: "600" as const, lineHeight: 24 },
  body: { fontSize: 14, fontWeight: "400" as const, lineHeight: 20 },
  bodyMedium: { fontSize: 14, fontWeight: "500" as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: "400" as const, lineHeight: 16 },
  captionMedium: { fontSize: 12, fontWeight: "500" as const, lineHeight: 16 },
  tiny: { fontSize: 10, fontWeight: "500" as const, lineHeight: 14 },
} as const

/** Border radius presets */
export const radii = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const
