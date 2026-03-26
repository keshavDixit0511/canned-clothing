"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input, Textarea, Select } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import {
  LEAD_STATUSES,
  getLeadLikedConceptLabel,
  getLeadStatusMeta,
  getLeadWouldRecommendLabel,
  getLeadWillingToPayRangeLabel,
  getProductAvailabilityMeta,
} from "@/lib/commerce"

type Lead = {
  id: string
  name: string
  email: string
  phone: string
  city: string | null
  likedConcept: string
  willingToPayRange: string
  wouldRecommend: string
  comment: string | null
  status: string
  adminNotes: string | null
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    slug: string
    availabilityStatus: string
  }
}

export default function AdminLeadDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [status, setStatus] = useState("NEW")
  const [adminNotes, setAdminNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    let mounted = true

    async function loadLead() {
      try {
        const response = await fetch(`/api/leads/${id}`, { credentials: "include" })
        const data = await response.json()
        if (!mounted) return

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load lead")
        }

        setLead(data)
        setStatus(data.status)
        setAdminNotes(data.adminNotes ?? "")
      } catch (cause) {
        if (!mounted) return
        setError(cause instanceof Error ? cause.message : "Failed to load lead")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadLead()

    return () => {
      mounted = false
    }
  }, [id])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, adminNotes }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update lead")
      }

      setLead(data)
      setSuccess("Lead saved.")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to update lead")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card variant="elevated">
        <p className="text-white/60">Loading lead...</p>
      </Card>
    )
  }

  if (!lead) {
    return (
      <Card variant="elevated">
        <p className="text-white/60">{error || "Lead not found."}</p>
      </Card>
    )
  }

  const statusMeta = getLeadStatusMeta(status)
  const availability = getProductAvailabilityMeta(lead.product.availabilityStatus)

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/35">Lead detail</p>
            <h2 className="mt-1 text-2xl text-white" style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}>
              {lead.name}
            </h2>
            <p className="mt-2 text-sm text-white/45">{lead.product.name}</p>
          </div>
          <div className="space-y-2 text-right">
            <Badge variant={statusMeta.badge as never}>{statusMeta.label}</Badge>
            <div>
              <Badge variant={availability.badge as never}>{availability.label}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card variant="elevated">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Name" value={lead.name} readOnly />
            <Input label="Email" value={lead.email} readOnly />
            <Input label="Phone" value={lead.phone} readOnly />
            <Input label="City" value={lead.city ?? ""} readOnly />
            <Input label="Liked concept" value={getLeadLikedConceptLabel(lead.likedConcept)} readOnly />
            <Input label="Would recommend" value={getLeadWouldRecommendLabel(lead.wouldRecommend)} readOnly />
            <Input label="Willing to pay" value={getLeadWillingToPayRangeLabel(lead.willingToPayRange)} readOnly />
            <div className="flex items-end">
              <Link href={`/admin/products/${lead.product.slug}`} className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
                Open product
              </Link>
            </div>
            <div className="md:col-span-2">
              <Textarea label="Customer comment" value={lead.comment ?? ""} readOnly rows={4} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Follow-up status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={LEAD_STATUSES.map((value) => ({
                value,
                label: getLeadStatusMeta(value).label,
              }))}
            />
            <Textarea
              label="Admin notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={6}
            />
          </div>

          {error && (
            <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {success}
            </p>
          )}

          <Button type="submit" variant="eco" loading={saving}>
            Save lead
          </Button>
        </form>
      </Card>
    </div>
  )
}
