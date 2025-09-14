'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Clock, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MonthlyHoursProgressProps {
  loggedHours: number
  targetHours?: number
  className?: string
}

export function MonthlyHoursProgress({ 
  loggedHours, 
  targetHours = 160, 
  className 
}: MonthlyHoursProgressProps) {
  const percentage = targetHours > 0 ? Math.min((loggedHours / targetHours) * 100, 100) : 0
  
  const getStipendStatus = () => {
    if (percentage >= 85) {
      return {
        status: 'Full Stipend',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: CheckCircle,
        description: 'You are eligible for full stipend payment'
      }
    } else if (percentage >= 50) {
      return {
        status: 'Prorata Stipend',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: AlertTriangle,
        description: 'You are eligible for prorata stipend payment'
      }
    } else {
      return {
        status: 'No Stipend',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: AlertTriangle,
        description: 'You need to work more hours to qualify for stipend'
      }
    }
  }

  const stipendInfo = getStipendStatus()
  const IconComponent = stipendInfo.icon

  return (
    <Card className={cn("shadow-lg", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm font-semibold">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span>Monthly Stipend Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hours Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Hours Logged This Month</span>
            <span className="font-semibold text-sm">
              {loggedHours.toFixed(1)} / {targetHours}
            </span>
          </div>
          <Progress value={percentage} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0 hours</span>
            <span>{targetHours} hours required</span>
          </div>
        </div>

        {/* Stipend Status */}
        <div className={cn(
          "p-4 rounded-lg border-2",
          stipendInfo.bgColor,
          stipendInfo.borderColor
        )}>
          <div className="flex items-center space-x-2 mb-2">
            <IconComponent className={cn("h-5 w-5", stipendInfo.color)} />
            <Badge 
              variant="outline" 
              className={cn(
                "font-semibold",
                stipendInfo.color,
                stipendInfo.bgColor,
                stipendInfo.borderColor
              )}
            >
              {stipendInfo.status}
            </Badge>
          </div>
          <p className={cn("text-sm", stipendInfo.color)}>
            {stipendInfo.description}
          </p>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
          <span>{percentage.toFixed(1)}% complete</span>
        </div>
      </CardContent>
    </Card>
  )
}





