import { forwardRef } from "react"
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native"
import { COLORS, RADII } from "@/config/theme"

type InputProps = TextInputProps & {
  label?: string
  error?: string
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, style, ...props },
  ref
) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor="rgba(244,247,242,0.28)"
        style={[
          styles.input,
          error ? styles.error : styles.default,
          style,
        ]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
})

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  label: {
    color: "rgba(244,247,242,0.56)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  input: {
    minHeight: 52,
    borderRadius: RADII.xl,
    borderWidth: 1,
    paddingHorizontal: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  default: { borderColor: COLORS.border },
  error: { borderColor: "rgba(248,113,113,0.45)" },
  errorText: {
    color: "rgba(248,113,113,0.94)",
    fontSize: 12,
  },
})
