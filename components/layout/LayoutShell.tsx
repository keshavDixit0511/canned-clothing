// components/layout/LayoutShell.tsx

import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { MobileNav } from "@/components/layout/MobileNav"
import { CartDrawer } from "@/components/cart/CartDrawer"

interface LayoutShellProps {
  children: React.ReactNode
}

/**
 * Drop this into app/layout.tsx to get Header + Footer + MobileNav on every page.
 *
 * Usage in app/layout.tsx:
 *
 *   import { LayoutShell } from "@/components/layout/LayoutShell"
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html lang="en">
 *         <body>
 *           <LayoutShell>{children}</LayoutShell>
 *         </body>
 *       </html>
 *     )
 *   }
 */
export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#050d0a]">
      {/* Fixed top header */}
      <Header />

      {/* Page content — pt-16 offsets the fixed header height */}
      <main className="flex-1 pt-16 pb-16 md:pb-0">
        {children}
      </main>

      {/* Footer — only on desktop (hidden on mobile to avoid overlap with MobileNav) */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Bottom mobile nav — only on small screens */}
      <MobileNav />

      {/* Cart slide-over — rendered globally so any page can open it */}
      <CartDrawer />
    </div>
  )
}