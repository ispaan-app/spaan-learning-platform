'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Clock,
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BookOpen,
  Building2,
  Calendar,
  Timer,
  MapPin,
  TrendingUp,
  Activity,
  Eye,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore'
import { cn } from '@/lib/utils'

interface LearnerActivity {
  id: string
  learnerId: string
  learnerName: string
  learnerEmail: string
  learnerAvatar?: string
  action: LearnerActionType
  details: string
  timestamp: string
  location?: string
  metadata?: Record<string, any>
  status: 'active' | 'completed' | 'pending' | 'error'
}

type LearnerActionType = 
  | 'check_in'
  | 'check_out'
  | 'hours_logged'
  | 'leave_requested'
  | 'leave_approved'
  | 'leave_rejected'
  | 'placement_started'
  | 'placement_completed'
  | 'issue_reported'
  | 'issue_resolved'
  | 'profile_updated'
  | 'document_uploaded'
  | 'session_attended'
  | 'session_missed'
  | 'goal_achieved'
  | 'milestone_reached'

interface LearnerActivityFeedProps {
  className?: string
}

export function LearnerActivityFeed({ className }: LearnerActivityFeedProps) {
  const [activities, setActivities] = useState<LearnerActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const loadLearnerActivities = useCallback(async () => {
    try {
      setLoading(true)
      const activitiesSnapshot = await getDocs(query(
        collection(db, 'learner-activities'),
        orderBy('timestamp', 'desc'),
        limit(20)
      ))

      const activitiesData = activitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LearnerActivity[]

      setActivities(activitiesData)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading learner activities:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const subscribeToLearnerActivities = useCallback(() => {
    const activitiesRef = collection(db, 'learner-activities')
    const q = query(
      activitiesRef,
      orderBy('timestamp', 'desc'),
      limit(20)
    )

    return onSnapshot(q, 
      (snapshot) => {
        const activitiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LearnerActivity[]
        
        setActivities(activitiesData)
        setLastUpdate(new Date())
        setIsConnected(true)
      },
      (error) => {
        console.error('Error subscribing to learner activities:', error)
        setIsConnected(false)
      }
    )
  }, [])

  useEffect(() => {
    // Initial load
    loadLearnerActivities()

    // Set up real-time subscription
    const unsubscribe = subscribeToLearnerActivities()

    return () => {
      unsubscribe()
    }
  }, [loadLearnerActivities, subscribeToLearnerActivities])

  const getActionIcon = (action: LearnerActionType) => {
    const iconMap: Record<LearnerActionType, React.ReactNode> = {
      'check_in': <Clock className="w-4 h-4 text-green-600" />,
      'check_out': <Clock className="w-4 h-4 text-blue-600" />,
      'hours_logged': <Timer className="w-4 h-4 text-purple-600" />,
      'leave_requested': <Calendar className="w-4 h-4 text-orange-600" />,
      'leave_approved': <CheckCircle className="w-4 h-4 text-green-600" />,
      'leave_rejected': <XCircle className="w-4 h-4 text-red-600" />,
      'placement_started': <Building2 className="w-4 h-4 text-blue-600" />,
      'placement_completed': <CheckCircle className="w-4 h-4 text-green-600" />,
      'issue_reported': <AlertTriangle className="w-4 h-4 text-red-600" />,
      'issue_resolved': <CheckCircle className="w-4 h-4 text-green-600" />,
      'profile_updated': <User className="w-4 h-4 text-gray-600" />,
      'document_uploaded': <BookOpen className="w-4 h-4 text-indigo-600" />,
      'session_attended': <CheckCircle className="w-4 h-4 text-green-600" />,
      'session_missed': <XCircle className="w-4 h-4 text-red-600" />,
      'goal_achieved': <TrendingUp className="w-4 h-4 text-green-600" />,
      'milestone_reached': <Activity className="w-4 h-4 text-purple-600" />
    }

    return iconMap[action] || <Activity className="w-4 h-4 text-gray-600" />
  }

  const getActionBadge = (action: LearnerActionType, status: string) => {
    const baseBadges: Record<LearnerActionType, { variant: string; text: string; className: string }> = {
      'check_in': { variant: 'default', text: 'Checked In', className: 'bg-green-100 text-green-800' },
      'check_out': { variant: 'default', text: 'Checked Out', className: 'bg-blue-100 text-blue-800' },
      'hours_logged': { variant: 'default', text: 'Hours Logged', className: 'bg-purple-100 text-purple-800' },
      'leave_requested': { variant: 'default', text: 'Leave Requested', className: 'bg-orange-100 text-orange-800' },
      'leave_approved': { variant: 'default', text: 'Leave Approved', className: 'bg-green-100 text-green-800' },
      'leave_rejected': { variant: 'destructive', text: 'Leave Rejected', className: 'bg-red-100 text-red-800' },
      'placement_started': { variant: 'default', text: 'Placement Started', className: 'bg-blue-100 text-blue-800' },
      'placement_completed': { variant: 'default', text: 'Placement Completed', className: 'bg-green-100 text-green-800' },
      'issue_reported': { variant: 'destructive', text: 'Issue Reported', className: 'bg-red-100 text-red-800' },
      'issue_resolved': { variant: 'default', text: 'Issue Resolved', className: 'bg-green-100 text-green-800' },
      'profile_updated': { variant: 'outline', text: 'Profile Updated', className: 'bg-gray-100 text-gray-800' },
      'document_uploaded': { variant: 'default', text: 'Document Uploaded', className: 'bg-indigo-100 text-indigo-800' },
      'session_attended': { variant: 'default', text: 'Session Attended', className: 'bg-green-100 text-green-800' },
      'session_missed': { variant: 'destructive', text: 'Session Missed', className: 'bg-red-100 text-red-800' },
      'goal_achieved': { variant: 'default', text: 'Goal Achieved', className: 'bg-green-100 text-green-800' },
      'milestone_reached': { variant: 'default', text: 'Milestone Reached', className: 'bg-purple-100 text-purple-800' }
    }

    const base = baseBadges[action]
    const statusClass = status === 'error' ? 'bg-red-100 text-red-800' : 
                       status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                       base.className

    return (
      <Badge className={statusClass}>
        {base.text}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) {
      return 'Just now'
    }
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600'
      case 'completed':
        return 'text-blue-600'
      case 'pending':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Learner Activity Feed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading learner activities...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Learner Activity Feed</span>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span className="text-xs text-gray-500">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              Last update: {formatTimestamp(lastUpdate.toISOString())}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadLearnerActivities}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Learner Activity
            </h3>
            <p className="text-gray-600">
              Learner activities will appear here in real-time as they perform actions.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(activity.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={activity.learnerAvatar} />
                        <AvatarFallback>
                          {activity.learnerName?.charAt(0).toUpperCase() || 'L'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900">
                        {activity.learnerName || 'Unknown Learner'}
                      </span>
                      {getActionBadge(activity.action, activity.status)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={cn("text-xs", getStatusColor(activity.status))}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-1">
                    {activity.details}
                  </p>
                  
                  {activity.location && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{activity.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="pt-3 border-t border-gray-200 mt-4">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/admin/learners">
              <Eye className="w-4 h-4 mr-2" />
              View All Learners
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
