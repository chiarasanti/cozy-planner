import type React from "react"
import "@/app/globals.css"
import { Cutive_Mono } from "next/font/google"
import { ThemeProvider } from "@/lib/theme-context"

// Initialize the Cutive Mono font
const cutiveMono = Cutive_Mono({
  weight: "400", // Cutive Mono only comes in 400 weight
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cutive-mono",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cutiveMono.className}>
      <body className="font-mono">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev',
      title: "Cozy Planner",
      description: "A simple and cozy planner for your daily tasks",
      icons: {
        icon: "favicon.ico",
      },
    };
