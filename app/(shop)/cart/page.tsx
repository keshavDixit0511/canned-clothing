import CartList from "@/components/cart/CartList"
import CartSummary from "@/components/cart/CartSummary"

export const dynamic = "force-dynamic"

export default function CartPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CartList />
        </div>

        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
