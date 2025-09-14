'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Settings,
  Eye,
  RefreshCw,
  Activity
} from 'lucide-react'

interface AuditLog {
  id: string
  adminName: string
  action: string
  target: string | null | undefined
  timestamp: string
  details?: string | null | undefined
  adminRole: string
}

interface RecentActivityProps {
  activities: AuditLog[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase()
    
    if (actionLower.includes('approve') || actionLower.includes('accepted')) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    if (actionLower.includes('reject') || actionLower.includes('denied')) {
      return <XCircle className="w-4 h-4 text-red-600" />
    }
    if (actionLower.includes('review') || actionLower.includes('view')) {
      return <Eye className="w-4 h-4 text-blue-600" />
    }
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return <FileText className="w-4 h-4 text-purple-600" />
    }
    if (actionLower.includes('update') || actionLower.includes('modify')) {
      return <Settings className="w-4 h-4 text-orange-600" />
    }
    if (actionLower.includes('error') || actionLower.includes('failed')) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />
    }
    
    return <Activity className="w-4 h-4 text-gray-600" />
  }

  const getActionBadge = (action: string) => {
    const actionLower = action.toLowerCase()
    
    if (actionLower.includes('approve') || actionLower.includes('accepted')) {
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>
    }
    if (actionLower.includes('reject') || actionLower.includes('denied')) {
      return <Badge variant="destructive">Rejected</Badge>
    }
    if (actionLower.includes('review') || actionLower.includes('view')) {
      return <Badge className="bg-blue-100 text-blue-800">Review</Badge>
    }
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return <Badge className="bg-purple-100 text-purple-800">Created</Badge>
    }
    if (actionLower.includes('update') || actionLower.includes('modify')) {
      return <Badge className="bg-orange-100 text-orange-800">Updated</Badge>
    }
    if (actionLower.includes('error') || actionLower.includes('failed')) {
      return <Badge variant="destructive">Error</Badge>
    }
    
    return <Badge variant="outline">Action</Badge>
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super-admin':
        return <Badge className="bg-purple-100 text-purple-800">Super Admin</Badge>
      case 'admin':
        return <Badge className="bg-blue-100 text-blue-800">Admin</Badge>
      default:
        return <Badge variant="outline">User</Badge>
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return 'Just now'
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    }
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}h ago`
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateText = (text: string | null | undefined, maxLength: number = 60) => {
    if (!text || typeof text !== 'string') return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate refresh - in real implementation, this would refetch data
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Recent Activity
        </h3>
        <p className="text-gray-600 mb-4">
          Platform activity will appear here as administrators perform actions.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Latest Actions</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <div 
            key={activity.id || index}
            className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="flex-shrink-0 mt-1">
              {getActionIcon(activity.action)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {activity.adminName}
                  </span>
                  {getRoleBadge(activity.adminRole)}
                  {getActionBadge(activity.action)}
                </div>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">{activity.action}</span>
                {activity.target && (
                  <span className="text-gray-600"> {truncateText(activity.target)}</span>
                )}
              </p>
              
              {activity.details && (
                <p className="text-xs text-gray-500">
                  {truncateText(activity.details, 80)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer with link to full logs */}
      <div className="pt-3 border-t border-gray-200">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href="/super-admin/audit-logs">
            <Eye className="w-4 h-4 mr-2" />
            View All Audit Logs
          </Link>
        </Button>
      </div>
    </div>
  )
}

