'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Shield, 
  Building2, 
  FileText,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GlobalStatsData {
  totalUsers: number
  totalAdmins: number
  activePlacements: number
  pendingApplications: number
}

interface GlobalStatsProps {
  stats: GlobalStatsData
  onRefresh?: () => void
  loading?: boolean
}

export function GlobalStats({ stats, onRefresh, loading }: GlobalStatsProps) {
  const router = useRouter()
  
  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: 'All platform users',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      trend: stats.totalUsers > 1000 ? 'High' : stats.totalUsers > 500 ? 'Medium' : 'Low',
      action: () => router.push('/super-admin/users'),
      actionText: 'Manage Users'
    },
    {
      title: 'Administrators',
      value: stats.totalAdmins,
      description: 'Admin & Super Admin users',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
      trend: stats.totalAdmins > 10 ? 'High' : stats.totalAdmins > 5 ? 'Medium' : 'Low',
      action: () => router.push('/super-admin/users?role=admin'),
      actionText: 'View Admins'
    },
    {
      title: 'Active Placements',
      value: stats.activePlacements,
      description: 'Current work placements',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      trend: stats.activePlacements > 50 ? 'High' : stats.activePlacements > 20 ? 'Medium' : 'Low',
      action: () => router.push('/admin/placements'),
      actionText: 'View Placements'
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      description: 'Awaiting review',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200',
      trend: stats.pendingApplications > 50 ? 'High' : stats.pendingApplications > 20 ? 'Medium' : 'Low',
      action: () => router.push('/admin/applicants'),
      actionText: 'Review Applications'
    }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'High':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'Medium':
        return <Activity className="w-4 h-4 text-yellow-500" />
      case 'Low':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'High':
        return 'text-green-600'
      case 'Medium':
        return 'text-yellow-600'
      case 'Low':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
        {onRefresh && (
          <Button
            onClick={onRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon
          
          return (
            <Card key={index} className={`${card.borderColor} hover:shadow-md transition-all duration-200 cursor-pointer group hover:-translate-y-0.5`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {card.value.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      {card.description}
                    </p>
                    
                    {/* Trend Indicator */}
                    <div className="flex items-center text-sm mb-4">
                      {getTrendIcon(card.trend)}
                      <span className={`ml-1 font-medium ${getTrendColor(card.trend)}`}>
                        {card.trend} activity
                      </span>
                    </div>
                  </div>
                  <div className={`w-16 h-16 ${card.bgColor} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                    <IconComponent className={`w-8 h-8 ${card.color}`} />
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={card.action}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-gray-600 hover:text-gray-900 group-hover:bg-gray-50"
                >
                  <span>{card.actionText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

