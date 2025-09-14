import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  iconColor?: string
  iconBgColor?: string
  gradient?: boolean
  delay?: number
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ 
    className, 
    icon: Icon, 
    iconColor = "text-blue-600", 
    iconBgColor = "bg-blue-100",
    gradient = false,
    delay = 0,
    children, 
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, delay)
      return () => clearTimeout(timer)
    }, [delay])

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-500 transform",
          gradient && "bg-gradient-to-br from-white to-gray-50",
          isVisible 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 translate-y-4 scale-95",
          "hover:shadow-lg hover:-translate-y-1 hover:scale-105",
          className
        )}
        style={{ transitionDelay: `${delay}ms` }}
        {...props}
      >
        {Icon && (
          <div className="p-6 pb-0">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
              iconBgColor
            )}>
              <Icon className={cn("w-6 h-6", iconColor)} />
            </div>
          </div>
        )}
        <div className={cn("p-6", Icon && "pt-0")}>
          {children}
        </div>
      </div>
    )
  }
)
AnimatedCard.displayName = "AnimatedCard"

// Specialized stat card with animation
interface StatCardProps extends Omit<AnimatedCardProps, 'children'> {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    label: string
    positive: boolean
  }
  loading?: boolean
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ 
    title, 
    value, 
    description, 
    trend, 
    loading = false,
    ...props 
  }, ref) => {
    if (loading) {
      return (
        <AnimatedCard ref={ref} {...props}>
          <div className="space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
            <div className="h-8 bg-muted animate-pulse rounded w-1/2"></div>
            <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
          </div>
        </AnimatedCard>
      )
    }

    return (
      <AnimatedCard ref={ref} {...props}>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-3xl font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center text-sm font-medium",
              trend.positive ? "text-green-600" : "text-red-600"
            )}>
              <span className="mr-1">
                {trend.positive ? "↗" : "↘"}
              </span>
              {trend.value}% {trend.label}
            </div>
          )}
        </div>
      </AnimatedCard>
    )
  }
)
StatCard.displayName = "StatCard"

export { AnimatedCard, StatCard }




