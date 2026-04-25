import type { ReactNode } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Link } from "expo-router"
import { useRouter } from "expo-router"
import { useMutation } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/validators"
import { login, register } from "./auth.api"
import { useAuthStore } from "@/store/auth.store"
import { Screen } from "@/components/layout/Screen"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { COLORS } from "@/config/theme"

function AuthFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Screen>
      <View style={styles.root}>
        <Card>
          <View style={{ gap: 16 }}>
            <Badge tone="emerald">{eyebrow}</Badge>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            {children}
          </View>
        </Card>
      </View>
    </Screen>
  )
}

export function LoginForm() {
  const router = useRouter()
  const setSession = useAuthStore((state) => state.setSession)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      await setSession({ token: data.token, user: data.user })
      router.replace("/account")
    },
  })

  return (
    <AuthFrame
      eyebrow="Account access"
      title="Welcome back"
      description="Sign in to continue your premium eco-commerce and plant tracking journey."
    >
      <View style={{ gap: 14 }}>
        <Controller
          control={form.control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={form.formState.errors.email?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Password"
              placeholder="Password"
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={form.formState.errors.password?.message}
            />
          )}
        />
      </View>

      {mutation.isError ? (
        <Text style={styles.error}>
          {mutation.error instanceof Error ? mutation.error.message : "Something went wrong."}
        </Text>
      ) : null}

      <View style={{ gap: 10 }}>
        <Button
          title="Sign in"
          onPress={form.handleSubmit((values) => mutation.mutate(values))}
          loading={mutation.isPending}
        />

      <Link href="/register" asChild>
        <Pressable>
          <Text style={styles.link}>New here? Create an account</Text>
        </Pressable>
      </Link>
      </View>
    </AuthFrame>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const setSession = useAuthStore((state) => state.setSession)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onSubmit",
  })

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: async (data) => {
      await setSession({ token: data.token, user: data.user })
      router.replace("/account")
    },
  })

  return (
    <AuthFrame
      eyebrow="Create account"
      title="Join the grow list"
      description="Create your account to buy tins, register plants, and track your impact."
    >
      <View style={{ gap: 14 }}>
        <Controller
          control={form.control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Name"
              placeholder="Aman Verma"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={form.formState.errors.name?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={form.formState.errors.email?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Password"
              placeholder="At least 6 characters"
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={form.formState.errors.password?.message}
            />
          )}
        />
      </View>

      {mutation.isError ? (
        <Text style={styles.error}>
          {mutation.error instanceof Error ? mutation.error.message : "Something went wrong."}
        </Text>
      ) : null}

      <View style={{ gap: 10 }}>
        <Button
          title="Create account"
          onPress={form.handleSubmit((values) => mutation.mutate(values))}
          loading={mutation.isPending}
        />

      <Link href="/login" asChild>
        <Pressable>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </Pressable>
      </Link>
      </View>
    </AuthFrame>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  description: {
    color: COLORS.textSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  error: {
    color: "rgba(248,113,113,0.94)",
    fontSize: 13,
    fontWeight: "600",
  },
  link: {
    color: COLORS.emerald,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 2,
  },
})
