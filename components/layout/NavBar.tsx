// components/layout/NavBar.tsx

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string
  href: string
  emoji: string
  exact?: boolean
}

interface NavBarProps {
  /** Pass extra classes to the wrapper */
  className?: string
}

// ─── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: "Home",        href: "/",                      emoji: "🏠", exact: true },
  { label: "Shop",        href: "/products",              emoji: "🛍️" },
  { label: "Dashboard",   href: "/dashboard",             emoji: "📊" },
  { label: "Plants",      href: "/dashboard/plants",      emoji: "🌱" },
  { label: "Eco Impact",  href: "/dashboard/eco-impact",  emoji: "🌍" },
  { label: "Leaderboard", href: "/dashboard/leaderboard", emoji: "🏆" },
  { label: "Orders",      href: "/orders",                emoji: "📦" },
]

// ─── NavBar ────────────────────────────────────────────────────────────────────

/**
 * Horizontal desktop navigation bar.
 * Used inside the Header — exported separately so it can also be used
 * on its own (e.g. in a sidebar or secondary layout).
 */
export function NavBar({ className }: NavBarProps) {
  const pathname = usePathname()

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <nav
      className={cn(
        "flex items-center gap-1 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-1",
        className
      )}
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-1.5 rounded-xl px-3 py-1.5",
              "text-sm font-medium transition-all duration-200",
              active
                ? "bg-emerald-400/15 text-emerald-300 border border-emerald-400/25"
                : "text-white/45 hover:text-white/80 hover:bg-white/6 border border-transparent"
            )}
            aria-current={active ? "page" : undefined}
          >
            <span className={cn("text-sm", active ? "opacity-100" : "opacity-60")}>
              {item.emoji}
            </span>
            <span className="hidden lg:block">{item.label}</span>

            {/* Active indicator dot */}
            {active && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-emerald-400/60" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}