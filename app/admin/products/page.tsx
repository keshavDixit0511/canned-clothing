import Link from "next/link"
import { prisma } from "@/server/db/prisma"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { getProductAvailabilityMeta } from "@/lib/commerce"

export const dynamic = "force-dynamic"

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: { order: "asc" } },
      _count: { select: { interestLeads: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <Card variant="elevated">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/35">Products</p>
          <h2 className="mt-1 text-2xl text-white" style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}>
            Availability control
          </h2>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-emerald-300/50 hover:bg-emerald-400/20 hover:text-emerald-100"
        >
          Add product
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/8">
        <table className="min-w-full divide-y divide-white/8 text-left text-sm">
          <thead className="bg-white/4 text-white/45">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Leads</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {products.map((product) => {
              const availability = getProductAvailabilityMeta(product.availabilityStatus)
              return (
                <tr key={product.id} className="bg-black/10">
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <Link href={`/admin/products/${product.slug}`} className="font-medium text-white hover:text-emerald-200">
                        {product.name}
                      </Link>
                      <p className="text-xs text-white/35">{product.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={availability.badge as never}>{availability.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-white/75">{product.stock}</td>
                  <td className="px-4 py-3 text-white/75">{product._count.interestLeads}</td>
                  <td className="px-4 py-3 text-white/75">{formatINR(product.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/products/${product.slug}`} className="font-semibold text-emerald-300 hover:text-emerald-200">
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
