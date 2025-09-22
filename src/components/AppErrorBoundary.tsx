'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
      retryCount: this.state.retryCount + 1
    })

    // Log error to monitoring service
    this.logErrorToService(error, errorInfo)
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Log to console for now, in production this would go to a monitoring service
      console.error('Error logged to monitoring service:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        retryCount: this.state.retryCount
      })
    } catch (logError) {
      console.error('Failed to log error to monitoring service:', logError)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, retryCount } = this.state
      const isNetworkError = error?.message?.includes('network') || 
                            error?.message?.includes('fetch') ||
                            error?.message?.includes('timeout')
      const isFirebaseError = error?.message?.includes('firebase') ||
                             error?.message?.includes('permission-denied')
      const isAuthError = error?.message?.includes('auth') ||
                         error?.message?.includes('unauthorized')

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                {isNetworkError ? 'Connection Error' :
                 isFirebaseError ? 'Database Error' :
                 isAuthError ? 'Authentication Error' :
                 'Something went wrong'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  {isNetworkError ? 'Please check your internet connection and try again.' :
                   isFirebaseError ? 'There was an issue accessing the database. Please try again.' :
                   isAuthError ? 'There was an authentication issue. Please log in again.' :
                   'An unexpected error occurred. Please try again.'}
                </p>
                
                {retryCount > 0 && (
                  <p className="text-sm text-gray-500 mb-4">
                    Retry attempts: {retryCount}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  disabled={retryCount >= 3}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full"
                >
                  Reload Page
                </Button>
                
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Link>
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
                  <summary className="cursor-pointer font-medium">Error Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap text-gray-700">
                    {error.message}
                    {error.stack && `\n\nStack trace:\n${error.stack}`}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useAppErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useAppErrorHandler:', error)
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { handleError, resetError }
}
