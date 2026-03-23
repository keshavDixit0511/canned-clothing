// import { cookies } from "next/headers"

// async function getOrders() {
//   const cookieStore = await cookies()

//   const res = await fetch(`/api/orders`, {
//     headers: {
//       Cookie: cookieStore.toString()
//     },
//     cache: "no-store"
//   })

//   if (!res.ok) return []

//   return res.json()
// }

// export default async function OrdersPage() {
//   const orders = await getOrders()

//   return (
//     <div className="max-w-6xl mx-auto px-6 py-10">
//       <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

//       <div className="space-y-6">
//         {orders.map((order: any) => (
//           <div
//             key={order.id}
//             className="border rounded-xl p-6 flex justify-between"
//           >
//             <div>
//               <p className="font-semibold">
//                 Order #{order.id}
//               </p>

//               <p className="text-sm text-gray-500">
//                 {new Date(order.createdAt).toDateString()}
//               </p>
//             </div>

//             <div className="font-bold">
//               ₹{order.total}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// app/orders/page.tsx

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/server/db/prisma"
import { verifyToken } from "@/lib/auth/jwt"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "Pending",    color: "text-amber-400 bg-amber-400/10 border-amber-400/20"       },
  PROCESSING: { label: "Processing", color: "text-blue-400 bg-blue-400/10 border-blue-400/20"          },
  SHIPPED:    { label: "Shipped",    color: "text-sky-400 bg-sky-400/10 border-sky-400/20"             },
  DELIVERED:  { label: "Delivered",  color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  CANCELLED:  { label: "Cancelled",  color: "text-red-400 bg-red-400/10 border-red-400/20"             },
}

async function fetchOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: {
              name:   true,
              slug:   true,
              images: { take: 1, orderBy: { order: "asc" } },
            },
          },
        },
      },
      payment: {
        select: { status: true, provider: true },
      },
    },
  })
}

type OrdersResult = Awaited<ReturnType<typeof fetchOrdersForUser>>
type OrderRecord = OrdersResult[number]
type OrderItemRecord = OrderRecord["items"][number]

async function getOrders(): Promise<OrdersResult | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null

    const payload = verifyToken(token)
    return fetchOrdersForUser(payload.userId)
  } catch {
    return null
  }
}

export default async function OrdersPage() {
  const orders = await getOrders()

  if (orders === null) {
    redirect("/login?redirect=/orders")
  }

  return (
    <div className="min-h-screen bg-[#060a06] pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-24 space-y-8">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/30 mb-1">
            Account
          </p>
          <h1
            className="text-4xl sm:text-5xl text-white leading-none"
            style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}
          >
            My Orders
          </h1>
        </div>

        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-6xl mb-4">📦</p>
            <h2
              className="text-3xl text-white mb-2"
              style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}
            >
              No Orders Yet
            </h2>
            <p className="text-sm text-white/40 mb-6 max-w-xs">
              You haven&apos;t placed any orders. Shop our DK tins to get started.
            </p>
            <Link
              href="/products"
              className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3 text-sm font-bold text-white transition-colors"
            >
              Shop Now →
            </Link>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order: OrderRecord) => {
              const s = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden hover:border-white/12 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap border-b border-white/6 px-5 py-4">
                    <div>
                      <p className="text-xs text-white/30 mb-0.5">Order ID</p>
                      <p
                        className="text-lg text-white tracking-wider"
                        style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}
                      >
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/30 mb-0.5">Date</p>
                      <p className="text-sm text-white/70">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/30 mb-0.5">Total</p>
                      <p
                        className="text-xl text-white"
                        style={{ fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)" }}
                      >
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <span className={cn("text-xs font-bold border rounded-full px-3 py-1", s.color)}>
                      {s.label}
                    </span>
                  </div>

                  <div className="divide-y divide-white/5">
                    {order.items.map((item: OrderItemRecord) => (
                      <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                        <div className="relative h-12 w-12 shrink-0 rounded-xl border border-white/8 bg-white/5 overflow-hidden flex items-center justify-center">
                          {item.product.images[0] ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-xl">🥫</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white/80 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-white/35">
                            Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-white/70 shrink-0">
                          ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/6 px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-[10px] text-white/25 uppercase tracking-wider mb-0.5">
                        Shipping to
                      </p>
                      <p className="text-xs text-white/50">
                        {order.shippingName} · {order.shippingCity}, {order.shippingState}
                      </p>
                    </div>
                    {order.payment && (
                      <span
                        className={cn(
                          "text-[10px] font-bold border rounded-full px-2.5 py-0.5",
                          order.payment.status === "SUCCESS"
                            ? "border-emerald-400/20 bg-emerald-400/8 text-emerald-400"
                            : "border-amber-400/20 bg-amber-400/8 text-amber-400"
                        )}
                      >
                        {order.payment.provider} · {order.payment.status}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
