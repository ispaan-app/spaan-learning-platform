'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { AiChatbot } from '@/components/ai-chatbot'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LeaveRequestForm } from '@/components/learner/leave-request-form'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Plus,
  RefreshCw,
  User,
  CalendarDays,
  FileText
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getLeaveRequestsAction, LeaveRequest } from '@/app/learner/actions'
import { toast } from '@/lib/toast'

export default function LeavePage() {
  const { user, userRole } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])

  const loadLeaveRequests = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const data = await getLeaveRequestsAction(user.uid)
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
  }, [user])

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

  if (isLoading) {
    return (
      <AdminLayout userRole="learner">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="learner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600">Request and manage your leave applications</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={loadLeaveRequests}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{showForm ? 'Cancel' : 'New Request'}</span>
            </Button>
          </div>
        </div>

        {/* Leave Request Form */}
        {showForm && (
          <LeaveRequestForm
            userId={user?.uid || ''}
            userName={user?.displayName || 'Learner'}
            userEmail={user?.email || ''}
            onSuccess={() => {
              setShowForm(false)
              loadLeaveRequests()
            }}
            className="animate-in slide-in-from-top duration-300"
          />
        )}

        {/* Leave Summary */}
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
                  <p className="text-sm text-gray-600">Total Days</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {leaveRequests
                      .filter(r => r.status === 'approved')
                      .reduce((sum, r) => sum + r.days, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Leave Requests ({leaveRequests.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaveRequests.length > 0 ? (
              <div className="space-y-4">
                {leaveRequests.map((request) => (
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
                              <h3 className="font-semibold text-lg">{getTypeLabel(request.type)}</h3>
                              <p className="text-sm text-gray-600">
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No leave requests found</p>
                <p className="text-sm">Submit your first leave request to get started</p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Leave Request
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* AI Support Chatbot */}
      <AiChatbot />
    </AdminLayout>
  )
}