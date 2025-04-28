"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "./supabase"

type ThemeType = "default" | "mint" | "lavender" | "sunshine" | "cream"

const THEME_IMAGES = {
  mint: {
    bg: "url('/mint-bg.png')",
    container: "url('/mint-cont.png')"
  },
  lavender: {
    bg: "url('/lavender-bg.png')",
    container: "url('/lavender-cont.png')"
  },
  sunshine: {
    bg: "url('/sunshine-bg.png')",
    container: "url('/sunshine-cont.png')"
  },
  cream: {
    bg: "url('/cream-bg.png')",
    container: "url('/cream-cont.png')"
  },
  default: {
    bg: "none",
    container: "url('/lavender-cont.png')"
  }
} as const

const BASE_STYLE = {
  backgroundPosition: "center",
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat"
} as const

interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  getContainerBgColor: () => { 
    backgroundImage: string
    backgroundPosition: string
    backgroundSize: string
    backgroundRepeat: string
  }
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>("lavender")
  const [isLoading, setIsLoading] = useState(true)
  const [preferenceId, setPreferenceId] = useState<string | null>(null)

  // Load theme from Supabase on initial render
  useEffect(() => {
    async function loadTheme() {
      try {
        const { data, error } = await supabase.from("user_preferences").select("*").limit(1)
        if (error) throw error
        if (data?.[0]) {
          setTheme(data[0].theme as ThemeType)
          setPreferenceId(data[0].id)
        }
      } catch (error) {
        console.error("Failed to load theme:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadTheme()
  }, [])

  // Save theme to Supabase whenever it changes
  useEffect(() => {
    if (isLoading) return

    async function saveTheme() {
      try {
        if (preferenceId) {
          const { error } = await supabase
            .from("user_preferences")
            .update({ theme, updated_at: new Date().toISOString() })
            .eq("id", preferenceId)
          if (error) throw error
        } else {
          const { data, error } = await supabase
            .from("user_preferences")
            .insert({ theme })
            .select()
            .single()
          if (error) throw error
          if (data) setPreferenceId(data.id)
        }
      } catch (error) {
        console.error("Failed to save theme:", error)
      }
    }
    saveTheme()
  }, [theme, isLoading, preferenceId])

  const getContainerBgColor = () => ({
    ...BASE_STYLE,
    backgroundImage: THEME_IMAGES[theme].container
  })

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        getContainerBgColor,
        isLoading,
      }}
    >
      <div
        style={{
          minHeight: '100vh',
          backgroundImage: THEME_IMAGES[theme].bg,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          transition: 'background 0.5s',
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
