// types/product.ts

export interface ProductImage {
  id:        string
  url:       string
  order:     number
  productId: string
  createdAt: string
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

export interface ProductSummary {
  id:       string
  name:     string
  slug:     string
  price:    number
  stock:    number
  seedType: string
  images:   Pick<ProductImage, "url" | "order">[]
}

export interface CreateProductInput {
  name:        string
  slug:        string
  description: string
  price:       number
  stock:       number
  activity:    string
  seedType:    string
  images?:     Pick<ProductImage, "url" | "order">[]
}

export interface UpdateProductInput {
  name?:        string
  description?: string
  price?:       number
  stock?:       number
  activity?:    string
  seedType?:    string
}

export type ProductSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "name_asc"

export interface ProductFilters {
  search?:   string
  seedType?: string
  sort?:     ProductSortOption
  page?:     number
  limit?:    number
}

export interface PaginatedProducts {
  products: Product[]
  total:    number
  page:     number
  limit:    number
  pages:    number
}