'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Shield, 
  Activity, 
  DollarSign, 
  BookOpen, 
  Palette, 
  Brain, 
  FileText,
  Settings,
  Crown,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  User,
  RefreshCw,
  Bell,
  ExternalLink,
  Target,
  Zap,
  Star,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Heart,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Database,
  Server,
  Globe,
  Lock,
  Unlock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatCard, QuickAction, RecentActivityItem } from '@/components/ui/enhanced-dashboard-layout'

interface SuperAdminStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  systemUptime: number
  totalProjects: number
  activeProjects: number
  totalPrograms: number
  securityAlerts: number
  performanceScore: number
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error'
  api: 'healthy' | 'warning' | 'error'
  storage: 'healthy' | 'warning' | 'error'
  security: 'healthy' | 'warning' | 'error'
  performance: 'healthy' | 'warning' | 'error'
}

interface SecurityAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  time: string
  severity: 'high' | 'medium' | 'low'
}

export function EnhancedSuperAdminDashboard() {
  const [superAdminStats, setSuperAdminStats] = useState<SuperAdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    systemUptime: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalPrograms: 0,
    securityAlerts: 0,
    performanceScore: 0
  })
  
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    api: 'healthy',
    storage: 'warning',
    security: 'healthy',
    performance: 'healthy'
  })
  
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock data - replace with real Firebase data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuperAdminStats({
        totalUsers: 1247,
        activeUsers: 892,
        totalRevenue: 125000,
        monthlyRevenue: 15000,
        systemUptime: 99.8,
        totalProjects: 45,
        activeProjects: 23,
        totalPrograms: 12,
        securityAlerts: 3,
        performanceScore: 94
      })
      
      setSecurityAlerts([
        {
          id: '1',
          type: 'critical',
          title: 'Suspicious Login Attempts',
          description: 'Multiple failed login attempts detected from unknown IP',
          time: '1 hour ago',
          severity: 'high'
        },
        {
          id: '2',
          type: 'warning',
          title: 'Database Performance',
          description: 'Database response time is slower than usual',
          time: '3 hours ago',
          severity: 'medium'
        },
        {
          id: '3',
          type: 'info',
          title: 'System Update Available',
          description: 'New system update is available for installation',
          time: '1 day ago',
          severity: 'low'
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

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />
      case 'error':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'text-red-600 bg-red-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'info':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 rounded-3xl blur opacity-25"></div>
        <Card className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Super Administrator Dashboard</h2>
                    <p className="text-purple-100">Complete platform oversight and management</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{superAdminStats.totalUsers}</div>
                    <div className="text-sm text-purple-100">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{superAdminStats.activeUsers}</div>
                    <div className="text-sm text-purple-100">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">${superAdminStats.monthlyRevenue.toLocaleString()}</div>
                    <div className="text-sm text-purple-100">Monthly Revenue</div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-6xl font-bold text-white/20">{superAdminStats.systemUptime}%</div>
                <div className="text-sm text-purple-100">System Uptime</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={superAdminStats.totalUsers.toLocaleString()}
          change={12}
          changeType="increase"
          icon={Users}
          color="bg-gradient-to-r from-blue-500 to-cyan-500"
          description="Platform users"
          trend={[1100, 1150, 1200, 1220, 1240, 1245, 1247]}
          loading={isLoading}
        />
        
        <StatCard
          title="Active Users"
          value={superAdminStats.activeUsers.toLocaleString()}
          change={8}
          changeType="increase"
          icon={Activity}
          color="bg-gradient-to-r from-green-500 to-emerald-500"
          description="Currently online"
          trend={[800, 820, 850, 870, 890, 895, 892]}
          loading={isLoading}
        />
        
        <StatCard
          title="Monthly Revenue"
          value={`$${superAdminStats.monthlyRevenue.toLocaleString()}`}
          change={15}
          changeType="increase"
          icon={DollarSign}
          color="bg-gradient-to-r from-yellow-500 to-orange-500"
          description="This month"
          trend={[12000, 12500, 13000, 13500, 14000, 14500, 15000]}
          loading={isLoading}
        />
        
        <StatCard
          title="System Uptime"
          value={`${superAdminStats.systemUptime}%`}
          change={0.2}
          changeType="increase"
          icon={Shield}
          color="bg-gradient-to-r from-purple-500 to-pink-500"
          description="Last 30 days"
          trend={[99.5, 99.6, 99.7, 99.8, 99.8, 99.8, 99.8]}
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
            title="Manage Users"
            description="View and manage all user accounts"
            icon={Users}
            color="bg-gradient-to-r from-blue-500 to-cyan-500"
            href="/super-admin/users"
          />
          
          <QuickAction
            title="Security Center"
            description="Monitor security and access controls"
            icon={Shield}
            color="bg-gradient-to-r from-red-500 to-pink-500"
            href="/super-admin/security"
            badge={superAdminStats.securityAlerts > 0 ? `${superAdminStats.securityAlerts} alerts` : undefined}
          />
          
          <QuickAction
            title="Performance"
            description="Monitor system performance metrics"
            icon={Activity}
            color="bg-gradient-to-r from-green-500 to-emerald-500"
            href="/super-admin/performance"
          />
          
          <QuickAction
            title="Stipend Reports"
            description="View financial reports and analytics"
            icon={DollarSign}
            color="bg-gradient-to-r from-yellow-500 to-orange-500"
            href="/super-admin/stipend-reports"
          />
          
          <QuickAction
            title="Projects & Programs"
            description="Manage projects and programs"
            icon={BookOpen}
            color="bg-gradient-to-r from-purple-500 to-pink-500"
            href="/super-admin/projects-programs"
          />
          
          <QuickAction
            title="Appearance"
            description="Customize platform appearance"
            icon={Palette}
            color="bg-gradient-to-r from-indigo-500 to-purple-500"
            href="/super-admin/appearance"
          />
          
          <QuickAction
            title="AI Reports"
            description="View AI performance and analytics"
            icon={Brain}
            color="bg-gradient-to-r from-cyan-500 to-blue-500"
            href="/super-admin/ai-reports"
          />
          
          <QuickAction
            title="Audit Logs"
            description="View system audit logs"
            icon={FileText}
            color="bg-gradient-to-r from-gray-500 to-gray-600"
            href="/super-admin/audit-logs"
          />
          
          <QuickAction
            title="System Health"
            description="Monitor overall system health"
            icon={Activity}
            color="bg-gradient-to-r from-emerald-500 to-green-500"
            href="/super-admin/system-health"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Security Alerts */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-red-600" />
                <span>Security Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {securityAlerts.map((alert) => (
                <div key={alert.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className={getAlertTypeColor(alert.type)}>
                        {alert.type}
                      </Badge>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
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

        {/* System Health */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span>System Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(systemHealth).map(([key, status]) => (
                <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      getHealthColor(status)
                    )}>
                      {getHealthIcon(status)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 capitalize">{key}</h4>
                      <p className="text-sm text-gray-600 capitalize">{status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {status === 'healthy' ? '100%' : status === 'warning' ? '75%' : '50%'}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span>Revenue Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  ${superAdminStats.totalRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly Revenue</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${superAdminStats.monthlyRevenue.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={(superAdminStats.monthlyRevenue / 20000) * 100} 
                  className="h-3"
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Growth Rate</span>
                  <span className="text-sm font-semibold text-green-600">+15%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {superAdminStats.performanceScore}%
                </div>
                <div className="text-sm text-gray-600">Overall Performance</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Projects</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {superAdminStats.activeProjects}/{superAdminStats.totalProjects}
                  </span>
                </div>
                <Progress 
                  value={(superAdminStats.activeProjects / superAdminStats.totalProjects) * 100} 
                  className="h-3"
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Programs</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {superAdminStats.totalPrograms}
                  </span>
                </div>
                <Progress 
                  value={(superAdminStats.totalPrograms / 15) * 100} 
                  className="h-3"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
