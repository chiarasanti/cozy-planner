import type React from "react";
import "@/app/globals.css";
import { Cutive_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-context";
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

// Initialize the Cutive Mono font
const cutiveMono = Cutive_Mono({
  weight: "400", // Cutive Mono only comes in 400 weight
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cutive-mono",
});

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  generator: "v0.dev",
  title: "Cozy Planner",
  description: "A simple and cozy planner for your Cherry's daily tasks",
  manifest: "/manifest.json",
  themeColor: "#CDB6FB",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cozy Planner",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  icons: {
    icon: "favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cutiveMono.className}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cozy Planner" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-mono">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
