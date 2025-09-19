'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  CalendarDays,
  FileText,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Users,
  Activity,
  Zap,
  Building,
  Phone
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { getLeaveRequestsAction, updateLeaveRequestAction, LeaveRequest } from './actions'
import { toast } from '@/lib/toast'

export default function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const loadLeaveRequests = async () => {
    try {
      setIsLoading(true)
      const data = await getLeaveRequestsAction()
      setLeaveRequests(data)
    } catch (error) {
      console.error('Error loading leave requests:', error)
      toast.error('Failed to load leave requests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLeaveRequests()
  }, [])

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesType = typeFilter === 'all' || request.type === typeFilter
    
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sick': return '🏥'
      case 'personal': return '👤'
      case 'emergency': return '🚨'
      default: return '📝'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sick': return 'Sick Leave'
      case 'personal': return 'Personal Leave'
      case 'emergency': return 'Emergency Leave'
      default: return 'Other'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-600" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const handleStatusUpdate = async (requestId: string, status: string, notes?: string) => {
    try {
      setIsUpdating(requestId)
      const result = await updateLeaveRequestAction(requestId, status, notes)
      
      if (result.success) {
        setLeaveRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: status as any, 
                reviewedAt: new Date(),
                adminNotes: notes || req.adminNotes,
                rejectionReason: status === 'rejected' ? rejectionReason : undefined
              }
            : req
        ))
        toast.success(`Leave request ${status} successfully`)
        setSelectedRequest(null)
        setAdminNotes('')
        setRejectionReason('')
      } else {
        toast.error(result.error || 'Failed to update leave request')
      }
    } catch (error) {
      console.error('Error updating leave request:', error)
      toast.error('Failed to update leave request')
    } finally {
      setIsUpdating(null)
    }
  }

  const openRequestDetails = (request: LeaveRequest) => {
    setSelectedRequest(request)
    setAdminNotes(request.adminNotes || '')
    setRejectionReason(request.rejectionReason || '')
  }

  const closeRequestDetails = () => {
    setSelectedRequest(null)
    setAdminNotes('')
    setRejectionReason('')
  }

  if (isLoading) {
    return (
      <AdminLayout userRole="admin">
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-[#FF6E40] absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold" style={{ color: '#1E3D59' }}>Loading Leave Requests</h3>
            <p className="text-sm text-gray-600">Please wait while we fetch the latest data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59] to-[#2D5A87] opacity-5 rounded-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: '#1E3D59' }}>
                      Leave Requests
                    </h1>
                    <p className="text-gray-600 text-lg">Manage and review leave applications</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={loadLeaveRequests}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: '#FF6E40' }}
              >
                <RefreshCw className="h-5 w-5" />
                <span className="font-semibold">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold" style={{ color: '#FFC13B' }}>
                    {leaveRequests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#FFC13B' }}>
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Awaiting review</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-3xl font-bold text-green-600">
                    {leaveRequests.filter(r => r.status === 'approved').length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-green-600">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Activity className="h-4 w-4 mr-1" />
                <span>Successfully processed</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">
                    {leaveRequests.filter(r => r.status === 'rejected').length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-red-600">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>Requires attention</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-3xl font-bold" style={{ color: '#1E3D59' }}>
                    {leaveRequests.length}
                  </p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#1E3D59' }}>
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                <span>All time requests</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/5 to-[#FF6E40]/5 opacity-50"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#1E3D59' }}>
                <Filter className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold" style={{ color: '#1E3D59' }}>Filter & Search</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Search Requests</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#FF6E40] transition-colors" />
                  <input
                    type="text"
                    placeholder="Search by name, reason, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Filter by Status</label>
                <Select value={statusFilter} onValueChange={(value: 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled') => setStatusFilter(value)}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300 bg-white/80 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                    <SelectItem value="all" className="rounded-lg">All Status</SelectItem>
                    <SelectItem value="pending" className="rounded-lg">Pending</SelectItem>
                    <SelectItem value="approved" className="rounded-lg">Approved</SelectItem>
                    <SelectItem value="rejected" className="rounded-lg">Rejected</SelectItem>
                    <SelectItem value="cancelled" className="rounded-lg">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Filter by Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300 bg-white/80 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                    <SelectItem value="all" className="rounded-lg">All Types</SelectItem>
                    <SelectItem value="sick" className="rounded-lg">Sick Leave</SelectItem>
                    <SelectItem value="personal" className="rounded-lg">Personal Leave</SelectItem>
                    <SelectItem value="emergency" className="rounded-lg">Emergency Leave</SelectItem>
                    <SelectItem value="other" className="rounded-lg">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Requests List */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/3 to-[#FF6E40]/3 opacity-30"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#1E3D59' }}>
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold" style={{ color: '#1E3D59' }}>
                  Leave Requests
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {filteredRequests.length > 0 ? (
              <div className="space-y-6">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl p-6 hover:shadow-xl hover:border-[#FF6E40]/30 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/5 to-[#FF6E40]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF6E40] to-[#FF8C69] shadow-lg">
                            <span className="text-2xl">{getTypeIcon(request.type)}</span>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold" style={{ color: '#1E3D59' }}>
                              {request.userName}
                            </h3>
                            <p className="text-sm font-medium text-gray-600">{getTypeLabel(request.type)}</p>
                            <p className="text-sm text-gray-500">
                              {request.startDate} - {request.endDate} ({request.days} day{request.days !== 1 ? 's' : ''})
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            className={`px-4 py-2 rounded-xl font-semibold text-sm ${getStatusColor(request.status)}`}
                          >
                            {getStatusIcon(request.status)}
                            <span className="ml-2 capitalize">{request.status}</span>
                          </Badge>
                          <Button
                            onClick={() => openRequestDetails(request)}
                            className="flex items-center space-x-2 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            style={{ backgroundColor: '#FF6E40' }}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="font-semibold">Review</span>
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-3">
                          <div className="p-3 rounded-xl bg-gray-50/80 backdrop-blur-sm">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Reason</p>
                            <p className="text-sm text-gray-600">{request.reason}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-gray-50/80 backdrop-blur-sm">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Email</p>
                            <p className="text-sm text-gray-600">{request.userEmail}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {request.placementInfo && (
                            <div className="p-3 rounded-xl bg-blue-50/80 backdrop-blur-sm">
                              <p className="text-sm font-semibold text-gray-700 mb-1">Placement</p>
                              <p className="text-sm text-gray-600">{request.placementInfo.companyName}</p>
                            </div>
                          )}
                          {request.emergencyContact && (
                            <div className="p-3 rounded-xl bg-green-50/80 backdrop-blur-sm">
                              <p className="text-sm font-semibold text-gray-700 mb-1">Emergency Contact</p>
                              <p className="text-sm text-gray-600">
                                {request.emergencyContact} ({request.emergencyPhone})
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Submitted: {request.submittedAt.toLocaleDateString()}</span>
                        </div>
                        {request.reviewedAt && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Reviewed: {request.reviewedAt.toLocaleDateString()}</span>
                          </div>
                        )}
                        {request.reviewedBy && (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>By: {request.reviewedBy}</span>
                          </div>
                        )}
                      </div>

                      {request.adminNotes && (
                        <div className="p-4 rounded-xl bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Admin Notes</p>
                          <p className="text-sm text-gray-600">{request.adminNotes}</p>
                        </div>
                      )}

                      {request.rejectionReason && (
                        <div className="p-4 rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-200/50">
                          <p className="text-sm font-semibold text-red-700 mb-2">Rejection Reason</p>
                          <p className="text-sm text-red-600">{request.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-6 rounded-full bg-gray-100/80 backdrop-blur-sm w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No leave requests found</h3>
                <p className="text-gray-500">No requests match your current filters</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leave Request Details Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative bg-white/95 backdrop-blur-md rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50">
              <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: '#1E3D59' }}>
                      Review Leave Request
                    </h2>
                  </div>
                  <Button 
                    onClick={closeRequestDetails} 
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    variant="outline"
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="p-6">

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#1E3D59]/5 to-[#FF6E40]/5 border border-gray-200/50">
                      <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Requestor</span>
                      </h4>
                      <p className="text-xl font-semibold" style={{ color: '#1E3D59' }}>{selectedRequest.userName}</p>
                      <p className="text-sm text-gray-600">{selectedRequest.userEmail}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#FF6E40]/5 to-[#FFC13B]/5 border border-gray-200/50">
                      <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Leave Type</span>
                      </h4>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-white/80">
                          <span className="text-xl">{getTypeIcon(selectedRequest.type)}</span>
                        </div>
                        <span className="text-lg font-semibold">{getTypeLabel(selectedRequest.type)}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#FFC13B]/5 to-[#FF6E40]/5 border border-gray-200/50">
                      <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Duration</span>
                      </h4>
                      <p className="text-lg font-semibold" style={{ color: '#1E3D59' }}>
                        {selectedRequest.startDate} - {selectedRequest.endDate}
                      </p>
                      <p className="text-sm text-gray-600">{selectedRequest.days} day{selectedRequest.days !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#1E3D59]/5 to-[#2D5A87]/5 border border-gray-200/50">
                      <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center space-x-2">
                        <Activity className="h-4 w-4" />
                        <span>Status</span>
                      </h4>
                      <Badge className={`px-4 py-2 rounded-xl font-semibold text-sm ${getStatusColor(selectedRequest.status)}`}>
                        {getStatusIcon(selectedRequest.status)}
                        <span className="ml-2 capitalize">{selectedRequest.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50/80 backdrop-blur-sm border border-gray-200/50">
                    <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Reason</span>
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedRequest.reason}</p>
                  </div>

                  {selectedRequest.placementInfo && (
                    <div className="p-4 rounded-xl bg-blue-50/80 backdrop-blur-sm border border-blue-200/50">
                      <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>Placement</span>
                      </h4>
                      <p className="text-gray-700 font-semibold">
                        {selectedRequest.placementInfo.companyName} - {selectedRequest.placementInfo.position}
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-green-50/80 backdrop-blur-sm border border-green-200/50">
                    <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Emergency Contact</span>
                    </h4>
                    <p className="text-gray-700 font-semibold">
                      {selectedRequest.emergencyContact} - {selectedRequest.emergencyPhone}
                    </p>
                  </div>

                  {selectedRequest.supportingDocuments && (
                    <div className="p-4 rounded-xl bg-purple-50/80 backdrop-blur-sm border border-purple-200/50">
                      <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Supporting Documents</span>
                      </h4>
                      <p className="text-gray-700">{selectedRequest.supportingDocuments}</p>
                    </div>
                  )}

                  {selectedRequest.notes && (
                    <div className="p-4 rounded-xl bg-yellow-50/80 backdrop-blur-sm border border-yellow-200/50">
                      <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Additional Notes</span>
                      </h4>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedRequest.notes}</p>
                    </div>
                  )}

                  <div className="pt-6 border-t border-gray-200/50">
                    <div className="space-y-6">
                      <div className="p-4 rounded-xl bg-blue-50/80 backdrop-blur-sm border border-blue-200/50">
                        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>Admin Notes</span>
                        </label>
                        <Textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Add notes about this leave request..."
                          rows={3}
                          className="border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300"
                        />
                      </div>

                      {selectedRequest.status === 'pending' && (
                        <div className="p-4 rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-200/50">
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Rejection Reason (if rejecting)</span>
                          </label>
                          <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Provide reason for rejection..."
                            rows={2}
                            className="border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                          />
                        </div>
                      )}

                      <div className="flex justify-end space-x-4">
                        <Button
                          onClick={closeRequestDetails}
                          variant="outline"
                          className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                        >
                          Cancel
                        </Button>
                        {selectedRequest.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleStatusUpdate(selectedRequest.id!, 'rejected', adminNotes)}
                              disabled={isUpdating === selectedRequest.id}
                              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                              {isUpdating === selectedRequest.id ? (
                                <Clock className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                              )}
                              Reject
                            </Button>
                            <Button
                              onClick={() => handleStatusUpdate(selectedRequest.id!, 'approved', adminNotes)}
                              disabled={isUpdating === selectedRequest.id}
                              className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                              {isUpdating === selectedRequest.id ? (
                                <Clock className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Approve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

