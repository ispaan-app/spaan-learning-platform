// Accessibility service for ARIA labels, keyboard navigation, and screen reader support
export class AccessibilityService {
  // Generate ARIA labels for form fields
  static generateAriaLabel(field: {
    name: string
    type: string
    required?: boolean
    description?: string
    error?: string
  }): string {
    let label = field.name
    
    if (field.required) {
      label += ' (required)'
    }
    
    if (field.description) {
      label += `. ${field.description}`
    }
    
    if (field.error) {
      label += `. Error: ${field.error}`
    }
    
    return label
  }

  // Generate ARIA descriptions for complex UI elements
  static generateAriaDescription(element: {
    type: string
    content: string
    state?: string
    actions?: string[]
  }): string {
    let description = element.content
    
    if (element.state) {
      description += `. Status: ${element.state}`
    }
    
    if (element.actions && element.actions.length > 0) {
      description += `. Available actions: ${element.actions.join(', ')}`
    }
    
    return description
  }

  // Generate live region announcements
  static announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (typeof window === 'undefined') return

    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  // Focus management utilities
  static focusElement(selector: string) {
    if (typeof window === 'undefined') return

    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
    }
  }

  static trapFocus(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }

  // Keyboard navigation helpers
  static handleKeyboardNavigation(
    event: KeyboardEvent,
    options: {
      onEnter?: () => void
      onEscape?: () => void
      onArrowUp?: () => void
      onArrowDown?: () => void
      onArrowLeft?: () => void
      onArrowRight?: () => void
      onSpace?: () => void
    }
  ) {
    switch (event.key) {
      case 'Enter':
        options.onEnter?.()
        break
      case 'Escape':
        options.onEscape?.()
        break
      case 'ArrowUp':
        options.onArrowUp?.()
        break
      case 'ArrowDown':
        options.onArrowDown?.()
        break
      case 'ArrowLeft':
        options.onArrowLeft?.()
        break
      case 'ArrowRight':
        options.onArrowRight?.()
        break
      case ' ':
        event.preventDefault()
        options.onSpace?.()
        break
    }
  }

  // Color contrast utilities
  static getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
      const rgb = this.hexToRgb(color)
      if (!rgb) return 0

      const { r, g, b } = rgb
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)

    return (brightest + 0.05) / (darkest + 0.05)
  }

  static isAccessibleContrast(foreground: string, background: string): boolean {
    const ratio = this.getContrastRatio(foreground, background)
    return ratio >= 4.5 // WCAG AA standard
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Screen reader utilities
  static announcePageChange(pageTitle: string) {
    if (typeof window === 'undefined') return

    document.title = pageTitle
    this.announceToScreenReader(`Navigated to ${pageTitle}`)
  }

  static announceFormValidation(errors: Record<string, string>) {
    const errorCount = Object.keys(errors).length
    if (errorCount > 0) {
      this.announceToScreenReader(
        `Form validation failed. ${errorCount} error${errorCount > 1 ? 's' : ''} found.`,
        'assertive'
      )
    }
  }

  static announceSuccess(message: string) {
    this.announceToScreenReader(message, 'polite')
  }

  // ARIA attributes helpers
  static getAriaAttributes(element: {
    role?: string
    expanded?: boolean
    selected?: boolean
    disabled?: boolean
    hidden?: boolean
    labelledBy?: string
    describedBy?: string
    controls?: string
    owns?: string
  }) {
    const attributes: Record<string, string | boolean> = {}

    if (element.role) attributes['aria-role'] = element.role
    if (element.expanded !== undefined) attributes['aria-expanded'] = element.expanded
    if (element.selected !== undefined) attributes['aria-selected'] = element.selected
    if (element.disabled !== undefined) attributes['aria-disabled'] = element.disabled
    if (element.hidden !== undefined) attributes['aria-hidden'] = element.hidden
    if (element.labelledBy) attributes['aria-labelledby'] = element.labelledBy
    if (element.describedBy) attributes['aria-describedby'] = element.describedBy
    if (element.controls) attributes['aria-controls'] = element.controls
    if (element.owns) attributes['aria-owns'] = element.owns

    return attributes
  }

  // Skip links for keyboard navigation
  static createSkipLink(target: string, text: string = 'Skip to main content') {
    return {
      href: target,
      className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded',
      children: text
    }
  }

  // High contrast mode detection
  static isHighContrastMode(): boolean {
    if (typeof window === 'undefined') return false

    return (
      window.matchMedia('(prefers-contrast: high)').matches ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    )
  }

  // Reduced motion detection
  static prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // Focus visible detection
  static supportsFocusVisible(): boolean {
    if (typeof window === 'undefined') return false

    return CSS.supports('selector(:focus-visible)')
  }
}

// React hook for accessibility
export function useAccessibility() {
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    AccessibilityService.announceToScreenReader(message, priority)
  }

  const focusElement = (selector: string) => {
    AccessibilityService.focusElement(selector)
  }

  const announcePageChange = (pageTitle: string) => {
    AccessibilityService.announcePageChange(pageTitle)
  }

  const announceFormValidation = (errors: Record<string, string>) => {
    AccessibilityService.announceFormValidation(errors)
  }

  const announceSuccess = (message: string) => {
    AccessibilityService.announceSuccess(message)
  }

  return {
    announceToScreenReader,
    focusElement,
    announcePageChange,
    announceFormValidation,
    announceSuccess
  }
}

// Accessibility constants
export const ACCESSIBILITY_CONSTANTS = {
  ROLES: {
    BUTTON: 'button',
    LINK: 'link',
    MENU: 'menu',
    MENUITEM: 'menuitem',
    DIALOG: 'dialog',
    ALERT: 'alert',
    STATUS: 'status',
    PROGRESSBAR: 'progressbar',
    TAB: 'tab',
    TABPANEL: 'tabpanel',
    TABLIST: 'tablist',
    GRID: 'grid',
    GRIDCELL: 'gridcell',
    LIST: 'list',
    LISTITEM: 'listitem'
  },
  ARIA_LABELS: {
    CLOSE: 'Close',
    OPEN: 'Open',
    EXPAND: 'Expand',
    COLLAPSE: 'Collapse',
    NEXT: 'Next',
    PREVIOUS: 'Previous',
    LOADING: 'Loading',
    ERROR: 'Error',
    SUCCESS: 'Success',
    WARNING: 'Warning',
    INFO: 'Information'
  },
  KEYBOARD_KEYS: {
    ENTER: 'Enter',
    ESCAPE: 'Escape',
    SPACE: ' ',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown'
  }
} as const

export default AccessibilityService
