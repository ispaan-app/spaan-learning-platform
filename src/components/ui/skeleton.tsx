import * as React from "react"
import { cn } from "@/lib/utils"

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "animate-pulse rounded-md bg-muted/50",
      className
    )}
    {...props}
  />
))
Skeleton.displayName = "Skeleton"

// Card skeleton for dashboard cards
const CardSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm p-6",
      className
    )}
    {...props}
  >
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
    <Skeleton className="h-8 w-20 mb-2" />
    <Skeleton className="h-4 w-24" />
  </div>
))
CardSkeleton.displayName = "CardSkeleton"

// Table skeleton for data tables
const TableSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { rows?: number }
>(({ className, rows = 5, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-3", className)}
    {...props}
  >
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
))
TableSkeleton.displayName = "TableSkeleton"

// Chart skeleton for dashboard charts
const ChartSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card p-6",
      className
    )}
    {...props}
  >
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="h-64 flex items-end space-x-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 bg-gradient-to-t from-muted to-muted/30"
          style={{ height: `${Math.random() * 60 + 20}%` }}
        />
      ))}
    </div>
  </div>
))
ChartSkeleton.displayName = "ChartSkeleton"

// List skeleton for activity feeds
const ListSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { items?: number }
>(({ className, items = 4, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-4", className)}
    {...props}
  >
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-start space-x-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    ))}
  </div>
))
ListSkeleton.displayName = "ListSkeleton"

// Dashboard stats skeleton
const StatsSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}
    {...props}
  >
    {Array.from({ length: 4 }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
))
StatsSkeleton.displayName = "StatsSkeleton"

export { 
  Skeleton, 
  CardSkeleton, 
  TableSkeleton, 
  ChartSkeleton, 
  ListSkeleton, 
  StatsSkeleton 
}




