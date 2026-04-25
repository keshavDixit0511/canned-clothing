import { ReactNode } from "react"
import { StyleSheet, Text, View } from "react-native"
import { COLORS } from "@/config/theme"

type SectionProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}

export function Section({ eyebrow, title, subtitle, action }: SectionProps) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 4 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  eyebrow: {
    color: "rgba(52,211,153,0.82)",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  subtitle: {
    color: COLORS.textSoft,
    fontSize: 13,
    lineHeight: 19,
  },
})
