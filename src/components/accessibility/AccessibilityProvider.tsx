'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  screenReader: boolean
  keyboardNavigation: boolean
  focusVisible: boolean
  colorBlindSupport: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  theme: 'light' | 'dark' | 'auto'
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void
  resetSettings: () => void
  announceToScreenReader: (message: string) => void
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: false,
  focusVisible: true,
  colorBlindSupport: 'none',
  fontSize: 'medium',
  theme: 'auto'
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error)
      }
    }

    // Detect system preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
    
    setSettings(prev => ({
      ...prev,
      reducedMotion: mediaQuery.matches,
      theme: prefersDark.matches ? 'dark' : 'light'
    }))

    // Listen for system preference changes
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }))
    }

    const handleThemeChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ 
        ...prev, 
        theme: e.matches ? 'dark' : 'light' 
      }))
    }

    mediaQuery.addEventListener('change', handleMotionChange)
    prefersDark.addEventListener('change', handleThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange)
      prefersDark.removeEventListener('change', handleThemeChange)
    }
  }, [])

  useEffect(() => {
    // Apply settings to document
    const root = document.documentElement
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text')
    } else {
      root.classList.remove('large-text')
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }

    // Color blind support
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia')
    if (settings.colorBlindSupport !== 'none') {
      root.classList.add(settings.colorBlindSupport)
    }

    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large')
    root.classList.add(`font-${settings.fontSize}`)

    // Theme
    if (settings.theme === 'dark') {
      root.classList.add('dark')
    } else if (settings.theme === 'light') {
      root.classList.remove('dark')
    } else {
      // Auto theme - let system preference decide
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    // Save settings to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings))
  }, [settings])

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  const announceToScreenReader = (message: string) => {
    if (settings.screenReader) {
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = message
      
      document.body.appendChild(announcement)
      
      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)
    }
  }

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        announceToScreenReader
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

// Accessibility utilities
export const accessibilityUtils = {
  // Generate accessible labels
  generateLabel: (text: string, required: boolean = false) => {
    return required ? `${text} (required)` : text
  },

  // Generate ARIA descriptions
  generateDescription: (text: string) => {
    return text
  },

  // Generate accessible error messages
  generateErrorMessage: (field: string, error: string) => {
    return `${field}: ${error}`
  },

  // Generate accessible success messages
  generateSuccessMessage: (action: string) => {
    return `${action} completed successfully`
  },

  // Generate accessible loading messages
  generateLoadingMessage: (action: string) => {
    return `Loading ${action.toLowerCase()}...`
  },

  // Generate accessible button labels
  generateButtonLabel: (action: string, context?: string) => {
    return context ? `${action} ${context}` : action
  },

  // Generate accessible table headers
  generateTableHeader: (text: string, sortable: boolean = false) => {
    return sortable ? `${text} (sortable)` : text
  },

  // Generate accessible form instructions
  generateFormInstructions: (instructions: string[]) => {
    return instructions.join('. ')
  }
}

// Keyboard navigation hook
export function useKeyboardNavigation() {
  const { settings } = useAccessibility()
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!settings.keyboardNavigation) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, target } = event
      
      if (key === 'Tab') {
        setFocusedElement(target as HTMLElement)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [settings.keyboardNavigation])

  return {
    focusedElement,
    isKeyboardNavigationEnabled: settings.keyboardNavigation
  }
}

// Focus management hook
export function useFocusManagement() {
  const [focusHistory, setFocusHistory] = useState<HTMLElement[]>([])

  const pushFocus = (element: HTMLElement) => {
    setFocusHistory(prev => [...prev, element])
  }

  const popFocus = () => {
    setFocusHistory(prev => {
      const newHistory = [...prev]
      newHistory.pop()
      return newHistory
    })
  }

  const restoreFocus = () => {
    const lastElement = focusHistory[focusHistory.length - 1]
    if (lastElement) {
      lastElement.focus()
    }
  }

  return {
    focusHistory,
    pushFocus,
    popFocus,
    restoreFocus
  }
}
