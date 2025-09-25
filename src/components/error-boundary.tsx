'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo)
    }
  }

  private logErrorToService = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      await fetch('/api/error-logging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId: this.state.errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      })
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })
  }

  private handleGoHome = () => {
    const router = useRouter()
    router.push('/')
  }

  private handleReportBug = () => {
    const { error, errorId } = this.state
    const bugReportUrl = `/learner/report-issue?errorId=${errorId}&errorMessage=${encodeURIComponent(error?.message || 'Unknown error')}`
    window.open(bugReportUrl, '_blank')
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorId } = this.state

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Something went wrong
              </CardTitle>
              <p className="text-gray-600">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Error ID:</strong> {errorId}</p>
                    <p><strong>Message:</strong> {error?.message || 'Unknown error'}</p>
                    {process.env.NODE_ENV === 'development' && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">
                          Technical Details
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {error?.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  className="flex-1"
                  variant="outline"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
                
                <Button 
                  onClick={this.handleReportBug}
                  className="flex-1"
                  variant="outline"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  Report Bug
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>If this problem persists, please contact support with Error ID: <code className="bg-gray-100 px-1 rounded">{errorId}</code></p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to catch errors
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { handleError, resetError }
}

// Higher-order component for error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Global error handler for unhandled errors
export function setupGlobalErrorHandling() {
  if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      // Log to error service
      fetch('/api/error-logging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId: `promise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          message: 'Unhandled promise rejection',
          stack: event.reason?.stack || 'No stack trace available',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          type: 'unhandled_promise_rejection'
        })
      }).catch(console.error)
    })

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      console.error('Uncaught error:', event.error)
      
      // Log to error service
      fetch('/api/error-logging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId: `uncaught_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          message: event.error?.message || 'Uncaught error',
          stack: event.error?.stack || 'No stack trace available',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          type: 'uncaught_error'
        })
      }).catch(console.error)
    })
  }
}

export default ErrorBoundary
