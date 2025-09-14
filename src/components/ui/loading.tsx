import * as React from "react"
import { cn } from "@/lib/utils"

const LoadingSpinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" | "xl" }
>(({ className, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
})
LoadingSpinner.displayName = "LoadingSpinner"

// Enhanced loading spinner with gradient
const GradientSpinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" | "xl" }
>(({ className, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "animate-spin rounded-full border-2 border-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-border",
        sizeClasses[size],
        className
      )}
      style={{
        background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #3b82f6)',
        WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), black 0)',
        mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), black 0)'
      }}
      {...props}
    />
  )
})
GradientSpinner.displayName = "GradientSpinner"

// Pulsing dots loader
const DotsLoader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex space-x-1", className)}
    {...props}
  >
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
        style={{
          animationDelay: `${i * 0.2}s`,
          animationDuration: '1s'
        }}
      />
    ))}
  </div>
))
DotsLoader.displayName = "DotsLoader"

// Page loading overlay
const PageLoader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { message?: string }
>(({ className, message = "Loading...", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50",
      className
    )}
    {...props}
  >
    <div className="text-center">
      <GradientSpinner size="xl" className="mx-auto mb-4" />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
))
PageLoader.displayName = "PageLoader"

const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }
>(({ className, loading = false, children, disabled, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2",
      className
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading && <LoadingSpinner size="sm" className="mr-2" />}
    {children}
  </button>
))
LoadingButton.displayName = "LoadingButton"

export { LoadingSpinner, GradientSpinner, DotsLoader, PageLoader, LoadingButton }

