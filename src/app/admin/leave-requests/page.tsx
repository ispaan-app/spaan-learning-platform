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
  AlertTriangle
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
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leave Requests</h1>
            <p className="text-gray-600">Manage and review leave applications</p>
          </div>
          <Button
            onClick={loadLeaveRequests}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {leaveRequests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {leaveRequests.filter(r => r.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {leaveRequests.filter(r => r.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-blue-600">{leaveRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, reason, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select value={statusFilter} onValueChange={(value: 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled') => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal Leave</SelectItem>
                    <SelectItem value="emergency">Emergency Leave</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Requests List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Leave Requests ({filteredRequests.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getTypeIcon(request.type)}</span>
                            <div>
                              <h3 className="font-semibold text-lg">{request.userName}</h3>
                              <p className="text-sm text-gray-600">{getTypeLabel(request.type)}</p>
                              <p className="text-sm text-gray-500">
                                {request.startDate} - {request.endDate} ({request.days} day{request.days !== 1 ? 's' : ''})
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm text-gray-700">
                            <strong>Reason:</strong> {request.reason}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Email:</strong> {request.userEmail}
                          </p>
                          {request.placementInfo && (
                            <p className="text-sm text-gray-600">
                              <strong>Placement:</strong> {request.placementInfo.companyName}
                            </p>
                          )}
                          {request.emergencyContact && (
                            <p className="text-sm text-gray-600">
                              <strong>Emergency Contact:</strong> {request.emergencyContact} ({request.emergencyPhone})
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted: {request.submittedAt.toLocaleDateString()}</span>
                          </div>
                          {request.reviewedAt && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>Reviewed: {request.reviewedAt.toLocaleDateString()}</span>
                            </div>
                          )}
                          {request.reviewedBy && (
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>By: {request.reviewedBy}</span>
                            </div>
                          )}
                        </div>

                        {request.adminNotes && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Admin Notes:</strong> {request.adminNotes}
                            </p>
                          </div>
                        )}

                        {request.rejectionReason && (
                          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                            <p className="text-sm text-red-700">
                              <strong>Rejection Reason:</strong> {request.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {getStatusIcon(request.status)}
                        <Button
                          onClick={() => openRequestDetails(request)}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Review</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No leave requests found</p>
                <p className="text-sm">No requests match your current filters</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leave Request Details Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Review Leave Request</h2>
                  <Button onClick={closeRequestDetails} variant="outline" size="sm">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Requestor</h4>
                      <p className="text-lg">{selectedRequest.userName}</p>
                      <p className="text-sm text-gray-500">{selectedRequest.userEmail}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Leave Type</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTypeIcon(selectedRequest.type)}</span>
                        <span>{getTypeLabel(selectedRequest.type)}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Duration</h4>
                      <p className="text-lg">
                        {selectedRequest.startDate} - {selectedRequest.endDate}
                      </p>
                      <p className="text-sm text-gray-500">{selectedRequest.days} day{selectedRequest.days !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Status</h4>
                      <Badge className={getStatusColor(selectedRequest.status)}>
                        {selectedRequest.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Reason</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.reason}</p>
                  </div>

                  {selectedRequest.placementInfo && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Placement</h4>
                      <p className="text-gray-700">
                        {selectedRequest.placementInfo.companyName} - {selectedRequest.placementInfo.position}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">Emergency Contact</h4>
                    <p className="text-gray-700">
                      {selectedRequest.emergencyContact} - {selectedRequest.emergencyPhone}
                    </p>
                  </div>

                  {selectedRequest.supportingDocuments && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Supporting Documents</h4>
                      <p className="text-gray-700">{selectedRequest.supportingDocuments}</p>
                    </div>
                  )}

                  {selectedRequest.notes && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-600">Additional Notes</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.notes}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                        <Textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Add notes about this leave request..."
                          rows={3}
                        />
                      </div>

                      {selectedRequest.status === 'pending' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason (if rejecting)</label>
                          <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Provide reason for rejection..."
                            rows={2}
                          />
                        </div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <Button
                          onClick={closeRequestDetails}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                        {selectedRequest.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleStatusUpdate(selectedRequest.id!, 'rejected', adminNotes)}
                              disabled={isUpdating === selectedRequest.id}
                              className="bg-red-600 hover:bg-red-700"
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
                              className="bg-green-600 hover:bg-green-700"
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

