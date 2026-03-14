import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ServiceWorkerRegister } from "@/components/pwa/sw-register"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Dorian — Crystallize Your Thoughts",
  description:
    "Your premium AI thought partner. Capture fragments of knowledge, voice memos, and screenshots. Watch them transform into actionable insights.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dorian",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#10b981",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
