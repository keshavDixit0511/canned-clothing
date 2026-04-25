export const COLORS = {
  background: "#060a06",
  surface: "rgba(255,255,255,0.05)",
  surfaceStrong: "rgba(255,255,255,0.08)",
  surfaceMuted: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.09)",
  borderStrong: "rgba(255,255,255,0.16)",
  text: "#f4f7f2",
  textMuted: "rgba(244,247,242,0.7)",
  textSoft: "rgba(244,247,242,0.45)",
  emerald: "#34d399",
  lime: "#a3e635",
  amber: "#fbbf24",
  sky: "#38bdf8",
  violet: "#a78bfa",
  red: "#fb7185",
} as const

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
} as const

export const RADII = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 28,
  pill: 999,
} as const

export const SHADOWS = {
  soft: {
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  glow: {
    shadowColor: COLORS.emerald,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const

export const TYPOGRAPHY = {
  heading: "System",
  body: "System",
} as const
