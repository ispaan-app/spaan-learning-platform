'use client'

import React from 'react'
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
  Eye
} from 'lucide-react'

interface RecentActivity {
  id?: string
  adminName?: string
  action?: string
  target?: string
  timestamp?: string
  details?: string
}

interface RecentPlatformActivityProps {
  activities: RecentActivity[]
}

export function RecentPlatformActivity({ activities }: RecentPlatformActivityProps) {
  // Safety check for activities array
  const safeActivities = Array.isArray(activities) ? activities : []
  const getActionIcon = (action: string | undefined) => {
    if (!action || typeof action !== 'string') return <Clock className="w-4 h-4 text-gray-600" />
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
    
    return <Clock className="w-4 h-4 text-gray-600" />
  }

  const getActionBadge = (action: string | undefined) => {
    if (!action || typeof action !== 'string') return <Badge variant="outline">Unknown</Badge>
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

  const truncateText = (text: string | undefined | null, maxLength: number = 50) => {
    // Handle null, undefined, or non-string values
    if (!text || typeof text !== 'string') return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (safeActivities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Recent Activity
        </h3>
        <p className="text-gray-600">
          Platform activity will appear here as admins perform actions.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {safeActivities.map((activity, index) => (
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
                  {activity.adminName || 'Unknown Admin'}
                </span>
                {getActionBadge(activity.action || 'Unknown Action')}
              </div>
              <span className="text-xs text-gray-500">
                {activity.timestamp ? formatTimestamp(activity.timestamp) : 'Unknown time'}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">{activity.action || 'Unknown Action'}</span>
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
      
      <div className="pt-3 border-t border-gray-200">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href="/admin/audit-logs">
            <Eye className="w-4 h-4 mr-2" />
            View All Logs
          </Link>
        </Button>
      </div>
    </div>
  )
}

