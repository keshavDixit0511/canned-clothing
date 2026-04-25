import { Link } from "expo-router"
import { Screen } from "@/components/layout/Screen"
import { EmptyState } from "@/components/ui/EmptyState"
import { Button } from "@/components/ui/Button"

export default function NotFound() {
  return (
    <Screen>
      <EmptyState
        icon="🌑"
        title="Page not found"
        description="This route does not exist in the mobile app yet."
      />
      <Link href="/home" asChild>
        <Button title="Return Home" />
      </Link>
    </Screen>
  )
}
