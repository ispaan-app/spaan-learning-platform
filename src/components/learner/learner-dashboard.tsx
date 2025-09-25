'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { WelcomeCard } from '@/components/ui/welcome-card'
import { 
  Clock, 
  MapPin, 
  Calendar, 
  BookOpen, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  User,
  MessageCircle,
  Upload
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LearnerData {
  name: string
  program: string
  currentPlacement?: {
    companyName: string
    role: string
    status: 'active' | 'on-leave' | 'suspended'
    startDate: string
  }
  workHours: {
    current: number
    target: number
    lastLogged: string
  }
  upcomingClasses: Array<{
    id: string
    title: string
    date: string
    time: string
    location: string
  }>
  stipendStatus: 'eligible' | 'prorata' | 'not-eligible'
  lastStipendDate?: string
}

interface LearnerDashboardProps {
  initialData: LearnerData
}

export function LearnerDashboard({ initialData }: LearnerDashboardProps) {
  const [data, setData] = useState<LearnerData>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would fetch updated data
      setData(prev => ({
        ...prev,
        workHours: {
          ...prev.workHours,
          current: Math.min(prev.workHours.current + 0.1, prev.workHours.target)
        }
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getStipendStatus = (hours: number, target: number) => {
    const percentage = (hours / target) * 100
    if (percentage >= 100) return { status: 'eligible', label: 'Full Stipend', color: 'bg-green-500' }
    if (percentage >= 50) return { status: 'prorata', label: 'Prorata Stipend', color: 'bg-yellow-500' }
    return { status: 'not-eligible', label: 'No Stipend', color: 'bg-red-500' }
  }

  const stipendInfo = getStipendStatus(data.workHours.current, data.workHours.target)
  const progressPercentage = (data.workHours.current / data.workHours.target) * 100

  const handleCheckIn = () => {
    router.push('/learner/check-in')
  }

  const handleReportStipendIssue = () => {
    router.push('/learner/report-issue')
  }

  const handleAIMentor = () => {
    router.push('/learner/mentor')
  }

  const handleManageDocuments = () => {
    router.push('/learner/documents')
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <WelcomeCard 
        userName={data.name}
        userRole="learner"
        className="mb-6"
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work-Integrated Learning Progress Card */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <Clock className="h-6 w-6 text-blue-600" />
              <span>Work-Integrated Learning Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Hours Logged This Month</span>
                <span className="font-semibold">{data.workHours.current.toFixed(1)} / {data.workHours.target}</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0 hours</span>
                <span>{data.workHours.target} hours</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${stipendInfo.color}`}></div>
                <span className="font-medium">{stipendInfo.label}</span>
              </div>
              <Badge variant={stipendInfo.status === 'eligible' ? 'default' : 'secondary'}>
                {Math.round(progressPercentage)}% Complete
              </Badge>
            </div>

            <div className="text-sm text-gray-600">
              <p>Last logged: {data.workHours.lastLogged}</p>
              <p>Target: 160 hours per month</p>
            </div>

            <Button 
              onClick={handleCheckIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Log Hours / Check-In
            </Button>
          </CardContent>
        </Card>

        {/* Placement Details Card */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <MapPin className="h-6 w-6 text-green-600" />
              <span>Current Placement</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.currentPlacement ? (
              <>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border">
                    <div className="text-sm text-gray-600">Company</div>
                    <div className="font-semibold text-lg">{data.currentPlacement.companyName}</div>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border">
                    <div className="text-sm text-gray-600">Role</div>
                    <div className="font-semibold">{data.currentPlacement.role}</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <Badge 
                        variant={data.currentPlacement.status === 'active' ? 'default' : 'secondary'}
                        className={data.currentPlacement.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}
                      >
                        {data.currentPlacement.status === 'active' ? 'Active' : 
                         data.currentPlacement.status === 'on-leave' ? 'On Leave' : 'Suspended'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Since</div>
                      <div className="text-sm font-medium">{data.currentPlacement.startDate}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={handleReportStipendIssue}
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Report Stipend Issue
                  </Button>
                  
                  <Button 
                    onClick={handleManageDocuments}
                    variant="outline"
                    className="w-full"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Documents
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No active placement assigned</p>
                <p className="text-sm text-gray-500">Contact your program coordinator for placement updates</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Class Sessions Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Calendar className="h-6 w-6 text-purple-600" />
            <span>Upcoming Class Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.upcomingClasses.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingClasses.map((classSession) => (
                <div key={classSession.id} className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{classSession.title}</h4>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{classSession.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{classSession.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{classSession.location}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      Upcoming
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No upcoming classes scheduled</p>
              <p className="text-sm text-gray-500">Check back later for new sessions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - AI Mentor */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI Career Mentor</h3>
                <p className="text-sm text-gray-600">Get personalized career advice and guidance</p>
              </div>
            </div>
            <Button 
              onClick={handleAIMentor}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Start Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}































