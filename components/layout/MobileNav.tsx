// components/layout/MobileNav.tsx

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCartStore } from "@/store/cartStore"
import { cn } from "@/lib/utils"

// ─── Nav items ─────────────────────────────────────────────────────────────────

const MOBILE_NAV = [
  {
    label: "Shop",
    href: "/products",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    label: "Plants",
    href: "/dashboard/plants",
    icon: <span className="text-xl leading-none">🌱</span>,
  },
  {
    label: "Home",
    href: "/",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    center: true,
  },
  {
    label: "Board",
    href: "/dashboard/leaderboard",
    icon: <span className="text-xl leading-none">🏆</span>,
  },
  {
    label: "Account",
    href: "/dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

// ─── MobileNav ─────────────────────────────────────────────────────────────────

export function MobileNav() {
  const pathname  = usePathname()
  const { items } = useCartStore()
  const cartCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 md:hidden",
        "border-t border-white/8 bg-[#050d0a]/95 backdrop-blur-xl",
        "pb-[env(safe-area-inset-bottom)]"
      )}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {MOBILE_NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          // Center home button — larger + elevated
          if (item.center) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative -top-4 flex h-14 w-14 flex-col items-center justify-center",
                  "rounded-2xl border border-emerald-400/30 bg-emerald-500",
                  "shadow-lg shadow-emerald-900/50",
                  "transition-all duration-200 active:scale-95",
                  active ? "bg-emerald-400" : "hover:bg-emerald-400"
                )}
                aria-label="Home"
              >
                {item.icon}
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-1 rounded-xl transition-all duration-200",
                active ? "text-emerald-400" : "text-white/30 hover:text-white/60"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className={cn("transition-transform duration-200", active ? "scale-110" : "")}>
                {item.icon}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wide">{item.label}</span>
              {active && (
                <span className="h-0.5 w-4 rounded-full bg-emerald-400" />
              )}
            </Link>
          )
        })}

        {/* Cart tab with badge */}
        <Link
          href="/cart"
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-1 rounded-xl transition-all duration-200",
            pathname === "/cart" ? "text-emerald-400" : "text-white/30 hover:text-white/60",
            "relative"
          )}
          aria-label={`Cart — ${cartCount} items`}
        >
          <span className="relative">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-3.5 min-w-[0.875rem] rounded-full bg-emerald-500 text-[8px] font-bold text-white flex items-center justify-center px-0.5">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wide">Cart</span>
          {pathname === "/cart" && (
            <span className="h-0.5 w-4 rounded-full bg-emerald-400" />
          )}
        </Link>
      </div>
    </nav>
  )
}