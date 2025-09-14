'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Users, 
  Award,
  TrendingUp,
  Calendar,
  ArrowRight
} from 'lucide-react'

interface Activity {
  id: string
  type: 'success' | 'warning' | 'info' | 'achievement'
  title: string
  description: string
  timestamp: string
  user?: {
    name: string
    avatar?: string
  }
  action?: {
    label: string
    href: string
  }
}

interface ProfileActivitiesProps {
  activities: Activity[]
  userRole: 'super-admin' | 'admin' | 'applicant' | 'learner'
  showAll?: boolean
}

const activityConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  info: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  achievement: {
    icon: Award,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
}

export function ProfileActivities({ activities, userRole, showAll = false }: ProfileActivitiesProps) {
  const displayActivities = showAll ? activities : activities.slice(0, 5)
  const config = activityConfig

  const getRoleSpecificTitle = () => {
    switch (userRole) {
      case 'super-admin':
        return 'Platform Activities'
      case 'admin':
        return 'Admin Actions'
      case 'applicant':
        return 'Application Progress'
      case 'learner':
        return 'Learning Journey'
      default:
        return 'Recent Activities'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[#6D9773]" />
            <span>{getRoleSpecificTitle()}</span>
          </CardTitle>
          {!showAll && activities.length > 5 && (
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No activities yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayActivities.map((activity, index) => {
              const activityType = config[activity.type]
              const Icon = activityType.icon
              
              return (
                <div
                  key={activity.id}
                  className={`p-4 rounded-lg border ${activityType.bgColor} ${activityType.borderColor} group hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full ${activityType.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${activityType.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 group-hover:text-[#0C3B2E] transition-colors">
                            {activity.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                            </div>
                            
                            {activity.user && (
                              <div className="flex items-center space-x-2">
                                <Avatar className="w-5 h-5">
                                  <AvatarImage src={activity.user.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {activity.user.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-gray-500">{activity.user.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {activity.action && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <a href={activity.action.href}>
                              {activity.action.label}
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}





