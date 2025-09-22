'use client'

import { ComponentType, lazy, Suspense } from 'react'
import { PageLoader } from '@/components/ui/loading'

// Lazy loading wrapper with error boundary
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<any>,
  fallback?: ComponentType
) {
  const LazyComponent = lazy(async () => {
    const module = await importFn()
    // Handle both default and named exports
    if ('default' in module) {
      return module
    } else {
      // Find the first component export
      const componentName = Object.keys(module).find(key => 
        typeof module[key] === 'function' && 
        module[key].prototype?.isReactComponent !== undefined
      )
      if (componentName) {
        return { default: module[componentName] }
      }
      throw new Error('No component found in module')
    }
  })
  
  return function LazyWrapper(props: any) {
    const FallbackComponent = fallback || PageLoader
    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Predefined lazy components
export const LazyApplicantDashboard = createLazyComponent(
  () => import('@/components/applicant/ApplicantDashboard')
)

export const LazyLearnerDashboard = createLazyComponent(
  () => import('@/components/learner/LearnerDashboard')
)

export const LazyAdminDashboard = createLazyComponent(
  () => import('@/components/admin/ApplicantsReview')
)

export const LazySuperAdminDashboard = createLazyComponent(
  () => import('@/components/super-admin/GlobalStats')
)

export const LazySecurityDashboard = createLazyComponent(
  () => import('@/components/security/SecurityDashboard')
)

export const LazyApplicationForm = createLazyComponent(
  () => import('@/components/applicant/ApplyForm')
)

export const LazyDocumentUpload = createLazyComponent(
  () => import('@/components/applicant/DocumentUpload')
)

export const LazyApplicantsReview = createLazyComponent(
  () => import('@/components/admin/ApplicantsReview')
)

export const LazyCareerMentor = createLazyComponent(
  () => import('@/components/ai/CareerMentor')
)

export const LazySupportChat = createLazyComponent(
  () => import('@/components/ai/SupportChat')
)

export const LazyAppearanceForm = createLazyComponent(
  () => import('@/components/super-admin/AppearanceForm')
)

// Route-based code splitting
export const routeComponents = {
  '/applicant/dashboard': LazyApplicantDashboard,
  '/learner/dashboard': LazyLearnerDashboard,
  '/admin/dashboard': LazyAdminDashboard,
  '/super-admin/dashboard': LazySuperAdminDashboard,
  '/super-admin/security': LazySecurityDashboard,
  '/apply': LazyApplicationForm,
  '/applicant/documents': LazyDocumentUpload,
  '/admin/applicants': LazyApplicantsReview,
  '/learner/mentor': LazyCareerMentor,
  '/super-admin/appearance': LazyAppearanceForm
}

// Dynamic import utility
export async function dynamicImport<T>(
  modulePath: string,
  exportName: string = 'default'
): Promise<T> {
  try {
    const module = await import(modulePath)
    return module[exportName] as T
  } catch (error) {
    console.error(`Failed to load module ${modulePath}:`, error)
    throw error
  }
}

// Preload components
export function preloadComponent(componentPath: string): void {
  if (typeof window !== 'undefined') {
    // Preload the component
    import(componentPath).catch(error => {
      console.warn(`Failed to preload component ${componentPath}:`, error)
    })
  }
}

// Preload route components
export function preloadRoute(route: string): void {
  const componentPath = routeComponents[route as keyof typeof routeComponents]
  if (componentPath) {
    preloadComponent(componentPath.toString())
  }
}

// Intersection Observer for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false)

  React.useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, options])

  return isIntersecting
}

// Lazy loading hook
export function useLazyLoad<T>(
  loadFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const load = React.useCallback(async () => {
    if (data || loading) return

    setLoading(true)
    setError(null)

    try {
      const result = await loadFn()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [loadFn, data, loading, ...deps])

  return { data, loading, error, load }
}

// Bundle analyzer utility
export function analyzeBundle() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // This would integrate with webpack-bundle-analyzer
    console.log('Bundle analysis available in development mode')
  }
}

// Performance monitoring for lazy loading
export function monitorLazyLoad(componentName: string, startTime: number) {
  const loadTime = performance.now() - startTime
  
  if (typeof window !== 'undefined') {
    // Send to analytics or performance monitoring
    console.log(`Lazy loaded ${componentName} in ${loadTime.toFixed(2)}ms`)
    
    // Store in performance API
    performance.mark(`${componentName}-loaded`)
    performance.measure(
      `${componentName}-load-time`,
      `${componentName}-start`,
      `${componentName}-loaded`
    )
  }
}

// Route preloading strategy
export class RoutePreloader {
  private static instance: RoutePreloader
  private preloadedRoutes: Set<string> = new Set()
  private preloadQueue: string[] = []
  private isPreloading = false

  static getInstance(): RoutePreloader {
    if (!RoutePreloader.instance) {
      RoutePreloader.instance = new RoutePreloader()
    }
    return RoutePreloader.instance
  }

  // Preload route based on user behavior
  preloadRoute(route: string): void {
    if (this.preloadedRoutes.has(route)) return

    this.preloadQueue.push(route)
    this.processPreloadQueue()
  }

  // Preload multiple routes
  preloadRoutes(routes: string[]): void {
    routes.forEach(route => this.preloadRoute(route))
  }

  // Preload based on current route
  preloadRelatedRoutes(currentRoute: string): void {
    const relatedRoutes = this.getRelatedRoutes(currentRoute)
    this.preloadRoutes(relatedRoutes)
  }

  private async processPreloadQueue(): Promise<void> {
    if (this.isPreloading || this.preloadQueue.length === 0) return

    this.isPreloading = true

    while (this.preloadQueue.length > 0) {
      const route = this.preloadQueue.shift()!
      
      if (!this.preloadedRoutes.has(route)) {
        try {
          preloadRoute(route)
          this.preloadedRoutes.add(route)
        } catch (error) {
          console.warn(`Failed to preload route ${route}:`, error)
        }
      }

      // Add delay to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    this.isPreloading = false
  }

  private getRelatedRoutes(currentRoute: string): string[] {
    const routeMap: Record<string, string[]> = {
      '/applicant/dashboard': ['/applicant/documents', '/apply'],
      '/learner/dashboard': ['/learner/mentor', '/learner/check-in'],
      '/admin/dashboard': ['/admin/applicants', '/admin/learners'],
      '/super-admin/dashboard': ['/super-admin/security', '/super-admin/users'],
      '/login': ['/apply', '/login/user', '/login/admin']
    }

    return routeMap[currentRoute] || []
  }

  // Get preload statistics
  getStats(): { preloadedCount: number; queueLength: number } {
    return {
      preloadedCount: this.preloadedRoutes.size,
      queueLength: this.preloadQueue.length
    }
  }
}

// Export singleton
export const routePreloader = RoutePreloader.getInstance()

// Smart preloading based on user role
export function useSmartPreloading(userRole: string) {
  React.useEffect(() => {
    const routesToPreload = getRoutesForRole(userRole)
    routePreloader.preloadRoutes(routesToPreload)
  }, [userRole])
}

function getRoutesForRole(role: string): string[] {
  const roleRoutes: Record<string, string[]> = {
    'applicant': ['/applicant/documents', '/apply'],
    'learner': ['/learner/mentor', '/learner/check-in', '/learner/leave'],
    'admin': ['/admin/applicants', '/admin/learners', '/admin/placements'],
    'super-admin': ['/super-admin/security', '/super-admin/users', '/super-admin/audit-logs']
  }

  return roleRoutes[role] || []
}

// Import React for hooks
import React from 'react'
