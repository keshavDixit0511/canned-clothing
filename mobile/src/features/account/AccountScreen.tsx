import { useMemo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useMutation } from "@tanstack/react-query"
import { Screen } from "@/components/layout/Screen"
import { Card, CardHeader } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { EmptyState } from "@/components/ui/EmptyState"
import { COLORS, RADII } from "@/config/theme"
import { useAuthStore } from "@/store/auth.store"
import { logout } from "@/features/auth/auth.api"

export function AccountScreen() {
  const router = useRouter()
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)

  const mutation = useMutation({
    mutationFn: logout,
    onSettled: async () => {
      await clearSession()
      router.replace("/login")
    },
  })

  const initials = useMemo(() => {
    if (!user?.name) return "CC"
    return user.name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("")
  }, [user?.name])

  return (
    <Screen>
      <View style={styles.root}>
        {status === "authenticated" && user ? (
          <>
            <Card>
              <CardHeader
                eyebrow="Account"
                title={user.name ?? "Grower"}
                subtitle={user.email}
                right={<Badge tone={user.role === "ADMIN" ? "violet" : "emerald"}>{user.role}</Badge>}
              />
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </Card>

            <Card>
              <CardHeader
                eyebrow="Next steps"
                title="Your premium mobile journey"
                subtitle="Phase 1 ships the shell. Commerce, plant, and impact screens expand in the next phases."
              />
              <View style={styles.linkGrid}>
                <QuickAction label="Home" onPress={() => router.push("/home")} />
                <QuickAction label="Shop" onPress={() => router.push("/shop")} />
                <QuickAction label="Grow" onPress={() => router.push("/grow")} />
                <QuickAction label="Impact" onPress={() => router.push("/impact")} />
              </View>
            </Card>

            <Button title="Sign out" variant="secondary" loading={mutation.isPending} onPress={() => mutation.mutate()} />
          </>
        ) : (
          <>
            <EmptyState
              icon="🫶"
              title="Sign in to continue your tin journey"
              description="Mobile auth is wired for secure bearer-token sessions, so sign in once and stay in sync with the existing backend."
              actionLabel="Go to Login"
              onAction={() => router.push("/login")}
            />
            <Button title="Create account" onPress={() => router.push("/register")} />
          </>
        )}
      </View>
    </Screen>
  )
}

function QuickAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.quickAction}>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: RADII["2xl"],
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceStrong,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  avatarText: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  linkGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },
  quickAction: {
    width: "48%",
    minHeight: 60,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
})
