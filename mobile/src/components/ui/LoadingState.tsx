import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { COLORS } from "@/config/theme"

type LoadingStateProps = {
  label?: string
}

export function LoadingState({ label = "Loading..." }: LoadingStateProps) {
  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={COLORS.emerald} />
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  label: {
    color: "rgba(244,247,242,0.4)",
    fontSize: 13,
    fontWeight: "600",
  },
})
