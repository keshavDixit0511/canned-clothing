import type { Metadata, Viewport } from "next"
import type { CSSProperties } from "react"
import { LayoutShell } from "@/components/layout/LayoutShell"
import { ToastProvider } from "@/components/ui/Toast"
import "./globals.css"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: {
    default: "ALUM & EARTH - DK | Wear it. Plant it. Grow it.",
    template: "%s | ALUM & EARTH",
  },
  description:
    "Premium bamboo-spandex performance shirts delivered in a brushed aluminum tin - with seeds inside. Wear it. Plant it. Track your growth.",
  keywords: [
    "sustainable fashion",
    "bamboo shirt",
    "eco clothing",
    "plant kit",
    "DK",
    "ALUM AND EARTH",
    "seeded tin",
    "eco friendly t-shirt",
    "India",
  ],
  authors: [{ name: "ALUM & EARTH" }],
  creator: "ALUM & EARTH",
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL ?? "https://alumandearth.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_URL ?? "https://alumandearth.com",
    siteName: "ALUM & EARTH - DK",
    title: "ALUM & EARTH - DK | Wear it. Plant it. Grow it.",
    description: "Premium shirts in brushed aluminum tins - with seeds inside.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ALUM & EARTH - DK",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ALUM & EARTH - DK",
    description: "Wear it. Plant it. Grow it.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#060a06",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fontVars: CSSProperties = {
    "--font-bebas": "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
    "--font-dm": "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  } as CSSProperties

  return (
    <html lang="en" style={fontVars} suppressHydrationWarning>
      <body className="bg-[#060a06] text-white antialiased font-sans" suppressHydrationWarning>
        <ToastProvider>
          <LayoutShell>{children}</LayoutShell>
        </ToastProvider>
      </body>
    </html>
  )
}
