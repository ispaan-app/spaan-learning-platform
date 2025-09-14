'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'light',
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'light', // Force light theme
  storageKey = 'ispaan-theme',
  ...props
}: ThemeProviderProps) {
  // Force light theme only
  const [theme, setTheme] = useState<Theme>('light')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Always use light theme - no localStorage needed
  useEffect(() => {
    setMounted(true)
  }, [])

  // Override setTheme to always return light
  const forceLightTheme = (newTheme: Theme) => {
    setTheme('light')
  }

  useEffect(() => {
    const root = window.document.documentElement

    // Always force light theme
    root.classList.remove('light', 'dark')
    root.classList.add('light')
    setResolvedTheme('light')
  }, [])

  const value: ThemeProviderState = {
    theme: 'light' as Theme, // Always light
    setTheme: forceLightTheme, // Override to always set light
    resolvedTheme: 'light' as 'light' | 'dark', // Always light
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <ThemeProviderContext.Provider {...props} value={initialState}>
        {children}
      </ThemeProviderContext.Provider>
    )
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
