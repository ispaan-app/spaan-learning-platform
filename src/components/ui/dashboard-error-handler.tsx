'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Database, 
  RefreshCw, 
  AlertTriangle, 
  Shield,
  Wifi,
  CheckCircle
} from 'lucide-react'

interface DashboardErrorHandlerProps {
  children: ReactNode
  fallback?: ReactNode
}

export function DashboardErrorHandler({ children, fallback }: DashboardErrorHandlerProps) {
  const [error, setError] = useState<Error | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('permission-denied') || 
          event.error?.message?.includes('Missing or insufficient permissions')) {
        setError(event.error)
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    
    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setError(null)
    setIsRetrying(false)
  }

  const handleDismiss = () => {
    setError(null)
  }

  if (error) {
    const isFirestoreError = error.message.includes('permission-denied') || 
                            error.message.includes('Missing or insufficient permissions')
    const isNetworkError = error.message.includes('Failed to fetch') ||
                          error.message.includes('NetworkError')

    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="space-y-6">
        {/* Error Banner */}
        <Alert className={isFirestoreError ? 'border-orange-200 bg-orange-50' : 'border-red-200 bg-red-50'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <div className="font-medium text-sm">
                  {isFirestoreError ? 'Database Access Issue' : 
                   isNetworkError ? 'Connection Problem' : 
                   'Error Loading Data'}
                </div>
                <div className="text-xs mt-1 opacity-80">
                  {isFirestoreError ? 
                    'Firestore security rules are blocking access. Contact your administrator.' :
                    isNetworkError ?
                    'Unable to connect to the server. Please check your connection.' :
                    'An error occurred while loading the dashboard data.'
                  }
                </div>
              </div>
              {retryCount > 0 && (
                <div className="text-xs bg-white/50 px-2 py-1 rounded">
                  Retry {retryCount}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={isRetrying}
                className="h-7 px-3 text-xs"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                Retry
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-7 w-7 p-0"
              >
                ×
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Fallback Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Specific component for handling Firestore permission errors
export function FirestoreErrorHandler({ children }: { children: ReactNode }) {
  const [hasPermissionError, setHasPermissionError] = useState(false)

  useEffect(() => {
    const handleConsoleError = (event: any) => {
      if (event.detail?.message?.includes('permission-denied') || 
          event.detail?.message?.includes('Missing or insufficient permissions')) {
        setHasPermissionError(true)
      }
    }

    // Listen for custom error events
    window.addEventListener('firestore-error', handleConsoleError)
    
    // Also check console errors
    const originalError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      if (message.includes('permission-denied') || message.includes('Missing or insufficient permissions')) {
        setHasPermissionError(true)
      }
      originalError.apply(console, args)
    }

    return () => {
      window.removeEventListener('firestore-error', handleConsoleError)
      console.error = originalError
    }
  }, [])

  if (hasPermissionError) {
    return (
      <div className="space-y-6">
        <Alert className="border-orange-200 bg-orange-50">
          <Database className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">Database Access Restricted</div>
              <div className="text-sm">
                Firestore security rules are preventing data access. This is a configuration issue that needs to be resolved by your administrator.
              </div>
              <div className="text-xs space-y-1 mt-2">
                <div>• Check Firestore security rules in Firebase Console</div>
                <div>• Ensure authenticated users have proper permissions</div>
                <div>• Contact your system administrator</div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
        
        {/* Show skeleton loading for better UX */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return <>{children}</>
}



