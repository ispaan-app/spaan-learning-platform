'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  MapPin, 
  Calendar,
  Award,
  Target,
  Sparkles
} from 'lucide-react'

interface AttendanceAnalyticsProps {
  analytics: {
    dailyAttendance: { date: string; count: number; hours: number }[]
    locationStats: { location: string; count: number; hours: number }[]
    learnerStats: { learnerId: string; learnerName: string; totalHours: number; attendanceRate: number }[]
    overallStats: {
      totalRecords: number
      totalHours: number
      averageHoursPerDay: number
      attendanceRate: number
      onTimeRate: number
      lateArrivals: number
      earlyDepartures: number
      perfectAttendance: number
    }
  }
}

export function AttendanceAnalytics({ analytics }: AttendanceAnalyticsProps) {
  const { dailyAttendance, locationStats, learnerStats, overallStats } = analytics

  return (
    <div className="space-y-8">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-blue-200 shadow-xl rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-3xl font-bold text-gray-900">{overallStats.totalRecords}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-green-200 shadow-xl rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-3xl font-bold text-gray-900">{overallStats.totalHours}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-3xl font-bold text-gray-900">{overallStats.attendanceRate}%</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-orange-200 shadow-xl rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-red-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Perfect Attendance</p>
                <p className="text-3xl font-bold text-gray-900">{overallStats.perfectAttendance}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Attendance Chart */}
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-xl rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
              Daily Attendance Trends
            </span>
            <Sparkles className="h-5 w-5 text-purple-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {dailyAttendance.length > 0 ? (
              <div className="space-y-3">
                {dailyAttendance.slice(-7).map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {new Date(day.date).getDate()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-gray-600">{day.count} check-ins</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{day.hours}h</p>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((day.hours / 8) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No attendance data available for the selected period</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Statistics */}
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-xl rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-800 to-green-800 bg-clip-text text-transparent">
              Location Statistics
            </span>
            <Sparkles className="h-5 w-5 text-emerald-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {locationStats.length > 0 ? (
              locationStats.map((location, index) => (
                <div key={location.location} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{location.location}</p>
                      <p className="text-sm text-gray-600">{location.count} check-ins</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{location.hours}h</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {Math.round((location.hours / locationStats.reduce((sum, loc) => sum + loc.hours, 0)) * 100)}% of total
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No location data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-xl rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-800 to-purple-800 bg-clip-text text-transparent">
              Top Performers
            </span>
            <Sparkles className="h-5 w-5 text-pink-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {learnerStats.length > 0 ? (
              learnerStats.slice(0, 10).map((learner, index) => (
                <div key={learner.learnerId} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{learner.learnerName}</p>
                      <p className="text-sm text-gray-600">ID: {learner.learnerId.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">{learner.totalHours}h</p>
                    <Badge 
                      variant={learner.attendanceRate >= 90 ? 'default' : 'secondary'}
                      className={learner.attendanceRate >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    >
                      {learner.attendanceRate}% attendance
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No learner data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
