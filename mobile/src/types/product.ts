export interface ProductImage {
  id: string
  url: string
  order: number
  productId: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  stock: number
  availabilityStatus: string
  activity: string
  seedType: string
  images: ProductImage[]
  createdAt: string
  updatedAt: string
}

export interface ProductSummary {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  seedType: string
  images: Pick<ProductImage, "url" | "order">[]
}
