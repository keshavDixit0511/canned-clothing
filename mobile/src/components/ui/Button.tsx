import { ReactNode } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { COLORS, RADII } from "@/config/theme"

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost"

type ButtonProps = {
  title: string
  onPress?: () => void
  variant?: ButtonVariant
  loading?: boolean
  disabled?: boolean
  leftIcon?: ReactNode
  fullWidth?: boolean
  style?: ViewStyle
}

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  leftIcon,
  fullWidth = true,
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        (pressed || loading) && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={["#059669", "#34d399"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {variant === "primary" ? (
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {leftIcon}
      {loading ? (
        <ActivityIndicator color={variant === "outline" || variant === "ghost" ? COLORS.emerald : COLORS.text} />
      ) : (
        <Text style={[styles.label, variant === "outline" || variant === "ghost" ? styles.labelMuted : null]}>
          {title}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: RADII.xl,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    overflow: "hidden",
  },
  fullWidth: { width: "100%" },
  primary: { backgroundColor: COLORS.emerald },
  secondary: {
    backgroundColor: COLORS.surfaceStrong,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.35)",
  },
  ghost: { backgroundColor: "transparent" },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  labelMuted: { color: COLORS.textMuted },
  pressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.92,
  },
  disabled: { opacity: 0.5 },
})
