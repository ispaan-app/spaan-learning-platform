'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Activity, 
  Zap, 
  Star, 
  Award, 
  Target,
  Brain,
  Shield,
  Crown,
  Calendar,
  Clock,
  MessageCircle,
  Bell,
  Settings,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EnhancedDashboardLayoutProps {
  userRole: 'learner' | 'admin' | 'super-admin' | 'applicant'
  userName: string
  userEmail: string
  children: React.ReactNode
  className?: string
}

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon: React.ElementType
  color: string
  description?: string
  trend?: number[]
  loading?: boolean
}

interface QuickActionProps {
  title: string
  description: string
  icon: React.ElementType
  color: string
  href: string
  badge?: string
  onClick?: () => void
}

interface RecentActivityProps {
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  description: string
  time: string
  icon: React.ElementType
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  color, 
  description,
  trend,
  loading = false 
}: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />
      case 'decrease':
        return <ArrowDownRight className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:scale-105",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Floating Elements */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-sm animate-pulse" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-sm animate-pulse delay-500" />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110",
              color
            )}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              {description && (
                <p className="text-xs text-gray-500">{description}</p>
              )}
            </div>
          </div>
          {change !== undefined && (
            <div className={cn("flex items-center space-x-1 text-sm font-semibold", getChangeColor())}>
              {getChangeIcon()}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-baseline space-x-2">
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              <span className="text-3xl font-bold text-gray-900">{value}</span>
            )}
            {trend && (
              <div className="flex space-x-1">
                {trend.map((point, index) => (
                  <div
                    key={index}
                    className="w-1 h-6 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full opacity-60"
                    style={{ height: `${(point / Math.max(...trend)) * 24}px` }}
                  />
                ))}
              </div>
            )}
          </div>
          
          {trend && (
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function QuickAction({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  href, 
  badge,
  onClick 
}: QuickActionProps) {
  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110",
            color
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {title}
              </h3>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
              <span>Get started</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function RecentActivityItem({ 
  type, 
  title, 
  description, 
  time, 
  icon: Icon 
}: RecentActivityProps) {
  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'info':
        return 'text-blue-600 bg-blue-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        getTypeColor()
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  )
}

export function EnhancedDashboardLayout({ 
  userRole, 
  userName, 
  userEmail, 
  children, 
  className 
}: EnhancedDashboardLayoutProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  const getRoleInfo = () => {
    switch (userRole) {
      case 'super-admin':
        return {
          title: 'Super Administrator',
          icon: Crown,
          color: 'from-purple-600 via-pink-600 to-red-500',
          bgColor: 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-500'
        }
      case 'admin':
        return {
          title: 'Administrator',
          icon: Shield,
          color: 'from-blue-600 via-cyan-600 to-teal-500',
          bgColor: 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500'
        }
      case 'learner':
        return {
          title: 'Learner',
          icon: Brain,
          color: 'from-green-600 via-emerald-600 to-teal-500',
          bgColor: 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500'
        }
      case 'applicant':
        return {
          title: 'Applicant',
          icon: Users,
          color: 'from-indigo-600 via-purple-600 to-pink-500',
          bgColor: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500'
        }
      default:
        return {
          title: 'User',
          icon: Users,
          color: 'from-gray-600 via-blue-600 to-purple-500',
          bgColor: 'bg-gradient-to-r from-gray-600 via-blue-600 to-purple-500'
        }
    }
  }

  const roleInfo = getRoleInfo()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100", className)}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                  roleInfo.bgColor
                )}>
                  <roleInfo.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {userName}!
                  </h1>
                  <p className="text-gray-600">
                    {roleInfo.title} • {userEmail}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="group"
                >
                  <RefreshCw className={cn(
                    "w-4 h-4 mr-2 transition-transform",
                    isRefreshing && "animate-spin"
                  )} />
                  Refresh
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="group"
                >
                  <Settings className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  )
}
