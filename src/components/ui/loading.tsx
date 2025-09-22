import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2, Sparkles, Zap } from "lucide-react"

// Modern gradient spinner with glassmorphism
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
        "relative animate-spin rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x"></div>
      <div className="absolute inset-1 rounded-full bg-white/90 backdrop-blur-sm"></div>
    </div>
  )
})
LoadingSpinner.displayName = "LoadingSpinner"

// Enhanced gradient spinner with multiple rings
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
        "relative animate-spin rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x"></div>
      {/* Inner ring */}
      <div className="absolute inset-1 rounded-full border-2 border-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-gradient-x" style={{ animationDirection: 'reverse' }}></div>
      {/* Center */}
      <div className="absolute inset-2 rounded-full bg-white/90 backdrop-blur-sm"></div>
    </div>
  )
})
GradientSpinner.displayName = "GradientSpinner"

// Modern pulsing dots with gradient
const DotsLoader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex space-x-2", className)}
    {...props}
  >
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse shadow-lg"
        style={{
          animationDelay: `${i * 0.3}s`,
          animationDuration: '1.2s'
        }}
      />
    ))}
  </div>
))
DotsLoader.displayName = "DotsLoader"

// Modern wave loader
const WaveLoader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex space-x-1 items-end", className)}
    {...props}
  >
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="w-1 bg-gradient-to-t from-blue-600 to-purple-600 rounded-full animate-pulse"
        style={{
          height: `${12 + (i % 2) * 8}px`,
          animationDelay: `${i * 0.1}s`,
          animationDuration: '1s'
        }}
      />
    ))}
  </div>
))
WaveLoader.displayName = "WaveLoader"

// Modern page loader with glassmorphism and #F5F0E1 background
const PageLoader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { message?: string }
>(({ className, message = "Preparing your experience...", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 flex items-center justify-center z-50",
      className
    )}
    style={{ background: 'linear-gradient(135deg, #F5F0E1 0%, #F5F0E1 50%, #F5F0E1 100%)' }}
    {...props}
  >
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-5">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-48 translate-x-48" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)' }}></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full translate-y-40 -translate-x-40" style={{ background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)' }}></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full -translate-x-32 -translate-y-32" style={{ background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.15) 0%, rgba(251, 146, 60, 0.15) 100%)' }}></div>
    </div>
    
    <div className="relative z-10 text-center space-y-8 p-8">
      {/* Enhanced Loading Spinner */}
      <div className="relative">
        <div className="w-20 h-20 mx-auto">
          <GradientSpinner size="xl" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse shadow-lg"></div>
        </div>
      </div>
      
      {/* Glassmorphism Card */}
      <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-2xl max-w-md mx-auto">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
            {message}
          </h3>
          <p className="text-gray-700 text-lg">
            Please wait while we prepare everything for you
          </p>
          <div className="flex justify-center">
            <DotsLoader />
          </div>
        </div>
      </div>
    </div>
  </div>
))
PageLoader.displayName = "PageLoader"

// Modern loading button with glassmorphism
const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }
>(({ className, loading = false, children, disabled, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "group relative inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "h-10 px-6 py-2",
      loading 
        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
        : "bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 hover:bg-white hover:shadow-lg hover:scale-105",
      className
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading && (
      <>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25"></div>
        <LoadingSpinner size="sm" className="mr-2 relative z-10" />
      </>
    )}
    <span className="relative z-10">{children}</span>
  </button>
))
LoadingButton.displayName = "LoadingButton"

// Modern skeleton loader
const SkeletonLoader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    variant?: "text" | "rectangular" | "circular"
    lines?: number
  }
>(({ className, variant = "rectangular", lines = 1, ...props }, ref) => {
  if (variant === "text" && lines > 1) {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse",
              i === lines - 1 ? "w-3/4" : "w-full"
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse",
        variant === "circular" ? "rounded-full aspect-square" : "",
        className
      )}
      {...props}
    />
  )
})
SkeletonLoader.displayName = "SkeletonLoader"

export { 
  LoadingSpinner, 
  GradientSpinner, 
  DotsLoader, 
  WaveLoader,
  PageLoader, 
  LoadingButton,
  SkeletonLoader
}

