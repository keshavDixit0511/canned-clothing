import { ReactNode } from "react"
import { StyleSheet, Text, View, ViewStyle } from "react-native"
import { COLORS, RADII, SHADOWS } from "@/config/theme"

type CardProps = {
  children: ReactNode
  style?: ViewStyle
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>
}

type CardHeaderProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  right?: ReactNode
}

export function CardHeader({ eyebrow, title, subtitle, right }: CardHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1, gap: 4 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII["2xl"],
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 16,
    ...SHADOWS.soft,
  },
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: "rgba(52,211,153,0.8)",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  subtitle: {
    color: COLORS.textSoft,
    fontSize: 13,
    lineHeight: 19,
  },
})
