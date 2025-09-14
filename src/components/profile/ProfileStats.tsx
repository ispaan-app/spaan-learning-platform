'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Award, 
  Clock,
  CheckCircle,
  Target,
  BookOpen
} from 'lucide-react'

interface ProfileStatsProps {
  userRole: 'super-admin' | 'admin' | 'applicant' | 'learner'
  stats: {
    totalActions?: number
    completedTasks?: number
    pendingItems?: number
    successRate?: number
    experience?: string
    nextMilestone?: string
  }
}

const roleStatsConfig = {
  'super-admin': {
    primaryColor: 'bg-red-500',
    secondaryColor: 'bg-red-100',
    textColor: 'text-red-800',
    stats: [
      { key: 'totalActions', label: 'Platform Actions', icon: TrendingUp },
      { key: 'completedTasks', label: 'Completed Tasks', icon: CheckCircle },
      { key: 'pendingItems', label: 'Pending Items', icon: Clock },
      { key: 'successRate', label: 'Success Rate', icon: Target }
    ]
  },
  'admin': {
    primaryColor: 'bg-blue-500',
    secondaryColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    stats: [
      { key: 'totalActions', label: 'Applications Reviewed', icon: FileText },
      { key: 'completedTasks', label: 'Tasks Completed', icon: CheckCircle },
      { key: 'pendingItems', label: 'Pending Reviews', icon: Clock },
      { key: 'successRate', label: 'Approval Rate', icon: Target }
    ]
  },
  'applicant': {
    primaryColor: 'bg-green-500',
    secondaryColor: 'bg-green-100',
    textColor: 'text-green-800',
    stats: [
      { key: 'totalActions', label: 'Applications', icon: FileText },
      { key: 'completedTasks', label: 'Completed Steps', icon: CheckCircle },
      { key: 'pendingItems', label: 'Pending Items', icon: Clock },
      { key: 'successRate', label: 'Progress', icon: Target }
    ]
  },
  'learner': {
    primaryColor: 'bg-purple-500',
    secondaryColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    stats: [
      { key: 'totalActions', label: 'Courses Taken', icon: BookOpen },
      { key: 'completedTasks', label: 'Assignments', icon: CheckCircle },
      { key: 'pendingItems', label: 'In Progress', icon: Clock },
      { key: 'successRate', label: 'Completion Rate', icon: Target }
    ]
  }
}

export function ProfileStats({ userRole, stats }: ProfileStatsProps) {
  const config = roleStatsConfig[userRole]

  const formatValue = (key: string, value: any) => {
    if (key === 'successRate') {
      return `${value || 0}%`
    }
    return value?.toString() || '0'
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {config.stats.map((stat) => {
          const Icon = stat.icon
          const value = stats[stat.key as keyof typeof stats]
          
          return (
            <Card key={stat.key} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className={`absolute top-0 right-0 w-20 h-20 ${config.secondaryColor} rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300`}></div>
              
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 ${config.primaryColor} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <Badge variant="outline" className={`${config.textColor} border-current`}>
                    {formatValue(stat.key, value)}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatValue(stat.key, value)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Experience & Milestones */}
      {(stats.experience || stats.nextMilestone) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stats.experience && (
            <Card className="border-l-4 border-[#6D9773]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Award className="w-5 h-5 text-[#B46617]" />
                  <span>Experience</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{stats.experience}</p>
              </CardContent>
            </Card>
          )}

          {stats.nextMilestone && (
            <Card className="border-l-4 border-[#FFBA00]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Target className="w-5 h-5 text-[#FFBA00]" />
                  <span>Next Milestone</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{stats.nextMilestone}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}




