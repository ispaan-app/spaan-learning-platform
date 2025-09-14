import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Design System Colors
        'primary': {
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
          DEFAULT: 'hsl(25, 95%, 53%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        'background': {
          DEFAULT: 'hsl(var(--background))',
          secondary: 'hsl(var(--secondary))',
        },
        'text': {
          primary: 'hsl(var(--foreground))',
          secondary: 'hsl(var(--muted-foreground))',
          muted: 'hsl(var(--muted-foreground))',
        },
        // Shadcn/ui colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom dark mode colors
        'dark-blue': {
          DEFAULT: 'hsl(var(--dark-blue))',
          foreground: 'hsl(var(--cream))',
        },
        'cream': {
          DEFAULT: 'hsl(var(--cream))',
          foreground: 'hsl(var(--dark-blue))',
        },
        'coral': {
          DEFAULT: 'hsl(var(--coral))',
          foreground: 'hsl(0, 0%, 100%)',
        },
        'gold': {
          DEFAULT: 'hsl(var(--gold))',
          foreground: 'hsl(var(--dark-blue))',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
