import { StyleSheet, Text, View } from "react-native"
import { Button } from "./Button"
import { COLORS, RADII } from "@/config/theme"

type EmptyStateProps = {
  title: string
  description: string
  icon?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  description,
  icon = "🌱",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.root}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 10,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: RADII["2xl"],
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 30 },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  description: {
    color: COLORS.textSoft,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 280,
  },
})
