import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// ─── Tailwind Class Merger ─────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(
  amount: number,
  currency: string = "INR",
  locale: string = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(
  value: number,
  locale: string = "en-IN"
): string {
  return new Intl.NumberFormat(locale).format(value)
}

// ─── Date & Time ──────────────────────────────────────────────────────────────

export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
  locale: string = "en-IN"
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date))
}

export function formatDateTime(
  date: string | Date,
  locale: string = "en-IN"
): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours   = Math.floor(minutes / 60)
  const days    = Math.floor(hours / 24)
  const weeks   = Math.floor(days / 7)
  const months  = Math.floor(days / 30)
  const years   = Math.floor(days / 365)

  if (years > 0)   return `${years}y ago`
  if (months > 0)  return `${months}mo ago`
  if (weeks > 0)   return `${weeks}w ago`
  if (days > 0)    return `${days}d ago`
  if (hours > 0)   return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return "just now"
}

export function isToday(date: string | Date): boolean {
  const d = new Date(date)
  const now = new Date()
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

// ─── String Helpers ───────────────────────────────────────────────────────────

export function capitalize(str: string): string {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function titleCase(str: string): string {
  return str
    .split(/[\s_-]+/)
    .map(capitalize)
    .join(" ")
}

export function truncate(str: string, maxLength: number, suffix = "..."): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - suffix.length).trimEnd() + suffix
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function generateInitials(name: string, max = 2): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, max)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
}

// ─── Array Helpers ────────────────────────────────────────────────────────────

export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set()
  return array.filter((item) => {
    const k = item[key]
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

export function groupBy<T>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce<Record<string, T[]>>((acc, item) => {
    const group = String(item[key])
    acc[group] = acc[group] ?? []
    acc[group].push(item)
    return acc
  }, {})
}

export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const va = a[key]
    const vb = b[key]
    if (va < vb) return direction === "asc" ? -1 : 1
    if (va > vb) return direction === "asc" ? 1 : -1
    return 0
  })
}

// ─── Object Helpers ───────────────────────────────────────────────────────────

export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach((key) => delete result[key])
  return result
}

export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach((key) => { result[key] = obj[key] })
  return result
}

export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0
}

// ─── URL & Query ──────────────────────────────────────────────────────────────

export function buildSearchParams(
  params: Record<string, string | number | boolean | null | undefined>
): string {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([key, val]) => {
    if (val !== null && val !== undefined && val !== "") {
      sp.set(key, String(val))
    }
  })
  const str = sp.toString()
  return str ? `?${str}` : ""
}

export function parseSearchParams<T extends Record<string, string>>(
  searchParams: URLSearchParams
): Partial<T> {
  const result: Record<string, string> = {}
  searchParams.forEach((val, key) => { result[key] = val })
  return result as Partial<T>
}

// ─── Validation Helpers ───────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  // Covers Indian mobile numbers: optional +91 or 0 prefix, then 10 digits
  return /^(\+91|0)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))
}

export function isValidPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode)
}

// ─── Eco / Domain Specific ────────────────────────────────────────────────────

/**
 * Calculates estimated CO2 offset in kg based on plant count.
 * Average value: ~21 kg CO2/year per small plant.
 */
export function calcCO2Saved(plantCount: number, kgPerPlant = 21): number {
  return parseFloat((plantCount * kgPerPlant).toFixed(1))
}

/**
 * Maps a PlantStage enum value to a display label.
 */
export function formatPlantStage(
  stage: "SEEDED" | "SPROUT" | "GROWING" | "MATURE"
): string {
  const map: Record<string, string> = {
    SEEDED:  "Seeded",
    SPROUT:  "Sprouting",
    GROWING: "Growing",
    MATURE:  "Mature",
  }
  return map[stage] ?? stage
}

/**
 * Maps an OrderStatus enum to a display label.
 */
export function formatOrderStatus(
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED"
): string {
  const map: Record<string, string> = {
    PENDING:   "Pending",
    PAID:      "Paid",
    SHIPPED:   "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  }
  return map[status] ?? status
}

// ─── Async Helpers ────────────────────────────────────────────────────────────

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retries an async function up to `attempts` times with exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 300
): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (i < attempts - 1) await sleep(delayMs * Math.pow(2, i))
    }
  }
  throw lastError
}

// ─── Error Handling ───────────────────────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return "An unexpected error occurred"
}

// ─── Clipboard ───────────────────────────────────────────────────────────────

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// ─── Storage (client-side only) ───────────────────────────────────────────────

export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : null
    } catch {
      return null
    }
  },
  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.warn(`storage.set failed for key: ${key}`)
    }
  },
  remove(key: string): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(key)
  },
}