'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Users, UserCheck, Clock, UserX } from 'lucide-react'

interface UserStatsProps {
  stats: {
    total: number
    active: number
    pending: number
    inactive: number
  }
}

export function UserStats({ stats }: UserStatsProps) {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.total,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: stats.active,
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Inactive',
      value: stats.inactive,
      icon: UserX,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="shadow-lg hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600">{stat.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


