'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { lightTheme, darkTheme, createStyles } from '../lib/theme'

// Define the ThemeContext type
interface ThemeContextType {
  theme: typeof lightTheme
  styles: ReturnType<typeof createStyles>
  isDark: boolean
  themeReady: boolean // New state to indicate theme initialization
  toggleTheme: () => void
}

// Simplified and optimized ThemeContext
const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [themeReady, setThemeReady] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDark(savedTheme === 'dark')
    }
    setThemeReady(true) // Mark theme as initialized
  }, [])

  useEffect(() => {
    if (themeReady) {
      const themeMode = isDark ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', themeMode)
      localStorage.setItem('theme', themeMode)
    }
  }, [isDark, themeReady])

  const toggleTheme = () => setIsDark(prev => !prev)

  const theme = isDark ? darkTheme : lightTheme
  const styles = createStyles(theme)

  const value: ThemeContextType = { theme, styles, isDark, themeReady, toggleTheme }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}