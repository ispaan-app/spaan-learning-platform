'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users, 
  GraduationCap, 
  Building2, 
  UserCheck,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface DashboardStats {
  pendingApplicants: number
  totalLearners: number
  activePlacements: number
  assignedLearners: number
}

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Pending Applicants',
      value: stats.pendingApplicants,
      description: 'Awaiting review',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Total Learners',
      value: stats.totalLearners,
      description: 'Active learners',
      icon: GraduationCap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Active Placements',
      value: stats.activePlacements,
      description: 'Available positions',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      title: 'Assigned Learners',
      value: stats.assignedLearners,
      description: 'In work placements',
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon
        
        return (
          <Card 
            key={index} 
            className={`${card.borderColor} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1 group-hover:text-gray-700 transition-colors">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-gray-800 transition-colors">
                    {card.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                    {card.description}
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                  <IconComponent className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              
              {/* Optional trend indicator */}
              {card.value > 0 && (
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">
                    {card.value > 10 ? 'High' : card.value > 5 ? 'Medium' : 'Low'} activity
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

