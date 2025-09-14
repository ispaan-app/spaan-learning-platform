'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  AlertTriangle, 
  RefreshCw, 
  Shield, 
  Database,
  Wifi,
  Settings
} from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })
    this.props.onError?.(error, errorInfo)
    
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const error = this.state.error
      const isFirestoreError = error?.message?.includes('permission-denied') || 
                              error?.message?.includes('Missing or insufficient permissions')
      const isNetworkError = error?.message?.includes('Failed to fetch') ||
                            error?.message?.includes('NetworkError')
      const isAuthError = error?.message?.includes('auth') || 
                         error?.message?.includes('unauthorized')

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                {isFirestoreError ? (
                  <Database className="w-6 h-6 text-red-600" />
                ) : isNetworkError ? (
                  <Wifi className="w-6 h-6 text-red-600" />
                ) : isAuthError ? (
                  <Shield className="w-6 h-6 text-red-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <CardTitle className="text-xl">
                {isFirestoreError ? 'Database Access Issue' :
                 isNetworkError ? 'Connection Problem' :
                 isAuthError ? 'Authentication Error' :
                 'Something went wrong'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className={isFirestoreError ? 'border-orange-200 bg-orange-50' : 'border-red-200 bg-red-50'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {isFirestoreError ? (
                    <div className="space-y-2">
                      <p className="font-medium">Firestore Security Rules Issue</p>
                      <p className="text-sm">
                        The database security rules are preventing access. This is likely a configuration issue.
                      </p>
                      <div className="text-xs space-y-1">
                        <p>• Check Firestore security rules in Firebase Console</p>
                        <p>• Ensure authenticated users have read/write access</p>
                        <p>• Contact your administrator if the issue persists</p>
                      </div>
                    </div>
                  ) : isNetworkError ? (
                    <div className="space-y-2">
                      <p className="font-medium">Network Connection Issue</p>
                      <p className="text-sm">
                        Unable to connect to the server. Please check your internet connection.
                      </p>
                    </div>
                  ) : isAuthError ? (
                    <div className="space-y-2">
                      <p className="font-medium">Authentication Required</p>
                      <p className="text-sm">
                        You need to log in to access this page.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-medium">Unexpected Error</p>
                      <p className="text-sm">
                        An unexpected error occurred. Please try again.
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col space-y-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                {isAuthError && (
                  <Button variant="outline" asChild className="w-full">
                    <a href="/login">
                      <Shield className="w-4 h-4 mr-2" />
                      Go to Login
                    </a>
                  </Button>
                )}
                
                <Button variant="ghost" asChild className="w-full">
                  <a href="/">
                    <Settings className="w-4 h-4 mr-2" />
                    Go Home
                  </a>
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
                  <summary className="cursor-pointer font-medium mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="whitespace-pre-wrap text-xs">
                    {error?.stack}
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
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = () => setError(null)

  const handleError = (error: Error) => {
    setError(error)
    console.error('Error caught by useErrorHandler:', error)
  }

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { handleError, resetError }
}



