import Link from "next/link"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/leads", label: "Leads" },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login?redirect=/admin")
  }

  if (session.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[28px] border border-white/8 bg-white/4 px-5 py-4 backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300/80">
              Admin panel
            </p>
            <h1 className="mt-2 text-3xl text-white" style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}>
              Lean validation dashboard
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition-colors hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
