// components/layout/Header.tsx

"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { useCart } from "@/hooks/useCart"
import { useCartStore } from "@/store/cartStore"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

interface UserStats {
  name: string
  image: string | null
  plantsCount: number
  leaderboardPoints: number
  leaderboardRank: number | null
}

// ─── Logo ──────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
      <div className={cn(
        "relative h-8 w-8 rounded-lg border border-emerald-400/30 bg-emerald-400/10",
        "flex items-center justify-center",
        "group-hover:border-emerald-400/60 transition-all duration-300"
      )}>
        <span className="text-base">🥫</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-['Syne'] text-[15px] font-black tracking-tight text-white">
          Canned
        </span>
        <span className="font-['Syne'] text-[9px] font-bold tracking-[0.22em] text-emerald-400 uppercase">
          Clothing
        </span>
      </div>
    </Link>
  )
}

// ─── Search ────────────────────────────────────────────────────────────────────

function SearchBar() {
  const router = useRouter()
  const [q, setQ] = useState("")
  const [focused, setFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) {
      router.push(`/products?search=${encodeURIComponent(q.trim())}`)
      setQ("")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "hidden md:flex items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-300",
        "bg-white/5 backdrop-blur-sm",
        focused
          ? "border-emerald-400/40 w-64 shadow-lg shadow-emerald-900/20"
          : "border-white/10 w-52"
      )}
    >
      <svg
        className={cn("h-3.5 w-3.5 shrink-0 transition-colors", focused ? "text-emerald-400" : "text-white/30")}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search products..."
        className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/25 focus:outline-none"
      />
    </form>
  )
}

// ─── Plants Pill ───────────────────────────────────────────────────────────────

function PlantsPill({ count, rank, points }: {
  count: number
  rank: number | null
  points: number
}) {
  return (
    <Link
      href="/dashboard/plants"
      className={cn(
        "hidden lg:flex items-center gap-2 rounded-xl border px-3 py-1.5",
        "border-emerald-400/20 bg-emerald-400/8 hover:bg-emerald-400/15",
        "transition-all duration-200 group"
      )}
    >
      {/* Plant count */}
      <div className="flex items-center gap-1.5">
        <span
          key={`plants-pill-${count}`}
          className={cn(
            "text-base transition-transform duration-300",
            "animate-[pulse_0.6s_ease]"
          )}
        >
          🌱
        </span>
        <div className="flex flex-col leading-none">
          <span className="font-['Syne'] text-sm font-bold text-emerald-400">
            {count}
          </span>
          <span className="text-[9px] text-white/30 uppercase tracking-wider">plants</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-white/10" />

      {/* Leaderboard rank */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm">⭐</span>
        <div className="flex flex-col leading-none">
          <span className="font-['Syne'] text-sm font-bold text-amber-400">
            {points.toLocaleString("en-IN")}
          </span>
          <span className="text-[9px] text-white/30 uppercase tracking-wider">
            {rank ? `#${rank}` : "unranked"}
          </span>
        </div>
      </div>

      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ boxShadow: "0 0 16px rgba(52,211,153,0.15)" }} />
    </Link>
  )
}

// ─── Cart Button ───────────────────────────────────────────────────────────────

function CartButton() {
  const { items } = useCartStore()
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <Link
      href="/cart"
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-xl",
        "border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
        "transition-all duration-200"
      )}
      aria-label={`Cart — ${count} items`}
    >
      <svg className="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {count > 0 && (
        <span
          key={`cart-count-${count}`}
          className={cn(
          "absolute -top-1.5 -right-1.5 h-4 min-w-4 rounded-full",
          "bg-emerald-500 text-[9px] font-bold text-white",
          "flex items-center justify-center px-0.5",
          // Re-mounting this badge on count changes restarts the pulse animation
          // without effect-driven state updates that can fight React's lint rules.
          "transition-transform duration-300 animate-[pulse_0.4s_ease]"
        )}>
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}

// ─── User Dropdown ─────────────────────────────────────────────────────────────

