'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageLoader } from '@/components/ui/loading'
import { AiChatbot } from '@/components/ai-chatbot'
import { 
  Clock, 
  MapPin, 
  Users, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Timer,
  Building2,
  GraduationCap,
  Shield,
  Sparkles
} from 'lucide-react'
import { 
  getAttendanceRecordsAction,
  getAttendanceAnalyticsAction,
  updateAttendanceRecordAction,
  deleteAttendanceRecordAction,
  AttendanceRecord,
  AttendanceStats,
  AttendanceFilter
} from './actions'
import { AttendanceDetailModal } from '@/components/admin/AttendanceDetailModal'
import { AttendanceAnalytics } from '@/components/admin/AttendanceAnalytics'
import { format } from 'date-fns'

export default function AttendanceManagementPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  
  const [filters, setFilters] = useState<AttendanceFilter>({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    dateTo: new Date()
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [verificationFilter, setVerificationFilter] = useState<string>('all')
  const [analytics, setAnalytics] = useState<any>(null)

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true)
      setError('')
      
      const filterParams: AttendanceFilter = {
        ...filters,
        searchTerm: searchTerm || undefined,
        locationType: locationFilter !== 'all' ? locationFilter as 'work' | 'class' : undefined,
        verified: verificationFilter !== 'all' ? verificationFilter === 'verified' : undefined
      }

      const result = await getAttendanceRecordsAction(currentPage, 20, filterParams)
      setRecords(result.records)
      setTotalRecords(result.total)
      setStats(result.stats)
    } catch (err) {
      console.error('Error loading attendance records:', err)
      setError('Failed to load attendance records')
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      const result = await getAttendanceAnalyticsAction(
        filters.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        filters.dateTo || new Date()
      )
      setAnalytics(result)
    } catch (err) {
      console.error('Error loading analytics:', err)
    }
  }

  useEffect(() => {
    loadAttendanceRecords()
  }, [currentPage, filters, searchTerm, locationFilter, verificationFilter])

  useEffect(() => {
    if (showAnalytics) {
      loadAnalytics()
    }
  }, [showAnalytics, filters])

  const handleUpdateRecord = async (recordId: string, updates: Partial<AttendanceRecord>) => {
    try {
      const result = await updateAttendanceRecordAction(recordId, updates)
      if (result.success) {
        await loadAttendanceRecords()
        setSelectedRecord(null)
      } else {
        setError(result.error || 'Failed to update record')
      }
    } catch (err) {
      console.error('Error updating record:', err)
      setError('Failed to update record')
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return
    
    try {
      const result = await deleteAttendanceRecordAction(recordId)
      if (result.success) {
        await loadAttendanceRecords()
      } else {
        setError(result.error || 'Failed to delete record')
      }
    } catch (err) {
      console.error('Error deleting record:', err)
      setError('Failed to delete record')
    }
  }

  const exportAttendanceData = () => {
    const csvContent = [
      ['Learner Name', 'Check-In Time', 'Check-Out Time', 'Location', 'Type', 'Hours', 'Verified'].join(','),
      ...records.map(record => [
        record.learnerName,
        format(record.checkInTime, 'yyyy-MM-dd HH:mm'),
        record.checkOutTime ? format(record.checkOutTime, 'yyyy-MM-dd HH:mm') : 'N/A',
        record.locationName,
        record.locationType,
        record.totalHours || 0,
        record.verified ? 'Yes' : 'No'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-records-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading && records.length === 0) {
    return <PageLoader message="Loading attendance records..." />
  }

  return (
    <AdminLayout userRole="admin">
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
              <span className="font-semibold">Attendance Management</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Learner Attendance
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Monitor and manage learner attendance records, track hours, and analyze patterns.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Button
                onClick={loadAttendanceRecords}
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Refresh Data</span>
              </Button>
              <Button
                onClick={() => setShowAnalytics(!showAnalytics)}
                size="lg"
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <BarChart3 className="h-5 w-5" />
                <span>{showAnalytics ? 'Hide Analytics' : 'Show Analytics'}</span>
                <Sparkles className="h-4 w-4" />
              </Button>
              <Button
                onClick={exportAttendanceData}
                size="lg"
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Download className="h-5 w-5" />
                <span>Export Data</span>
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

          {/* Analytics Section */}
          {showAnalytics && analytics && (
            <AttendanceAnalytics analytics={analytics} />
          )}

          {/* Stats Cards */}
          {stats && (
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
                      <Clock className="h-6 w-6 text-blue-600" />
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
                      <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.attendanceRate}%</p>
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
                      <p className="text-3xl font-bold text-gray-900">{stats.perfectAttendance}</p>
                    </div>
                    <div className="p-3 rounded-full bg-orange-100">
                      <CheckCircle className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                  <Filter className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
                  Filters & Search
                </span>
                <Sparkles className="h-5 w-5 text-purple-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search" className="text-sm font-semibold text-gray-700">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="search"
                      placeholder="Search learners..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Location Type</Label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300">
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="work">Work Placements</SelectItem>
                      <SelectItem value="class">Class Sessions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Verification</Label>
                  <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                    <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300">
                      <SelectValue placeholder="All records" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Records</SelectItem>
                      <SelectItem value="verified">Verified Only</SelectItem>
                      <SelectItem value="unverified">Unverified Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Date Range</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="date"
                      value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value ? new Date(e.target.value) : undefined }))}
                      className="rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                    />
                    <Input
                      type="date"
                      value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value ? new Date(e.target.value) : undefined }))}
                      className="rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records Table */}
          <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
                      Attendance Records
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {totalRecords} record{totalRecords !== 1 ? 's' : ''} found
                    </p>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : records.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learner</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-Out</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {records.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">
                                    {record.learnerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{record.learnerName}</div>
                                <div className="text-sm text-gray-500">ID: {record.userId.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(record.checkInTime, 'MMM dd, yyyy HH:mm')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.checkOutTime ? format(record.checkOutTime, 'MMM dd, yyyy HH:mm') : 'Not checked out'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                              {record.locationName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={record.locationType === 'work' ? 'default' : 'secondary'}
                              className={`rounded-full ${
                                record.locationType === 'work' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {record.locationType === 'work' ? (
                                <><Building2 className="h-3 w-3 mr-1" /> Work</>
                              ) : (
                                <><GraduationCap className="h-3 w-3 mr-1" /> Class</>
                              )}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.totalHours ? `${record.totalHours}h` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={record.verified ? 'default' : 'destructive'}
                              className={`rounded-full ${
                                record.verified 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {record.verified ? (
                                <><CheckCircle className="h-3 w-3 mr-1" /> Verified</>
                              ) : (
                                <><AlertTriangle className="h-3 w-3 mr-1" /> Unverified</>
                              )}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRecord(record)}
                                className="rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRecord(record)}
                                className="rounded-lg border-green-200 text-green-600 hover:bg-green-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteRecord(record.id)}
                                className="rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
                  <p className="text-gray-500">Try adjusting your filters or check back later.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* AI Floating Chatbot */}
        <div className="fixed bottom-6 right-6 z-50">
          <AiChatbot className="shadow-2xl" />
        </div>

        {/* Attendance Detail Modal */}
        <AttendanceDetailModal
          record={selectedRecord}
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onSave={handleUpdateRecord}
        />
      </div>
    </AdminLayout>
  )
}