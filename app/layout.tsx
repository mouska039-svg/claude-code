import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { PostHogProvider } from "@/components/shared/posthog-provider"
import { CookieBanner } from "@/components/shared/cookie-banner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "FitCoach AI — L'IA pour les coachs fitness",
    template: "%s | FitCoach AI",
  },
  description:
    "Génère des programmes d'entraînement, plans nutrition et contenus social media en quelques secondes avec l'IA.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://fitcoachai.app"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground">
        <PostHogProvider>
          {children}
          <Toaster />
          <CookieBanner />
        </PostHogProvider>
      </body>
    </html>
  )
}
