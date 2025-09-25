'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ProgramService } from '@/lib/program-service'
import { getAdminDashboardData, AdminStats, RecentApplicant, RecentLearner, RecentActivity } from '@/lib/admin-dashboard-service'
import { 
  Users, 
  FileText, 
  Building2, 
  Calendar, 
  MessageCircle, 
  Clock, 
  BarChart3, 
  Settings,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  User,
  RefreshCw,
  Bell,
  ExternalLink,
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
  Eye,
  EyeOff,
  Plus,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard, QuickAction, RecentActivityItem } from '@/components/ui/enhanced-dashboard-layout'



interface UrgentAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  title: string
  description: string
  time: string
  priority: 'high' | 'medium' | 'low'
}

export function EnhancedAdminDashboard() {
  const [adminStats, setAdminStats] = useState<AdminStats>({
    pendingApplicants: 0,
    totalLearners: 0,
    activePlacements: 0,
    assignedLearners: 0,
    totalApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    activeClasses: 0
  })
  
  const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>([])
  const [recentLearners, setRecentLearners] = useState<RecentLearner[]>([])
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [urgentAlerts, setUrgentAlerts] = useState<UrgentAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string>('')
  const [programNames, setProgramNames] = useState<{ [key: string]: string }>({})
  
  const formatProgramName = (programId: string) => {
    return programNames[programId] || programId || 'Unknown Program'
  }

  // Load real Firebase data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const data = await getAdminDashboardData()
        
        setAdminStats(data.stats)
        setRecentApplicants(data.recentApplicants)
        setRecentLearners(data.recentLearners)
        setRecentActivities(data.recentActivities)
        
        // Mock urgent alerts for now (could be replaced with real alert system)
        setUrgentAlerts([
          {
            id: '1',
            type: 'warning',
            title: 'High Dropout Risk',
            description: '5 learners are at risk of dropping out',
            time: '2 hours ago',
            priority: 'high'
          },
          {
            id: '2',
            type: 'error',
            title: 'System Error',
            description: 'Attendance tracking system is down',
            time: '4 hours ago',
            priority: 'high'
          },
          {
            id: '3',
            type: 'info',
            title: 'New Applications',
            description: '12 new applications received today',
            time: '6 hours ago',
            priority: 'medium'
          }
        ])
      } catch (err) {
        console.error('Error loading admin dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Load program names for recent applicants
  useEffect(() => {
    if (recentApplicants.length > 0) {
      const uniqueProgramIds = Array.from(new Set(recentApplicants.map(a => a.program).filter(Boolean)))
      if (uniqueProgramIds.length > 0) {
        ProgramService.getProgramNamesByIds(uniqueProgramIds)
          .then(setProgramNames)
          .catch(error => {
            console.error('Error fetching program names:', error)
            const fallbackMap: { [key: string]: string } = {}
            uniqueProgramIds.forEach(id => {
              fallbackMap[id] = id
            })
            setProgramNames(fallbackMap)
          })
      }
    }
  }, [recentApplicants])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'approved':
        return 'text-green-600 bg-green-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      case 'info':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
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
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Administrator Dashboard</h2>
                    <p className="text-blue-100">Manage learners, applications, and platform operations</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{adminStats.totalLearners}</div>
                    <div className="text-sm text-blue-100">Total Learners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{adminStats.pendingApplicants}</div>
                    <div className="text-sm text-blue-100">Pending Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{adminStats.activePlacements}</div>
                    <div className="text-sm text-blue-100">Active Placements</div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-6xl font-bold text-white/20">89%</div>
                <div className="text-sm text-blue-100">System Health</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Applications"
          value={adminStats.pendingApplicants}
          change={12}
          changeType="increase"
          icon={FileText}
          color="bg-gradient-to-r from-yellow-500 to-orange-500"
          description="Require review"
          trend={[15, 18, 20, 22, 24, 26, 24]}
          loading={isLoading}
        />
        
        <StatCard
          title="Total Learners"
          value={adminStats.totalLearners}
          change={8}
          changeType="increase"
          icon={Users}
          color="bg-gradient-to-r from-blue-500 to-cyan-500"
          description="Active learners"
          trend={[140, 145, 150, 152, 154, 156, 156]}
          loading={isLoading}
        />
        
        <StatCard
          title="Active Placements"
          value={adminStats.activePlacements}
          change={5}
          changeType="increase"
          icon={Building2}
          color="bg-gradient-to-r from-green-500 to-emerald-500"
          description="Current placements"
          trend={[80, 82, 85, 87, 89, 91, 89]}
          loading={isLoading}
        />
        
        <StatCard
          title="Active Classes"
          value={adminStats.activeClasses}
          change={2}
          changeType="increase"
          icon={Calendar}
          color="bg-gradient-to-r from-purple-500 to-pink-500"
          description="Ongoing sessions"
          trend={[8, 9, 10, 11, 12, 13, 12]}
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
            title="Manage Applicants"
            description="Review and process applications"
            icon={FileText}
            color="bg-gradient-to-r from-yellow-500 to-orange-500"
            href="/admin/applicants"
            badge={`${adminStats.pendingApplicants} pending`}
          />
          
          <QuickAction
            title="Manage Learners"
            description="View and manage learner accounts"
            icon={Users}
            color="bg-gradient-to-r from-blue-500 to-cyan-500"
            href="/admin/learners"
          />
          
          <QuickAction
            title="Placements"
            description="Manage work placements"
            icon={Building2}
            color="bg-gradient-to-r from-green-500 to-emerald-500"
            href="/admin/placements"
          />
          
          <QuickAction
            title="Class Sessions"
            description="Schedule and manage classes"
            icon={Calendar}
            color="bg-gradient-to-r from-purple-500 to-pink-500"
            href="/admin/classes"
          />
          
          <QuickAction
            title="Reports"
            description="Generate analytics and reports"
            icon={BarChart3}
            color="bg-gradient-to-r from-indigo-500 to-purple-500"
            href="/admin/reports"
          />
          
          <QuickAction
            title="Settings"
            description="Configure platform settings"
            icon={Settings}
            color="bg-gradient-to-r from-gray-500 to-gray-600"
            href="/admin/settings"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applicants */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Recent Applicants</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentApplicants.map((applicant) => (
                <div key={applicant.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {applicant.firstName[0]}{applicant.lastName[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {applicant.firstName} {applicant.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{applicant.email}</p>
                      <p className="text-sm text-gray-500">{formatProgramName(applicant.program)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(applicant.status)}>
                      {applicant.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Urgent Alerts */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Urgent Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {urgentAlerts.map((alert) => (
                <div key={alert.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                    <Badge className={getPriorityColor(alert.priority)}>
                      {alert.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{alert.time}</span>
                    <Button variant="outline" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Application Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Application Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Approved</span>
                <span className="text-sm font-semibold text-gray-900">
                  {adminStats.approvedApplications}
                </span>
              </div>
              <Progress 
                value={(adminStats.approvedApplications / adminStats.totalApplications) * 100} 
                className="h-3"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Pending</span>
                <span className="text-sm font-semibold text-gray-900">
                  {adminStats.pendingApplicants}
                </span>
              </div>
              <Progress 
                value={(adminStats.pendingApplicants / adminStats.totalApplications) * 100} 
                className="h-3"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Rejected</span>
                <span className="text-sm font-semibold text-gray-900">
                  {adminStats.rejectedApplications}
                </span>
              </div>
              <Progress 
                value={(adminStats.rejectedApplications / adminStats.totalApplications) * 100} 
                className="h-3"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">89%</div>
                <div className="text-sm text-gray-600">Overall System Health</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Healthy</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Services</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Healthy</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">File Storage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Warning</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
