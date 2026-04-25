import type { Metadata, Viewport } from "next"
import type { CSSProperties } from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { LayoutShell } from "@/components/layout/LayoutShell"
import { ToastProvider } from "@/components/ui/Toast"
import { APP_NAME, APP_SEO_DESCRIPTION, APP_TAGLINE, APP_URL } from "@/lib/constants"
import "./globals.css"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} | ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_SEO_DESCRIPTION,
  keywords: [
    "ESTHETIQUE",
    "eco friendly clothing",
    "sustainable fashion",
    "clothing brand",
    "style meets purpose",
    "plantable clothing",
    "eco friendly apparel",
    "bamboo clothing",
    "seeded packaging",
    "ethical fashion",
    "sustainable style",
    "plant purpose clothing",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} | ${APP_TAGLINE}`,
    description: APP_SEO_DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} | ${APP_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} | ${APP_TAGLINE}`,
    description: APP_SEO_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  category: "Fashion",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: APP_NAME,
                url: APP_URL,
                description: APP_SEO_DESCRIPTION,
                slogan: APP_TAGLINE,
                sameAs: [],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: APP_NAME,
                url: APP_URL,
                description: APP_SEO_DESCRIPTION,
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${APP_URL}/products?search={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
      </head>
      <body className="bg-[#060a06] text-white antialiased font-sans" suppressHydrationWarning>
        <ClerkProvider
          signInUrl="/login"
          signUpUrl="/register"
          afterSignInUrl="/onboarding"
          afterSignUpUrl="/onboarding"
        >
          <ToastProvider>
            <LayoutShell>{children}</LayoutShell>
          </ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
