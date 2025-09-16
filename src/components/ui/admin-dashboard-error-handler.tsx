'use client'

import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, AlertTriangle, Database, Shield, User } from 'lucide-react'

interface AdminDashboardErrorHandlerProps {
  error: Error | null
  onRetry: () => void
  userRole?: string
  isAuthenticated?: boolean
}

export function AdminDashboardErrorHandler({ 
  error, 
  onRetry, 
  userRole, 
  isAuthenticated 
}: AdminDashboardErrorHandlerProps) {
  if (!error) return null

  const getErrorType = (error: Error) => {
    const message = error.message.toLowerCase()
    
    if (message.includes('permission') || message.includes('access restricted')) {
      return 'permission'
    }
    if (message.includes('network') || message.includes('connection')) {
      return 'network'
    }
    if (message.includes('firestore') || message.includes('database')) {
      return 'database'
    }
    return 'unknown'
  }

  const errorType = getErrorType(error)

  const getErrorIcon = () => {
    switch (errorType) {
      case 'permission':
        return <Shield className="h-4 w-4" />
      case 'network':
        return <RefreshCw className="h-4 w-4" />
      case 'database':
        return <Database className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getErrorTitle = () => {
    switch (errorType) {
      case 'permission':
        return 'Access Permission Error'
      case 'network':
        return 'Network Connection Error'
      case 'database':
        return 'Database Connection Error'
      default:
        return 'Dashboard Error'
    }
  }

  const getErrorDescription = () => {
    switch (errorType) {
      case 'permission':
        return 'Your account does not have sufficient permissions to access the admin dashboard. Please contact your system administrator.'
      case 'network':
        return 'Unable to connect to the server. Please check your internet connection and try again.'
      case 'database':
        return 'Database connection failed. The system is experiencing technical difficulties.'
      default:
        return 'An unexpected error occurred while loading the dashboard data.'
    }
  }

  const getDebugInfo = () => {
    return {
      userRole: userRole || 'Unknown',
      isAuthenticated: isAuthenticated ? 'Yes' : 'No',
      errorMessage: error.message,
      errorType,
      timestamp: new Date().toISOString()
    }
  }

  const debugInfo = getDebugInfo()

  return (
    <div className="space-y-4">
      <Alert className="border-red-200 bg-red-50">
        {getErrorIcon()}
        <AlertDescription className="text-red-800">
          <div className="font-semibold mb-2">{getErrorTitle()}</div>
          <div className="mb-4">{getErrorDescription()}</div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Debug Information */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>User Role:</strong> {debugInfo.userRole}</div>
            <div><strong>Authenticated:</strong> {debugInfo.isAuthenticated}</div>
            <div><strong>Error Type:</strong> {debugInfo.errorType}</div>
            <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
            <div><strong>Error Message:</strong> {debugInfo.errorMessage}</div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting Steps */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-blue-800">
            Troubleshooting Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-blue-700 space-y-2">
            <div>1. <strong>Check Authentication:</strong> Ensure you're logged in with an admin account</div>
            <div>2. <strong>Refresh Page:</strong> Try refreshing the browser page</div>
            <div>3. <strong>Clear Cache:</strong> Clear browser cache and cookies</div>
            <div>4. <strong>Contact Support:</strong> If the issue persists, contact your system administrator</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



