// features/products/product.types.ts

export interface ProductImage {
  url:   string
  order: number
}

export interface ProductResponse {
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

export interface CreateProductInput {
  name:        string
  slug:        string
  description: string
  price:       number
  stock:       number
  activity:    string
  seedType:    string
  images?:     ProductImage[]
}

export interface UpdateProductInput {
  name?:        string
  description?: string
  price?:       number
  stock?:       number
  activity?:    string
  seedType?:    string
}

export interface ProductQueryParams {
  search?:   string
  seedType?: string
  sort?:     "newest" | "price_asc" | "price_desc" | "name_asc"
  page?:     number
  limit?:    number
}