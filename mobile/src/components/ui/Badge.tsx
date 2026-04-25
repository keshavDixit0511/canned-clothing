import { ReactNode } from "react"
import { StyleSheet, Text, View } from "react-native"
import { COLORS, RADII } from "@/config/theme"

type BadgeProps = {
  children: ReactNode
  tone?: "emerald" | "amber" | "sky" | "violet" | "red" | "muted"
}

const TONES = {
  emerald: { bg: "rgba(52,211,153,0.12)", fg: COLORS.emerald, border: "rgba(52,211,153,0.2)" },
  amber: { bg: "rgba(251,191,36,0.12)", fg: COLORS.amber, border: "rgba(251,191,36,0.2)" },
  sky: { bg: "rgba(56,189,248,0.12)", fg: COLORS.sky, border: "rgba(56,189,248,0.2)" },
  violet: { bg: "rgba(167,139,250,0.12)", fg: COLORS.violet, border: "rgba(167,139,250,0.2)" },
  red: { bg: "rgba(251,113,133,0.12)", fg: COLORS.red, border: "rgba(251,113,133,0.2)" },
  muted: { bg: "rgba(255,255,255,0.05)", fg: COLORS.textSoft, border: COLORS.border },
} as const

export function Badge({ children, tone = "muted" }: BadgeProps) {
  const t = TONES[tone]
  return (
    <View style={[styles.badge, { backgroundColor: t.bg, borderColor: t.border }]}>
      <Text style={[styles.text, { color: t.fg }]}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
})