function UserMenu({ user }: { user: UserStats }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")

  const menuItems = [
    { label: "Dashboard",   href: "/dashboard",          emoji: "📊" },
    { label: "My Plants",   href: "/dashboard/plants",   emoji: "🌱" },
    { label: "Eco Impact",  href: "/dashboard/eco-impact", emoji: "🌍" },
    { label: "Leaderboard", href: "/dashboard/leaderboard", emoji: "🏆" },
    { label: "Orders",      href: "/orders",              emoji: "📦" },
    { label: "Profile",     href: "/dashboard/profile",   emoji: "👤" },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          "border border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10",
          "transition-all duration-200 overflow-hidden"
        )}
        aria-label="User menu"
      >
        {user.image ? (
          <Image src={user.image} alt={user.name} fill sizes="36px" className="object-cover" />
        ) : (
          <span className="font-['Syne'] text-xs font-bold text-white/70">{initials}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className={cn(
          "absolute right-0 top-full mt-2 w-56 z-50",
          "rounded-2xl border border-white/10 bg-[#0a1a10]/95 backdrop-blur-xl shadow-2xl shadow-black/50",
          "animate-[fadeDown_0.2s_ease]"
        )}>
          {/* User info */}
          <div className="border-b border-white/8 px-4 py-3">
            <p className="font-['Syne'] text-sm font-bold text-white truncate">{user.name}</p>
            <div className="mt-1.5 flex items-center gap-3">
              <span className="text-xs text-emerald-400">🌱 {user.plantsCount} plants</span>
              <span className="text-xs text-amber-400">⭐ {user.leaderboardPoints.toLocaleString("en-IN")} pts</span>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5 space-y-0.5">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2",
                  "text-sm text-white/60 hover:text-white hover:bg-white/8",
                  "transition-all duration-150"
                )}
              >
                <span className="text-base w-5 text-center">{item.emoji}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-white/8 p-1.5">
            <button
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2",
                "text-sm text-red-400/70 hover:text-red-400 hover:bg-red-400/8",
                "transition-all duration-150"
              )}
            >
              <span className="text-base w-5 text-center">🚪</span>
              Sign out
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ─── Header ────────────────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<UserStats | null>(null)
  const [scrolled, setScrolled] = useState(false)

  // Hydrate the cart store from the server in one stable global location.
  useCart()

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Fetch user + stats
  useEffect(() => {
    ;(async () => {
      try {
        const [ecoRes, lbRes, profileRes] = await Promise.all([
          fetch("/api/eco", { credentials: "include", cache: "no-store" }),
          fetch("/api/leaderboard/me", { credentials: "include", cache: "no-store" }),
          fetch("/api/profile", { credentials: "include", cache: "no-store" }),
        ])
        if (!ecoRes.ok || !profileRes.ok) {
          setUser(null)
          return
        }
        const [eco, lb, profile] = await Promise.all([
          ecoRes.json(),
          lbRes.ok ? lbRes.json() : { points: 0, rank: null },
          profileRes.json(),
        ])
        setUser({
          name: profile.name ?? "Grower",
          image: profile.image ?? null,
          plantsCount: eco.treesPlanted ?? 0,
          leaderboardPoints: lb.points ?? 0,
          leaderboardRank: lb.rank ?? null,
        })
      } catch {
        // Not logged in — header renders without user section
      }
    })()
  }, [pathname])

  const navLinks = [
    { label: "Shop",       href: "/products" },
    { label: "Dashboard",  href: "/dashboard" },
    { label: "Leaderboard", href: "/dashboard/leaderboard" },
  ]

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
      scrolled
        ? "border-b border-white/8 bg-[#050d0a]/90 backdrop-blur-xl shadow-lg shadow-black/30"
        : "bg-transparent"
    )}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">

        {/* Logo */}
        <Logo />

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/")
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-white/8 text-white"
                    : "text-white/50 hover:text-white/90 hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <SearchBar />

        {/* Plants + leaderboard pill */}
        {user && (
          <PlantsPill
            count={user.plantsCount}
            rank={user.leaderboardRank}
            points={user.leaderboardPoints}
          />
        )}

        {/* Cart */}
        <CartButton />

        {/* User menu or auth links */}
        {user ? (
          <UserMenu user={user} />
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium text-white/50 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className={cn(
                "rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5",
                "text-sm font-semibold text-emerald-400",
                "hover:bg-emerald-400/20 hover:border-emerald-400/50 transition-all duration-200"
              )}
            >
              Get started
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
