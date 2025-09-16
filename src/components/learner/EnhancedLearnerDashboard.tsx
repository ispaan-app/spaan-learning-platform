'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  BookOpen, 
  Award, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  FileText, 
  MessageCircle, 
  CheckCircle, 
  AlertTriangle,
  User,
  RefreshCw,
  Bell,
  ExternalLink,
  Activity,
  Target,
  Zap,
  Brain,
  Star,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Heart,
  Crown,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard, QuickAction, RecentActivityItem } from '@/components/ui/enhanced-dashboard-layout'

interface LearnerStats {
  workHours: number
  targetHours: number
  completedCourses: number
  certificates: number
  upcomingClasses: number
  leaveRequests: number
  pendingDocuments: number
  placementStatus: 'active' | 'inactive' | 'pending'
}

interface RecentActivity {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  description: string
  time: string
  icon: React.ElementType
}

interface UpcomingClass {
  id: string
  title: string
  time: string
  location: string
  instructor: string
  type: 'lecture' | 'practical' | 'workshop'
}

export function EnhancedLearnerDashboard() {
  const [learnerStats, setLearnerStats] = useState<LearnerStats>({
    workHours: 0,
    targetHours: 160,
    completedCourses: 0,
    certificates: 0,
    upcomingClasses: 0,
    leaveRequests: 0,
    pendingDocuments: 0,
    placementStatus: 'inactive'
  })
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock data - replace with real Firebase data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setLearnerStats({
        workHours: 120,
        targetHours: 160,
        completedCourses: 8,
        certificates: 3,
        upcomingClasses: 2,
        leaveRequests: 1,
        pendingDocuments: 2,
        placementStatus: 'active'
      })
      
      setRecentActivity([
        {
          id: '1',
          type: 'success',
          title: 'Check-in completed',
          description: 'Successfully checked in at 9:00 AM',
          time: '2 hours ago',
          icon: CheckCircle
        },
        {
          id: '2',
          type: 'info',
          title: 'New course available',
          description: 'Advanced React Development course is now available',
          time: '4 hours ago',
          icon: BookOpen
        },
        {
          id: '3',
          type: 'warning',
          title: 'Document pending',
          description: 'Your ID document needs to be updated',
          time: '1 day ago',
          icon: AlertTriangle
        },
        {
          id: '4',
          type: 'success',
          title: 'Certificate earned',
          description: 'You earned a certificate in JavaScript Fundamentals',
          time: '2 days ago',
          icon: Award
        }
      ])
      
      setUpcomingClasses([
        {
          id: '1',
          title: 'React Advanced Patterns',
          time: 'Tomorrow, 10:00 AM',
          location: 'Room 201',
          instructor: 'Dr. Sarah Johnson',
          type: 'lecture'
        },
        {
          id: '2',
          title: 'Project Workshop',
          time: 'Friday, 2:00 PM',
          location: 'Lab 3',
          instructor: 'Prof. Mike Chen',
          type: 'workshop'
        }
      ])
      
      setIsLoading(false)
    }
    
    loadData()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getPlacementStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'inactive':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getClassTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'text-blue-600 bg-blue-100'
      case 'practical':
        return 'text-green-600 bg-green-100'
      case 'workshop':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25"></div>
        <Card className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Learning Dashboard</h2>
                    <p className="text-blue-100">Track your progress and stay on top of your goals</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{learnerStats.workHours}</div>
                    <div className="text-sm text-blue-100">Hours Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{learnerStats.completedCourses}</div>
                    <div className="text-sm text-blue-100">Courses Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{learnerStats.certificates}</div>
                    <div className="text-sm text-blue-100">Certificates</div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-6xl font-bold text-white/20">75%</div>
                <div className="text-sm text-blue-100">Overall Progress</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Work Hours"
          value={`${learnerStats.workHours}/${learnerStats.targetHours}`}
          change={15}
          changeType="increase"
          icon={Clock}
          color="bg-gradient-to-r from-blue-500 to-cyan-500"
          description="Monthly target progress"
          trend={[20, 25, 30, 35, 40, 45, 50]}
          loading={isLoading}
        />
        
        <StatCard
          title="Courses Completed"
          value={learnerStats.completedCourses}
          change={25}
          changeType="increase"
          icon={BookOpen}
          color="bg-gradient-to-r from-green-500 to-emerald-500"
          description="This semester"
          trend={[1, 2, 3, 4, 5, 6, 7]}
          loading={isLoading}
        />
        
        <StatCard
          title="Certificates"
          value={learnerStats.certificates}
          change={50}
          changeType="increase"
          icon={Award}
          color="bg-gradient-to-r from-yellow-500 to-orange-500"
          description="Achievements earned"
          trend={[0, 1, 1, 2, 2, 3, 3]}
          loading={isLoading}
        />
        
        <StatCard
          title="Upcoming Classes"
          value={learnerStats.upcomingClasses}
          change={0}
          changeType="neutral"
          icon={Calendar}
          color="bg-gradient-to-r from-purple-500 to-pink-500"
          description="This week"
          loading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickAction
            title="Check In/Out"
            description="Record your daily attendance"
            icon={Clock}
            color="bg-gradient-to-r from-blue-500 to-cyan-500"
            href="/learner/check-in"
            badge="Active"
          />
          
          <QuickAction
            title="AI Mentor"
            description="Get personalized learning guidance"
            icon={Brain}
            color="bg-gradient-to-r from-purple-500 to-pink-500"
            href="/learner/mentor"
            badge="New"
          />
          
          <QuickAction
            title="Leave Request"
            description="Submit time off requests"
            icon={Calendar}
            color="bg-gradient-to-r from-green-500 to-emerald-500"
            href="/learner/leave"
          />
          
          <QuickAction
            title="Documents"
            description="Manage your documents"
            icon={FileText}
            color="bg-gradient-to-r from-orange-500 to-red-500"
            href="/learner/documents"
            badge={learnerStats.pendingDocuments > 0 ? `${learnerStats.pendingDocuments} pending` : undefined}
          />
          
          <QuickAction
            title="Profile"
            description="Update your information"
            icon={User}
            color="bg-gradient-to-r from-indigo-500 to-purple-500"
            href="/learner/profile"
          />
          
          <QuickAction
            title="Notifications"
            description="View all notifications"
            icon={Bell}
            color="bg-gradient-to-r from-yellow-500 to-orange-500"
            href="/learner/notifications"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentActivity.map((activity) => (
                <RecentActivityItem
                  key={activity.id}
                  type={activity.type}
                  title={activity.title}
                  description={activity.description}
                  time={activity.time}
                  icon={activity.icon}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Classes */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span>Upcoming Classes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingClasses.map((classItem) => (
                <div key={classItem.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{classItem.title}</h4>
                    <Badge className={getClassTypeColor(classItem.type)}>
                      {classItem.type}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{classItem.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{classItem.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{classItem.instructor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Monthly Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Work Hours</span>
                <span className="text-sm font-semibold text-gray-900">
                  {learnerStats.workHours}/{learnerStats.targetHours}
                </span>
              </div>
              <Progress 
                value={(learnerStats.workHours / learnerStats.targetHours) * 100} 
                className="h-3"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Courses</span>
                <span className="text-sm font-semibold text-gray-900">
                  {learnerStats.completedCourses}/12
                </span>
              </div>
              <Progress 
                value={(learnerStats.completedCourses / 12) * 100} 
                className="h-3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Placement Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <span>Placement Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className={cn(
                "inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold",
                getPlacementStatusColor(learnerStats.placementStatus)
              )}>
                {learnerStats.placementStatus === 'active' && <CheckCircle className="w-4 h-4 mr-2" />}
                {learnerStats.placementStatus === 'pending' && <Clock className="w-4 h-4 mr-2" />}
                {learnerStats.placementStatus === 'inactive' && <AlertTriangle className="w-4 h-4 mr-2" />}
                {learnerStats.placementStatus.charAt(0).toUpperCase() + learnerStats.placementStatus.slice(1)}
              </div>
              
              <div className="text-sm text-gray-600">
                {learnerStats.placementStatus === 'active' && 'You are currently placed at a work location'}
                {learnerStats.placementStatus === 'pending' && 'Your placement is being processed'}
                {learnerStats.placementStatus === 'inactive' && 'No active placement at the moment'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
