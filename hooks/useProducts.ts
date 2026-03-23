// hooks/useProducts.ts
"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { getErrorMessage } from "@/lib/error-message"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductImage {
  id:        string
  url:       string
  order:     number
}

export interface Product {
  id:          string
  name:        string
  slug:        string
  description: string
  price:       number
  stock:       number
  activity:    string
  seedType:    string
  images:      ProductImage[]
  createdAt:   string
  updatedAt:   string
}

export interface ProductFilters {
  seedType?:  string
  activity?:  string
  minPrice?:  number
  maxPrice?:  number
  inStock?:   boolean
  search?:    string
}

interface ProductsState {
  products: Product[]
  loading:  boolean
  error:    string | null
}

interface SingleProductState {
  product: Product | null
  loading: boolean
  error:   string | null
}

// ─── useProducts — full list with client-side filtering ───────────────────────

export function useProducts(filters?: ProductFilters) {
  const [state, setState] = useState<ProductsState>({
    products: [],
    loading:  true,
    error:    null,
  })

  const fetchProducts = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      // Build query params for server-side filtering if available
      const params = new URLSearchParams()
      if (filters?.seedType) params.set("seedType", filters.seedType)
      if (filters?.activity) params.set("activity", filters.activity)

      const url = `/api/products${params.toString() ? `?${params}` : ""}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch products")
      const data = await res.json()
      setState({ products: Array.isArray(data) ? data : [], loading: false, error: null })
    } catch (error: unknown) {
      setState((s) => ({ ...s, loading: false, error: getErrorMessage(error, "Failed to load products") }))
    }
  }, [filters?.seedType, filters?.activity])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // ── Client-side filters ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...state.products]

    if (filters?.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.seedType.toLowerCase().includes(q)
      )
    }
    if (filters?.inStock) {
      list = list.filter((p) => p.stock > 0)
    }
    if (filters?.minPrice !== undefined) {
      list = list.filter((p) => p.price >= filters.minPrice!)
    }
    if (filters?.maxPrice !== undefined) {
      list = list.filter((p) => p.price <= filters.maxPrice!)
    }

    return list
  }, [state.products, filters?.search, filters?.inStock, filters?.minPrice, filters?.maxPrice])

  // ── Derived ───────────────────────────────────────────────────────────────
  const seedTypes  = useMemo(
    () => [...new Set(state.products.map((p) => p.seedType))].sort(),
    [state.products]
  )
  const activities = useMemo(
    () => [...new Set(state.products.map((p) => p.activity))].sort(),
    [state.products]
  )

  return {
    products:    filtered,
    allProducts: state.products,
    loading:     state.loading,
    error:       state.error,
    total:       filtered.length,
    seedTypes,
    activities,
    isEmpty:     filtered.length === 0 && !state.loading,
    refetch:     fetchProducts,
  }
}

// ─── useProduct — single product by slug ──────────────────────────────────────

export function useProduct(slug: string | null) {
  const [state, setState] = useState<SingleProductState>({
    product: null,
    loading: !!slug,
    error:   null,
  })

  const fetchProduct = useCallback(async () => {
    if (!slug) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch(`/api/products/${slug}`)
      if (res.status === 404) {
        setState({ product: null, loading: false, error: "Product not found" })
        return
      }
      if (!res.ok) throw new Error("Failed to fetch product")
      const data = await res.json()
      setState({ product: data, loading: false, error: null })
    } catch (error: unknown) {
      setState((s) => ({ ...s, loading: false, error: getErrorMessage(error, "Failed to load product") }))
    }
  }, [slug])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  // ── Derived ───────────────────────────────────────────────────────────────
  const primaryImage = state.product?.images.sort((a, b) => a.order - b.order)[0]?.url ?? null
  const inStock      = (state.product?.stock ?? 0) > 0
  const isLowStock   = (state.product?.stock ?? 0) > 0 && (state.product?.stock ?? 0) <= 5

  return {
    product:      state.product,
    loading:      state.loading,
    error:        state.error,
    primaryImage,
    inStock,
    isLowStock,
    refetch:      fetchProduct,
  }
}
