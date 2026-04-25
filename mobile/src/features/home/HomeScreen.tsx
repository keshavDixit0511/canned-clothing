import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useRouter, Link } from "expo-router"
import { Feather } from "@expo/vector-icons"
import Animated, { FadeInDown } from "react-native-reanimated"
import { Screen } from "@/components/layout/Screen"
import { Card, CardHeader } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Section } from "@/components/ui/Section"
import { COLORS, RADII } from "@/config/theme"
import { useAuthStore } from "@/store/auth.store"

const storySteps = [
  { title: "Unbox", icon: "ðŸ“¦", copy: "A brushed aluminum tin arrives with the shirt and seed story inside." },
  { title: "Wear", icon: "ðŸ‘•", copy: "Bamboo-spandex performance wear built for a smooth, premium feel." },
  { title: "Plant", icon: "ðŸŒ±", copy: "The tin becomes a micro garden kit, so the packaging keeps living." },
  { title: "Track", icon: "ðŸ“±", copy: "Scan the QR to register your plant, log growth, and collect points." },
]

const quickPaths = [
  { title: "Shop", href: "/shop", icon: "ðŸ›ï¸" },
  { title: "Grow", href: "/grow", icon: "ðŸŒ±" },
  { title: "Impact", href: "/impact", icon: "ðŸŒ" },
  { title: "Account", href: "/account", icon: "ðŸ‘¤" },
]

export function HomeScreen() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.hero}>
          <Badge tone="emerald">ESTHETIQUE | Sustainable fashion</Badge>
          <Text style={styles.kicker}>{greeting}{user?.name ? `, ${user.name}` : ""}</Text>
          <Text style={styles.title}>
            WEAR IT.
            {"\n"}PLANT IT.
            {"\n"}<Text style={styles.titleAccent}>GROW IT.</Text>
          </Text>
          <Text style={styles.body}>
            Premium bamboo-spandex performance wear delivered in a brushed aluminum tin, with a seed story inside.
          </Text>

          <View style={styles.ctaRow}>
            <Button title="Shop The Seeded Shirt" onPress={() => router.push("/shop")} />
            <Button title="How It Works" variant="secondary" onPress={() => router.push("/grow")} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Card>
            <CardHeader
              eyebrow="Brand promise"
              title="A shirt that grows beyond the closet"
              subtitle="This app keeps the same core idea as the web product, but shapes it for native mobile."
            />
            <View style={styles.traits}>
              <Badge tone="emerald">Premium metal + fabric</Badge>
              <Badge tone="sky">Zero plastic storytelling</Badge>
              <Badge tone="amber">Made for the garden loop</Badge>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={{ gap: 12 }}>
          <Section
            eyebrow="The loop"
            title="Wear. Plant. Track."
            subtitle="The mobile experience keeps the tin-to-garden journey visible from the first screen."
          />
          <View style={styles.storyGrid}>
            {storySteps.map((step) => (
              <Card key={step.title} style={styles.storyCard}>
                <Text style={styles.storyIcon}>{step.icon}</Text>
                <Text style={styles.storyTitle}>{step.title}</Text>
                <Text style={styles.storyCopy}>{step.copy}</Text>
              </Card>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ gap: 12 }}>
          <Section
            eyebrow="Quick paths"
            title="Move through the brand"
            subtitle="These paths will expand as product, growth, and impact features come online."
          />
          <View style={styles.quickGrid}>
            {quickPaths.map((item) => (
              <Link key={item.href} href={item.href} asChild>
                <Pressable style={styles.quickCard}>
                  <Text style={styles.quickIcon}>{item.icon}</Text>
                  <Text style={styles.quickTitle}>{item.title}</Text>
                  <Text style={styles.quickHint}>Open</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(500)}>
          <Card>
            <CardHeader
              eyebrow="Native-first"
              title="Designed for thumb speed"
              subtitle="Fewer surfaces, clearer hierarchy, and more intentional motion than the website."
              right={<Feather name="smartphone" size={18} color={COLORS.emerald} />}
            />
            <View style={styles.actionRow}>
              <Button title="Open Instagram" variant="outline" onPress={() => Linking.openURL("https://instagram.com")} />
              <Button title="Open X" variant="ghost" onPress={() => Linking.openURL("https://twitter.com")} />
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  scroll: {
    gap: 16,
    paddingBottom: 28,
  },
  hero: {
    gap: 14,
    paddingTop: 6,
    paddingBottom: 4,
  },
  kicker: {
    color: "rgba(244,247,242,0.58)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.text,
    fontSize: 44,
    lineHeight: 42,
    fontWeight: "900",
    letterSpacing: -1.8,
  },
  titleAccent: {
    color: COLORS.emerald,
  },
  body: {
    color: COLORS.textSoft,
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 360,
  },
  ctaRow: {
    gap: 10,
    marginTop: 6,
  },
  traits: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  storyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  storyCard: {
    width: "48%",
    minHeight: 150,
    gap: 8,
  },
  storyIcon: {
    fontSize: 28,
  },
  storyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  storyCopy: {
    color: COLORS.textSoft,
    fontSize: 12,
    lineHeight: 18,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickCard: {
    width: "48%",
    borderRadius: RADII["2xl"],
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 16,
    gap: 6,
  },
  quickIcon: {
    fontSize: 22,
  },
  quickTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },
  quickHint: {
    color: COLORS.textSoft,
    fontSize: 12,
  },
  actionRow: {
    gap: 10,
    marginTop: 4,
  },
})

