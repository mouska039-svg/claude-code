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
  title: "Naya — Le guide digital des praticiens du bien-être",
  description:
    "Structurez vos cures, prolongez l'effet de vos séances, développez votre activité.",
  keywords: ["bien-être", "naturopathe", "sophrologue", "hypnothérapeute", "protocoles"],
  openGraph: {
    title: "Naya — Le guide digital des praticiens du bien-être",
    description:
      "Structurez vos cures, prolongez l'effet de vos séances, développez votre activité.",
    type: "website",
    locale: "fr_FR",
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
