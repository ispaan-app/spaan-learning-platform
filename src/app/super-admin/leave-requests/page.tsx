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
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  User,
  CalendarDays,
  FileText,
  Shield,
  TrendingUp,
  Activity,
  Sparkles,
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  DollarSign,
  Award
} from 'lucide-react'
import { 
  getLeaveRequestsAction,
  updateLeaveRequestAction,
  LeaveRequest
} from '@/app/admin/leave-requests/actions'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function SuperAdminLeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  // const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)

  const loadLeaveRequests = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getLeaveRequestsAction()
      setLeaveRequests(data)
    } catch (err) {
      console.error('Error loading leave requests:', err)
      setError('Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaveRequests()
  }, [])

  const handleUpdateStatus = async (requestId: string, status: string, adminNotes?: string, rejectionReason?: string) => {
    try {
      await updateLeaveRequestAction(requestId, status, adminNotes, rejectionReason)
      toast.success(`Leave request ${status} successfully`)
      await loadLeaveRequests()
    } catch (err) {
      console.error('Error updating leave request:', err)
      toast.error('Failed to update leave request')
    }
  }

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = searchTerm === '' || 
                          request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.reason.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesType = typeFilter === 'all' || request.type === typeFilter
    // const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // const getPriorityColor = (priority: string) => {
  //   switch (priority) {
  //     case 'urgent': return 'bg-red-100 text-red-800'
  //     case 'high': return 'bg-orange-100 text-orange-800'
  //     case 'medium': return 'bg-yellow-100 text-yellow-800'
  //     case 'low': return 'bg-green-100 text-green-800'
  //     default: return 'bg-gray-100 text-gray-800'
  //   }
  // }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sick': return '🏥'
      case 'personal': return '👤'
      case 'emergency': return '🚨'
      case 'vacation': return '🏖️'
      default: return '📅'
    }
  }

  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    rejected: leaveRequests.filter(r => r.status === 'rejected').length,
    // urgent: leaveRequests.filter(r => r.priority === 'urgent').length
  }

  if (loading) {
    return <PageLoader message="Loading platform leave requests..." />
  }

  return (
    <AdminLayout userRole="super-admin">
      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F5F0E1 0%, #F5F0E1 50%, #F5F0E1 100%)' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-48 translate-x-48" style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(79, 70, 229, 0.15) 100%)' }}></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full translate-y-40 -translate-x-40" style={{ background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full -translate-x-32 -translate-y-32" style={{ background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.15) 0%, rgba(251, 146, 60, 0.15) 100%)' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto space-y-8 p-6">
          {/* Enhanced Header */}
          <div className="text-center space-y-6 mb-8">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg mb-4">
              <Shield className="h-5 w-5 mr-2" />
              <span className="font-semibold">Super Admin - Leave Management</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Platform-Wide Leave Oversight
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Comprehensive leave request management across all learners, programs, and placements with advanced approval workflows.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Button
                onClick={loadLeaveRequests}
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Refresh Data</span>
              </Button>
              <Button
                size="lg"
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <TrendingUp className="h-5 w-5" />
                <span>Analytics Dashboard</span>
                <Sparkles className="h-4 w-4" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-yellow-200 shadow-xl rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-100">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-green-200 shadow-xl rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-red-200 shadow-xl rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400 to-pink-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
                  </div>
                  <div className="p-3 rounded-full bg-red-100">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-orange-200 shadow-xl rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-red-400 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-100">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg">
                  <Filter className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-gray-800 to-purple-800 bg-clip-text text-transparent">
                  Platform-Wide Filters & Search
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
                      placeholder="Search across platform..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="personal">Personal Leave</SelectItem>
                      <SelectItem value="emergency">Emergency Leave</SelectItem>
                      <SelectItem value="vacation">Vacation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Leave Requests List */}
          <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-gray-800 to-purple-800 bg-clip-text text-transparent">
                  Platform Leave Requests
                </span>
                <span className="text-sm text-gray-600 bg-purple-100 px-3 py-1 rounded-full">
                  {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
                  <p className="text-gray-500">Adjust your filters or check back later.</p>
                </div>
              ) : (
                <div className="space-y-4 p-6">
                  {filteredRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="text-3xl">{getTypeIcon(request.type)}</div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{request.userName}</h3>
                              <p className="text-sm text-gray-600">{request.userEmail}</p>
                              <p className="text-sm text-gray-500">User ID: {request.userId}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`rounded-full ${getStatusColor(request.status)}`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Start Date</p>
                              <p className="text-sm text-gray-900">{format(new Date(request.startDate), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-indigo-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">End Date</p>
                              <p className="text-sm text-gray-900">{format(new Date(request.endDate), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Duration</p>
                              <p className="text-sm text-gray-900">{request.days} day{request.days !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Submitted</p>
                              <p className="text-sm text-gray-900">{format(new Date(request.submittedAt), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Reason</p>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
                        </div>

                        {request.adminNotes && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Admin Notes</p>
                            <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded-lg">{request.adminNotes}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                              className="rounded-lg border-purple-200 text-purple-600 hover:bg-purple-50"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateStatus(request.id!, 'approved')}
                                  className="rounded-lg bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleUpdateStatus(request.id!, 'rejected')}
                                  className="rounded-lg"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {request.id?.slice(0, 8)}...
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
