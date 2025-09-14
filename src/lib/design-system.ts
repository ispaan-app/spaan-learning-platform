// Design System Configuration for iSpaan Application
// Based on modern UI/UX principles with clean, professional aesthetic

export const designSystem = {
  // Color Palette - Following the blueprint principles
  colors: {
    primary: {
      DEFAULT: 'hsl(25, 95%, 53%)', // Vibrant orange/amber
      50: 'hsl(25, 100%, 95%)',
      100: 'hsl(25, 100%, 90%)',
      200: 'hsl(25, 100%, 80%)',
      300: 'hsl(25, 100%, 70%)',
      400: 'hsl(25, 100%, 60%)',
      500: 'hsl(25, 95%, 53%)',
      600: 'hsl(25, 90%, 45%)',
      700: 'hsl(25, 85%, 35%)',
      800: 'hsl(25, 80%, 25%)',
      900: 'hsl(25, 75%, 15%)',
    },
    background: {
      DEFAULT: 'hsl(210, 40%, 98%)', // Very light neutral gray
      secondary: 'hsl(210, 20%, 95%)',
      card: 'hsl(0, 0%, 100%)', // Pure white for cards
    },
    text: {
      primary: 'hsl(210, 10%, 23%)', // Dark, desaturated blue-gray
      secondary: 'hsl(210, 5%, 45%)', // Muted gray for secondary text
      muted: 'hsl(210, 3%, 60%)', // Light gray for descriptions
    },
    dark: {
      background: 'hsl(210, 15%, 8%)', // Dark blue-gray
      secondary: 'hsl(210, 10%, 12%)',
      card: 'hsl(210, 8%, 10%)',
      text: 'hsl(210, 5%, 95%)', // Soft white
      muted: 'hsl(210, 3%, 75%)', // Light gray for dark mode
    }
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1rem' }],
      'sm': ['0.875rem', { lineHeight: '1.25rem' }],
      'base': ['1rem', { lineHeight: '1.5rem' }],
      'lg': ['1.125rem', { lineHeight: '1.75rem' }],
      'xl': ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },

  // Spacing System - Generous whitespace
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },

  // Border Radius - Soft, modern corners
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Shadows - Subtle depth
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // Animation & Transitions
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  },

  // Component Variants
  components: {
    button: {
      primary: 'bg-primary-500 hover:bg-primary-600 text-white rounded-full px-6 py-3 font-medium transition-all duration-200 shadow-sm hover:shadow-md',
      secondary: 'bg-background-secondary hover:bg-background-secondary/80 text-text-primary rounded-full px-6 py-3 font-medium transition-all duration-200 border border-gray-200',
      outline: 'border border-primary-500 text-primary-500 hover:bg-primary-50 rounded-full px-6 py-3 font-medium transition-all duration-200',
      ghost: 'text-text-primary hover:bg-background-secondary rounded-full px-6 py-3 font-medium transition-all duration-200',
    },
    card: {
      base: 'bg-card border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200',
      elevated: 'bg-card border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-200',
    },
    input: {
      base: 'w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
    }
  }
}

// Utility functions for applying design system
export const applyDesignSystem = {
  // Generate Tailwind classes based on design system
  button: (variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary') => 
    designSystem.components.button[variant],
  
  card: (elevated: boolean = false) => 
    elevated ? designSystem.components.card.elevated : designSystem.components.card.base,
  
  input: () => designSystem.components.input.base,
  
  // Spacing utilities
  spacing: (size: keyof typeof designSystem.spacing) => 
    `p-${size}`,
  
  // Color utilities
  textColor: (variant: 'primary' | 'secondary' | 'muted' = 'primary') => 
    `text-${variant === 'primary' ? 'text-primary' : variant === 'secondary' ? 'text-secondary' : 'text-muted'}`,
}

// CSS Custom Properties for dynamic theming
export const cssVariables = {
  light: {
    '--color-primary': designSystem.colors.primary.DEFAULT,
    '--color-background': designSystem.colors.background.DEFAULT,
    '--color-text': designSystem.colors.text.primary,
    '--color-text-secondary': designSystem.colors.text.secondary,
    '--color-text-muted': designSystem.colors.text.muted,
  },
  dark: {
    '--color-primary': designSystem.colors.primary.DEFAULT,
    '--color-background': designSystem.colors.dark.background,
    '--color-text': designSystem.colors.dark.text,
    '--color-text-secondary': designSystem.colors.dark.muted,
    '--color-text-muted': designSystem.colors.dark.muted,
  }
}