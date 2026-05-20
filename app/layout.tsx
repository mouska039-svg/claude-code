import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://naya.app"),
  title: {
    default: "Naya — Logiciel pour naturopathes, sophrologues et hypnothérapeutes",
    template: "%s | Naya",
  },
  description:
    "Naya centralise vos clients, protocoles et séances. Le logiciel de gestion pensé pour les praticiens du bien-être : naturopathes, sophrologues, hypnothérapeutes.",
  keywords: [
    "naturopathe logiciel",
    "sophrologue gestion cabinet",
    "hypnothérapeute suivi clients",
    "protocole bien-être",
    "logiciel praticien naturopathie",
  ],
  openGraph: {
    title: "Naya — Logiciel pour praticiens du bien-être",
    description:
      "Centralisez vos clients, créez vos protocoles et développez votre cabinet.",
    type: "website",
    locale: "fr_FR",
    siteName: "Naya",
  },
  twitter: {
    card: "summary_large_image",
    title: "Naya — Logiciel pour praticiens du bien-être",
    description:
      "Centralisez vos clients, créez vos protocoles et développez votre cabinet.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo-naya-mark.svg",
    apple: "/logo-naya-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${inter.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
