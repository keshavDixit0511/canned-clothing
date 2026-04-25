import { ReactNode } from "react"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet, View } from "react-native"
import { COLORS } from "@/config/theme"

type ScreenProps = {
  children: ReactNode
  padded?: boolean
}

export function Screen({ children, padded = true }: ScreenProps) {
  return (
    <View style={styles.root}>
      <View style={styles.background} />
      <View style={styles.glowA} />
      <View style={styles.glowB} />
      <LinearGradient
        colors={["rgba(255,255,255,0.02)", "rgba(255,255,255,0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={padded ? styles.content : styles.contentFlush}>{children}</View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  background: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.background },
  glowA: {
    position: "absolute",
    top: -40,
    left: -30,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "rgba(52, 211, 153, 0.09)",
  },
  glowB: {
    position: "absolute",
    right: -60,
    top: 180,
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: "rgba(163, 230, 53, 0.06)",
  },
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  contentFlush: { flex: 1 },
})
