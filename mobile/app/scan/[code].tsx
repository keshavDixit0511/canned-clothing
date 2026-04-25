import { useLocalSearchParams } from "expo-router"
import { ComingSoonScreen } from "@/features/coming-soon/ComingSoonScreen"

export default function ScanRoute() {
  const { code } = useLocalSearchParams<{ code: string }>()

  return (
    <ComingSoonScreen
      eyebrow="Phase 3"
      title={code ? `Scan: ${code}` : "QR scan"}
      description="The mobile QR scan flow will let users claim tins and manage their plant journey."
    />
  )
}
