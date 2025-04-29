"use client"

import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [isChanging, setIsChanging] = useState(false)

  const themes = [
    { id: "mint", color: "bg-[#a8e6cf]", name: "Mint" },
    { id: "lavender", color: "bg-[#c8a4ff]", name: "Lavender" },
    { id: "sunshine", color: "bg-[#fdfd96]", name: "Sunshine" },
    { id: "cream", color: "bg-[#f8f0e3]", name: "Cream" },
  ]

  const handleThemeChange = async (newTheme: string) => {
    setIsChanging(true)
    setTheme(newTheme as any)
    setIsChanging(false)
  }

  return (
    <div className="mt-12 p-4 rounded-lg text-center">
      <p className="mb-2 text-lg font-medium font-mono">How are you feeling today?</p>
      <div className="flex justify-center gap-4">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => handleThemeChange(t.id)}
            className={cn(
              "w-8 h-8 rounded-full transition-all",
              t.color,
              theme === t.id ? "ring-2 ring-offset-2 ring-black" : "hover:scale-110",
              isChanging && "opacity-50 cursor-not-allowed",
            )}
            aria-label={`Set ${t.name} theme`}
            title={t.name}
            disabled={isChanging}
          />
        ))}
      </div>
    </div>
  )
}
