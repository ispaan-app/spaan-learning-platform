'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Clock, User, ExternalLink } from 'lucide-react'
import { UpcomingSession } from '@/lib/learner-dashboard-helpers'
import { cn } from '@/lib/utils'

interface UpcomingSessionsProps {
  sessions: UpcomingSession[]
  className?: string
}

export function UpcomingSessions({ sessions, className }: UpcomingSessionsProps) {
  if (sessions.length === 0) {
    return (
      <Card className={cn("shadow-lg border", className)} style={{ background: 'rgba(245, 240, 225, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(245, 240, 225, 0.3)' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Upcoming Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No upcoming sessions scheduled</p>
            <p className="text-sm text-gray-500 mt-2">
              Check back later for new training sessions and workshops
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("shadow-lg border", className)} style={{ background: 'rgba(245, 240, 225, 0.9)', backdropFilter: 'blur(10px)', borderColor: 'rgba(245, 240, 225, 0.3)' }}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Upcoming Sessions</span>
          </div>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            {sessions.length} scheduled
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{session.title}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{session.date} at {session.time}</span>
                  </div>
                  {session.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{session.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <Badge
                variant={session.status === 'scheduled' ? 'default' : 'secondary'}
                className={cn(
                  "ml-2",
                  session.status === 'scheduled' && "bg-green-100 text-green-800 border-green-200",
                  session.status === 'cancelled' && "bg-red-100 text-red-800 border-red-200"
                )}
              >
                {session.status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Facilitator: {session.facilitator}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Details
              </Button>
            </div>
          </div>
        ))}
        
        {sessions.length > 3 && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              View All Sessions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
