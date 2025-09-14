import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

// Design system constants
export const DESIGN_TOKENS = {
  colors: {
    primary: {
      50: 'bg-blue-50',
      100: 'bg-blue-100',
      500: 'bg-blue-500',
      600: 'bg-blue-600',
      700: 'bg-blue-700',
      900: 'bg-blue-900',
    },
    secondary: {
      50: 'bg-purple-50',
      100: 'bg-purple-100',
      500: 'bg-purple-500',
      600: 'bg-purple-600',
      700: 'bg-purple-700',
      900: 'bg-purple-900',
    },
    success: {
      50: 'bg-green-50',
      100: 'bg-green-100',
      500: 'bg-green-500',
      600: 'bg-green-600',
      700: 'bg-green-700',
    },
    warning: {
      50: 'bg-yellow-50',
      100: 'bg-yellow-100',
      500: 'bg-yellow-500',
      600: 'bg-yellow-600',
      700: 'bg-yellow-700',
    },
    error: {
      50: 'bg-red-50',
      100: 'bg-red-100',
      500: 'bg-red-500',
      600: 'bg-red-600',
      700: 'bg-red-700',
    },
  },
  spacing: {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  },
  borderRadius: {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  },
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
  animations: {
    fadeIn: 'animate-in fade-in duration-500',
    slideInFromTop: 'animate-in slide-in-from-top duration-700',
    slideInFromBottom: 'animate-in slide-in-from-bottom duration-700',
    slideInFromLeft: 'animate-in slide-in-from-left duration-700',
    slideInFromRight: 'animate-in slide-in-from-right duration-700',
    zoomIn: 'animate-in zoom-in duration-700',
    pulse: 'animate-pulse',
  },
} as const

// Consistent page header component
interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  className?: string
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, icon: Icon, actions, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between mb-6",
        className
      )}
    >
      <div className="animate-in slide-in-from-left duration-700">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
      {actions && (
        <div className="animate-in slide-in-from-right duration-700 delay-200">
          {actions}
        </div>
      )}
    </div>
  )
)
PageHeader.displayName = "PageHeader"

// Consistent section header component
interface SectionHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  badge?: string
  className?: string
}

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ title, description, icon: Icon, badge, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between mb-4",
        className
      )}
    >
      <div className="flex items-center space-x-3">
        {Icon && (
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-gray-600" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <span>{title}</span>
            {badge && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                {badge}
              </span>
            )}
          </h2>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
)
SectionHeader.displayName = "SectionHeader"

// Consistent status indicator component
interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending'
  label: string
  showDot?: boolean
  className?: string
}

export const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ status, label, showDot = true, className }, ref) => {
    const statusConfig = {
      success: {
        dotColor: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
      warning: {
        dotColor: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
      },
      error: {
        dotColor: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      },
      info: {
        dotColor: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      pending: {
        dotColor: 'bg-gray-500',
        textColor: 'text-gray-700',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
      },
    }

    const config = statusConfig[status]

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium",
          config.bgColor,
          config.borderColor,
          config.textColor,
          className
        )}
      >
        {showDot && (
          <div className={cn("w-2 h-2 rounded-full", config.dotColor, "animate-pulse")} />
        )}
        <span>{label}</span>
      </div>
    )
  }
)
StatusIndicator.displayName = "StatusIndicator"

// Consistent empty state component
interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon: Icon, title, description, action, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        "text-center py-12 px-6",
        className
      )}
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
)
EmptyState.displayName = "EmptyState"

// Consistent loading state component
interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ message = "Loading...", size = 'md', className }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center space-x-2 text-gray-600",
          className
        )}
      >
        <div
          className={cn(
            "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
            sizeClasses[size]
          )}
        />
        <span className="text-sm font-medium">{message}</span>
      </div>
    )
  }
)
LoadingState.displayName = "LoadingState"

// Consistent metric card component
interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    label: string
    positive: boolean
  }
  icon?: LucideIcon
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
  loading?: boolean
  className?: string
}

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ title, value, description, trend, icon: Icon, color = 'blue', loading = false, className }, ref) => {
    const colorConfig = {
      blue: {
        bg: 'bg-blue-50',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        border: 'border-blue-200',
      },
      green: {
        bg: 'bg-green-50',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        border: 'border-green-200',
      },
      purple: {
        bg: 'bg-purple-50',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        border: 'border-purple-200',
      },
      yellow: {
        bg: 'bg-yellow-50',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        border: 'border-yellow-200',
      },
      red: {
        bg: 'bg-red-50',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        border: 'border-red-200',
      },
    }

    const config = colorConfig[color]

    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-lg border p-6 animate-pulse",
            config.bg,
            config.border,
            className
          )}
        >
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
          config.bg,
          config.border,
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
          {Icon && (
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", config.iconBg)}>
              <Icon className={cn("w-6 h-6", config.iconColor)} />
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span className={cn(
              "mr-1",
              trend.positive ? "text-green-600" : "text-red-600"
            )}>
              {trend.positive ? "↗" : "↘"}
            </span>
            <span className={cn(
              "font-medium",
              trend.positive ? "text-green-600" : "text-red-600"
            )}>
              {trend.value}% {trend.label}
            </span>
          </div>
        )}
      </div>
    )
  }
)
MetricCard.displayName = "MetricCard"




