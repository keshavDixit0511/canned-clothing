"use client"

import { ProductForm, type ProductDraft } from "./ProductForm"

type ProductFormProps = {
  product: ProductDraft
}

export function ProductEditForm({ product }: ProductFormProps) {
  return <ProductForm mode="edit" product={product} />
}

export default ProductEditForm
