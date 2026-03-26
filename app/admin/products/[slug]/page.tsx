import { notFound } from "next/navigation"
import { prisma } from "@/server/db/prisma"
import { Card } from "@/components/ui/Card"
import { ProductEditForm } from "@/components/admin/ProductEditForm"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ slug: string }> }

export default async function AdminProductEditPage({ params }: Params) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
    },
  })

  if (!product) {
    notFound()
  }

  return (
    <Card variant="elevated">
      <ProductEditForm product={product} />
    </Card>
  )
}
