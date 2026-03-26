import Link from "next/link"
import { prisma } from "@/server/db/prisma"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import {
  getLeadLikedConceptLabel,
  getLeadStatusMeta,
  getLeadWouldRecommendLabel,
  getLeadWillingToPayRangeLabel,
  getProductAvailabilityMeta,
} from "@/lib/commerce"

export const dynamic = "force-dynamic"

export default async function AdminLeadsPage() {
  const leads = await prisma.productInterestLead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          availabilityStatus: true,
        },
      },
    },
  })

  return (
    <Card variant="elevated">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-white/35">Leads</p>
        <h2 className="mt-1 text-2xl text-white" style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}>
          Interest table
        </h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/8">
        <table className="min-w-full divide-y divide-white/8 text-left text-sm">
          <thead className="bg-white/4 text-white/45">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Signals</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {leads.map((lead) => {
              const status = getLeadStatusMeta(lead.status)
              const availability = getProductAvailabilityMeta(lead.product.availabilityStatus)
              return (
                <tr key={lead.id} className="bg-black/10">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{lead.name}</div>
                    <div className="text-xs text-white/35">{lead.city ?? "No city"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <Link href={`/admin/products/${lead.product.slug}`} className="font-medium text-white hover:text-emerald-200">
                        {lead.product.name}
                      </Link>
                      <Badge variant={availability.badge as never}>{availability.label}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/75">
                    <div>{lead.email}</div>
                    <div className="text-white/45">{lead.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-white/75">
                    <div>Liked: {getLeadLikedConceptLabel(lead.likedConcept)}</div>
                    <div>Pay: {getLeadWillingToPayRangeLabel(lead.willingToPayRange)}</div>
                    <div>Recommend: {getLeadWouldRecommendLabel(lead.wouldRecommend)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={status.badge as never}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {new Date(lead.createdAt).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-emerald-300 hover:text-emerald-200">
                      View
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
