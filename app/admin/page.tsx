import Link from "next/link"
import { prisma } from "@/server/db/prisma"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { getProductAvailabilityMeta, getLeadWillingToPayRangeLabel } from "@/lib/commerce"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const [totalProducts, totalLeads, newLeads, products, leadRanges] = await Promise.all([
    prisma.product.count(),
    prisma.productInterestLead.count(),
    prisma.productInterestLead.count({ where: { status: "NEW" } }),
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        availabilityStatus: true,
        _count: { select: { interestLeads: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.productInterestLead.groupBy({
      by: ["willingToPayRange"],
      _count: { willingToPayRange: true },
      orderBy: { _count: { willingToPayRange: "desc" } },
    }),
  ])

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <Card variant="elevated">
          <p className="text-xs uppercase tracking-[0.2em] text-white/35">Products</p>
          <p className="mt-3 text-4xl text-white" style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}>
            {totalProducts}
          </p>
        </Card>
        <Card variant="elevated">
          <p className="text-xs uppercase tracking-[0.2em] text-white/35">Leads</p>
          <p className="mt-3 text-4xl text-white" style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}>
            {totalLeads}
          </p>
        </Card>
        <Card variant="elevated">
          <p className="text-xs uppercase tracking-[0.2em] text-white/35">New leads</p>
          <p className="mt-3 text-4xl text-white" style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}>
            {newLeads}
          </p>
        </Card>
        <Card variant="elevated">
          <p className="text-xs uppercase tracking-[0.2em] text-white/35">Validation stage</p>
          <p className="mt-3 text-lg font-semibold text-white">Lean launch focus</p>
          <p className="mt-1 text-sm text-white/45">Collect interest before scaling inventory.</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <Card variant="elevated">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">Lead mix</p>
              <h2 className="mt-1 text-2xl text-white" style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}>
                By product
              </h2>
            </div>
            <Link href="/admin/leads" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
              View all leads
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/8">
            <table className="min-w-full divide-y divide-white/8 text-left text-sm">
              <thead className="bg-white/4 text-white/45">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Availability</th>
                  <th className="px-4 py-3 font-medium">Leads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {products.map((product) => {
                  const availability = getProductAvailabilityMeta(product.availabilityStatus)
                  return (
                    <tr key={product.id} className="bg-black/10">
                      <td className="px-4 py-3">
                        <Link href={`/admin/products/${product.slug}`} className="font-medium text-white hover:text-emerald-200">
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={availability.badge as never}>{availability.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-white/80">{product._count.interestLeads}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card variant="elevated">
          <p className="text-xs uppercase tracking-[0.2em] text-white/35">Price interest</p>
          <h2 className="mt-1 text-2xl text-white" style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}>
            Expectation bands
          </h2>
          <div className="mt-5 space-y-3">
            {leadRanges.length === 0 ? (
              <p className="text-sm text-white/45">No pricing feedback yet.</p>
            ) : (
              leadRanges.map((row) => (
                <div key={row.willingToPayRange} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                  <span className="text-sm text-white/70">{getLeadWillingToPayRangeLabel(row.willingToPayRange)}</span>
                  <span className="text-sm font-semibold text-white">{row._count.willingToPayRange}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
