import { StyleSheet, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { Screen } from "@/components/layout/Screen"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { COLORS } from "@/config/theme"

type ComingSoonScreenProps = {
  title: string
  eyebrow: string
  description: string
}

export function ComingSoonScreen({ title, eyebrow, description }: ComingSoonScreenProps) {
  const router = useRouter()

  return (
    <Screen>
      <View style={styles.root}>
        <Card>
          <View style={{ gap: 14 }}>
            <Badge tone="emerald">{eyebrow}</Badge>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            <View style={{ gap: 10 }}>
              <Button title="Back to Home" onPress={() => router.replace("/home")} />
              <Button title="Open Account" variant="secondary" onPress={() => router.replace("/account")} />
            </View>
          </View>
        </Card>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 18,
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
})
