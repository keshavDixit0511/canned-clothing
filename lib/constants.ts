// ─── App Meta ─────────────────────────────────────────────────────────────────

export const APP_NAME    = "ESTHETIQUE"
export const APP_TAGLINE = "Where style meets purpose."
export const APP_SEO_DESCRIPTION =
  "ESTHETIQUE is an eco-friendly clothing brand where style meets purpose, blending sustainable fashion, plant-based impact, and modern everyday wear."
export const APP_URL     = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const AUTH_COOKIE_NAME  = "token"
export const AUTH_TOKEN_EXPIRY = "7d"          // must match jwt.ts
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7  // 7 days in seconds

// ─── Routes ───────────────────────────────────────────────────────────────────

export const ROUTES = {
  home:       "/",
  login:      "/login",
  register:   "/register",
  products:   "/products",
  product:    (slug: string) => `/products/${slug}`,
  cart:       "/cart",
  checkout:   "/checkout",
  orders:     "/orders",
  scan:       (code: string) => `/scan/${code}`,

  dashboard:          "/dashboard",
  dashboardEco:       "/dashboard/eco-impact",
  dashboardLeader:    "/dashboard/leaderboard",
  dashboardPlants:    "/dashboard/plants",
  dashboardProfile:   "/dashboard/profile",
} as const

export const PROTECTED_ROUTES = [
  "/dashboard",
  "/cart",
  "/checkout",
  "/orders",
] as const

// ─── API Routes ───────────────────────────────────────────────────────────────

export const API = {
  auth: {
    login:    "/api/auth/login",
    register: "/api/auth/register",
    logout:   "/api/auth/logout",
  },
  products:       "/api/products",
  product:        (slug: string) => `/api/products/${slug}`,
  cart:           "/api/cart",
  orders:         "/api/orders",
  eco:            "/api/eco",
  payment:        "/api/payment",
  plants:         "/api/plant",
  plantLog:       "/api/plant/log",
  plantReminder:  "/api/plant/reminder",
  plantRegister:  "/api/plant/register",
  profile:        "/api/profile",
  upload:         "/api/upload",
} as const

// ─── Pagination ───────────────────────────────────────────────────────────────

export const PAGINATION = {
  defaultPage:     1,
  defaultPageSize: 12,
  maxPageSize:     50,
} as const

// ─── Plant System ─────────────────────────────────────────────────────────────

export const PLANT_STAGES = ["SEEDED", "SPROUT", "GROWING", "MATURE"] as const

export const PLANT_STAGE_LABELS: Record<string, string> = {
  SEEDED:  "Seeded",
  SPROUT:  "Sprouting",
  GROWING: "Growing",
  MATURE:  "Mature",
}

export const PLANT_STAGE_EMOJI: Record<string, string> = {
  SEEDED:  "🌱",
  SPROUT:  "🌿",
  GROWING: "🪴",
  MATURE:  "🌳",
}

/** Points awarded per stage progression */
export const PLANT_STAGE_POINTS: Record<string, number> = {
  SEEDED:  5,
  SPROUT:  10,
  GROWING: 20,
  MATURE:  50,
}

/** Estimated kg of CO2 offset per mature plant per year */
export const CO2_KG_PER_PLANT = 21

/** Eco score multiplier per plant registered */
export const ECO_SCORE_PER_PLANT = 10

// ─── Order System ─────────────────────────────────────────────────────────────

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING:   "Pending",
  PAID:      "Paid",
  SHIPPED:   "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING:   "text-amber-400 bg-amber-400/10 border-amber-400/30",
  PAID:      "text-sky-400 bg-sky-400/10 border-sky-400/30",
  SHIPPED:   "text-violet-400 bg-violet-400/10 border-violet-400/30",
  DELIVERED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  CANCELLED: "text-red-400 bg-red-400/10 border-red-400/30",
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export const PAYMENT_PROVIDERS = ["RAZORPAY", "STRIPE"] as const

export const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED"] as const

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  SUCCESS: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  FAILED:  "text-red-400 bg-red-400/10 border-red-400/30",
}

// ─── File Upload ──────────────────────────────────────────────────────────────

export const UPLOAD = {
  maxSizeMB:       5,
  maxSizeBytes:    5 * 1024 * 1024,
  allowedTypes:    ["image/jpeg", "image/png", "image/webp"] as const,
  allowedExts:     [".jpg", ".jpeg", ".png", ".webp"] as const,
} as const

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export const LEADERBOARD_PAGE_SIZE = 10

// ─── Redis / Cache TTLs (seconds) ─────────────────────────────────────────────

export const CACHE_TTL = {
  products:    60 * 10,   // 10 minutes
  product:     60 * 5,    // 5 minutes
  eco:         60 * 2,    // 2 minutes
  leaderboard: 60 * 1,    // 1 minute
} as const
