'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageLoader } from '@/components/ui/loading'
import { AiChatbot } from '@/components/ai-chatbot'
import { 
  Clock, 
  MapPin, 
  Calendar,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Timer,
  Building2,
  GraduationCap,
  TrendingUp,
  Activity,
  Sparkles,
  Download,
  BarChart3,
  Award,
  Target
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getLearnerAttendanceHistoryAction, AttendanceRecord } from '@/app/admin/attendance/actions'
import { format } from 'date-fns'

export default function LearnerAttendancePage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')

  const loadAttendanceHistory = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')
      const data = await getLearnerAttendanceHistoryAction(user.uid)
      setRecords(data)
    } catch (err) {
      console.error('Error loading attendance history:', err)
      setError('Failed to load attendance history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttendanceHistory()
  }, [user])

  const filteredRecords = records.filter(record => {
    const matchesSearch = searchTerm === '' || 
                          record.locationName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || record.locationType === typeFilter

    const matchesMonth = monthFilter === 'all' || 
                        format(record.checkInTime, 'yyyy-MM') === monthFilter

    return matchesSearch && matchesType && matchesMonth
  })

  const getTypeIcon = (type: string) => {
    return type === 'work' ? <Building2 className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />
  }

  const getTypeColor = (type: string) => {
    return type === 'work' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
  }

  const getStatusIcon = (verified: boolean) => {
    return verified ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
  }

  const getStatusColor = (verified: boolean) => {
    return verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }

  const getStatusText = (verified: boolean) => {
    return verified ? 'Verified' : 'Pending Verification'
  }

  const calculateStats = () => {
    const totalRecords = records.length
    const totalHours = records.reduce((sum, record) => sum + (record.totalHours || 0), 0)
    const verifiedRecords = records.filter(record => record.verified).length
    const workRecords = records.filter(record => record.locationType === 'work').length
    const classRecords = records.filter(record => record.locationType === 'class').length

    return {
      totalRecords,
      totalHours: Math.round(totalHours * 100) / 100,
      verifiedRecords,
      verificationRate: totalRecords > 0 ? Math.round((verifiedRecords / totalRecords) * 100) : 0,
      workRecords,
      classRecords
    }
  }

  const stats = calculateStats()

  const getAvailableMonths = () => {
    const months = new Set(records.map(record => format(record.checkInTime, 'yyyy-MM')))
    return Array.from(months).sort().reverse()
  }

  const exportAttendanceData = () => {
    const csvContent = [
      ['Date', 'Check-In', 'Check-Out', 'Location', 'Type', 'Hours', 'Status'].join(','),
      ...filteredRecords.map(record => [
        format(record.checkInTime, 'yyyy-MM-dd'),
        format(record.checkInTime, 'HH:mm'),
        record.checkOutTime ? format(record.checkOutTime, 'HH:mm') : 'N/A',
        record.locationName,
        record.locationType,
        record.totalHours || 0,
        getStatusText(record.verified)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `my-attendance-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return <PageLoader message="Loading your attendance history..." />
  }

  return (
    <AdminLayout userRole="learner">
      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F5F0E1 0%, #F5F0E1 50%, #F5F0E1 100%)' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-48 translate-x-48" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)' }}></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full translate-y-40 -translate-x-40" style={{ background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full -translate-x-32 -translate-y-32" style={{ background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.15) 0%, rgba(251, 146, 60, 0.15) 100%)' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto space-y-8 p-6">
          {/* Enhanced Header */}
          <div className="text-center space-y-6 mb-8">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg mb-4">
              <Clock className="h-5 w-5 mr-2" />
              <span className="font-semibold">My Attendance History</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Track Your Progress
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              View your complete attendance history, track your hours, and monitor your progress across all activities.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Button
                onClick={loadAttendanceHistory}
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Refresh Data</span>
              </Button>
              <Button
                onClick={exportAttendanceData}
                size="lg"
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Download className="h-5 w-5" />
                <span>Export My Data</span>
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="relative overflow-hidden bg-red-50 border-2 border-red-200 shadow-lg rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10"></div>
              <div className="relative flex items-center space-x-3 p-4">
                <div className="p-2 rounded-full bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <AlertDescription className="text-red-800 font-medium">
                  {error}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-blue-200 shadow-xl rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Records</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalRecords}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <Activity className="h-6 w-6 text-blue-600" />
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
                    <p className="text-3xl font-bold text-gray-900">{stats.totalHours}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <Timer className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Verification Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.verificationRate}%</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-orange-200 shadow-xl rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-red-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Work Sessions</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.workRecords}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.classRecords} class sessions</p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-100">
                    <Building2 className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                  <Filter className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
                  Filter Your Records
                </span>
                <Sparkles className="h-5 w-5 text-purple-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search" className="text-sm font-semibold text-gray-700">Search Locations</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="search"
                      placeholder="Search by location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Activity Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="work">Work Placements</SelectItem>
                      <SelectItem value="class">Class Sessions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Month</Label>
                  <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300">
                      <SelectValue placeholder="All months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Months</SelectItem>
                      {getAvailableMonths().map(month => (
                        <SelectItem key={month} value={month}>
                          {format(new Date(month + '-01'), 'MMMM yyyy')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
                  Your Attendance Records
                </span>
                <span className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
                  {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredRecords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
                  <p className="text-gray-500">Start checking in to see your records here.</p>
                </div>
              ) : (
                <div className="space-y-4 p-6">
                  {filteredRecords.map((record) => (
                    <div 
                      key={record.id} 
                      className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
                              {getTypeIcon(record.locationType)}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{record.locationName}</h3>
                              <p className="text-sm text-gray-600">{format(record.checkInTime, 'EEEE, MMMM dd, yyyy')}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`rounded-full ${getTypeColor(record.locationType)}`}>
                              {record.locationType === 'work' ? 'Work' : 'Class'}
                            </Badge>
                            <Badge className={`rounded-full ${getStatusColor(record.verified)}`}>
                              {getStatusIcon(record.verified)}
                              <span className="ml-1">{getStatusText(record.verified)}</span>
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Check-In</p>
                              <p className="text-sm text-gray-900">{format(record.checkInTime, 'HH:mm')}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-purple-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Check-Out</p>
                              <p className="text-sm text-gray-900">
                                {record.checkOutTime ? format(record.checkOutTime, 'HH:mm') : 'Not checked out'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Timer className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Total Hours</p>
                              <p className="text-sm text-gray-900 font-semibold">
                                {record.totalHours ? `${record.totalHours}h` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {record.notes && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{record.notes}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Location: {record.locationName}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Record ID: {record.id?.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* AI Floating Chatbot */}
        <div className="fixed bottom-6 right-6 z-50">
          <AiChatbot className="shadow-2xl" />
        </div>
      </div>
    </AdminLayout>
  )
}
