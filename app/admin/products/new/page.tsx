import { Card } from "@/components/ui/Card"
import { ProductForm } from "@/components/admin/ProductForm"

export const dynamic = "force-dynamic"

const emptyProduct = {
  slug: "",
  name: "",
  description: "",
  price: 0,
  stock: 0,
  activity: "",
  seedType: "",
  availabilityStatus: "IN_STOCK",
  images: [],
}

export default function AdminProductCreatePage() {
  return (
    <Card variant="elevated">
      <ProductForm mode="create" product={emptyProduct} />
    </Card>
  )
}
