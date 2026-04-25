import { ReactNode } from "react"
import { BlurView } from "expo-blur"
import { StyleSheet, View, ViewStyle } from "react-native"
import { COLORS, RADII, SHADOWS } from "@/config/theme"

type SurfaceProps = {
  children: ReactNode
  style?: ViewStyle
  intensity?: number
}

export function Surface({ children, style, intensity = 18 }: SurfaceProps) {
  return (
    <View style={[styles.shell, style]}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.overlay} />
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    overflow: "hidden",
    borderRadius: RADII["2xl"],
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    ...SHADOWS.soft,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.015)",
  },
  content: { padding: 16 },
})
