// hooks/index.ts
// Single import point for all custom hooks.
// Usage: import { useAuth, useCart, usePlants } from "@/hooks"

// ── Utility hooks ─────────────────────────────────────────────────────────────
export { useInView }     from "./useInView"
export { useCountUp }    from "./useCountUp"
export { useMouseDrag }  from "./useMouseDrag"

// ── Feature hooks ─────────────────────────────────────────────────────────────
export { useAuth }        from "./useAuth"
export { useCart }        from "./useCart"
export { useEcoStats }    from "./useEcoStats"
export { useLeaderboard } from "./useLeaderboard"
export { useOrders }      from "./useOrders"
export { usePlants }      from "./usePlants"
export { useProducts, useProduct } from "./useProducts"

// ── Type exports ──────────────────────────────────────────────────────────────
export type { AuthUser }                                                    from "./useAuth"
export type { CartItemData, CartProduct }                                   from "./useCart"
export type { EcoStats }                                                    from "./useEcoStats"
export type { LeaderboardEntry, MyRank }                                    from "./useLeaderboard"
export type { Order, OrderItem, CreateOrderPayload, OrderStatus, PaymentStatus } from "./useOrders"
export type { Plant, GrowthLog, PlantStage, RegisterPlantPayload }          from "./usePlants"
export type { Product, ProductImage, ProductFilters }                       from "./useProducts"