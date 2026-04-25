import { useLocalSearchParams } from "expo-router"
import { ComingSoonScreen } from "@/features/coming-soon/ComingSoonScreen"

export default function ProductRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>()

  return (
    <ComingSoonScreen
      eyebrow="Phase 2"
      title={slug ? `Product: ${slug}` : "Product detail"}
      description="The native product detail screen will mirror the premium web story while adapting to mobile."
    />
  )
}
