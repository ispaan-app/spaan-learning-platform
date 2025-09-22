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
  FileText,
  Shield,
  TrendingUp,
  Activity,
  Sparkles
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getLeaveRequestsAction, LeaveRequest } from '@/app/learner/actions'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

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
      case 'approved': 
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending': 
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'rejected': 
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'cancelled': 
        return <XCircle className="h-4 w-4 text-gray-600" />
      default: 
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <AdminLayout userRole="learner">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-700">Loading leave requests...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="learner">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-400 to-cyan-600 rounded-full translate-y-40 -translate-x-40"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-pink-400 to-orange-600 rounded-full -translate-x-32 -translate-y-32"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto space-y-8 p-6">
          {/* Enhanced Header */}
          <div className="text-center space-y-6 mb-8">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg mb-4">
              <Shield className="h-5 w-5 mr-2" />
              <span className="font-semibold">Leave Management System</span>
          </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Leave Management
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Request and manage your leave applications with ease. Track your leave balance and stay connected with your team.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Button
              onClick={loadLeaveRequests}
              variant="outline"
                size="lg"
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
                <RefreshCw className="h-5 w-5" />
                <span>Refresh Data</span>
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
                size="lg"
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
                <Plus className="h-5 w-5" />
                <span>{showForm ? 'Cancel Request' : 'New Leave Request'}</span>
                <Sparkles className="h-4 w-4" />
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

          {/* Enhanced Leave Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Pending Requests */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 hover:border-yellow-300 transition-all duration-300 shadow-lg hover:shadow-xl group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-yellow-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-700 mb-1">Pending Requests</p>
                  <p className="text-3xl font-bold text-yellow-800">
                    {leaveRequests.filter(r => r.status === 'pending').length}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">Awaiting approval</p>
              </div>
            </CardContent>
          </Card>

            {/* Approved Requests */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-300 transition-all duration-300 shadow-lg hover:shadow-xl group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <Activity className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 mb-1">Approved Requests</p>
                  <p className="text-3xl font-bold text-green-800">
                    {leaveRequests.filter(r => r.status === 'approved').length}
                  </p>
                  <p className="text-xs text-green-600 mt-1">Ready to take</p>
              </div>
            </CardContent>
          </Card>

            {/* Rejected Requests */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 hover:border-red-300 transition-all duration-300 shadow-lg hover:shadow-xl group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400 to-pink-400 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-lg">
                    <XCircle className="h-6 w-6 text-white" />
                  </div>
                  <AlertTriangle className="h-5 w-5 text-red-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-700 mb-1">Rejected Requests</p>
                  <p className="text-3xl font-bold text-red-800">
                    {leaveRequests.filter(r => r.status === 'rejected').length}
                  </p>
                  <p className="text-xs text-red-600 mt-1">Need attention</p>
              </div>
            </CardContent>
          </Card>

            {/* Total Days */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <CalendarDays className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">Total Days Taken</p>
                  <p className="text-3xl font-bold text-blue-800">
                    {leaveRequests
                      .filter(r => r.status === 'approved')
                      .reduce((sum, r) => sum + r.days, 0)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">This period</p>
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Enhanced Leave Requests List */}
          <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-gray-200 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
                  Leave Requests ({leaveRequests.length})
                </span>
            </CardTitle>
          </CardHeader>
            <CardContent className="p-6">
            {leaveRequests.length > 0 ? (
                <div className="space-y-6">
                {leaveRequests.map((request) => (
                  <div
                    key={request.id}
                      className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all duration-300 group"
                    >
                      {/* Background Pattern */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full -translate-y-12 translate-x-12 opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                      
                      <div className="p-6 relative">
                        <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                              <span className="text-2xl">{getTypeIcon(request.type)}</span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 mb-1">{getTypeLabel(request.type)}</h3>
                              <p className="text-sm text-gray-600 font-medium">
                                {request.startDate} - {request.endDate} ({request.days} day{request.days !== 1 ? 's' : ''})
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={cn(
                              "px-4 py-2 text-sm font-semibold rounded-full shadow-lg",
                              getStatusColor(request.status)
                            )}>
                              {getStatusIcon(request.status)}
                              <span className="ml-2 capitalize">{request.status}</span>
                          </Badge>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-700 font-medium">
                              <span className="text-blue-600 font-semibold">Reason:</span> {request.reason}
                            </p>
                          </div>
                          
                          {request.placementInfo && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                              <p className="text-sm text-blue-700 font-medium">
                                <span className="text-blue-600 font-semibold">Placement:</span> {request.placementInfo.companyName}
                            </p>
                            </div>
                          )}
                          
                          {request.emergencyContact && (
                            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                              <p className="text-sm text-green-700 font-medium">
                                <span className="text-green-600 font-semibold">Emergency Contact:</span> {request.emergencyContact} ({request.emergencyPhone})
                            </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-full border border-gray-200">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Submitted: {request.submittedAt.toLocaleDateString()}</span>
                          </div>
                          {request.reviewedAt && (
                            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-full border border-gray-200">
                              <Clock className="h-4 w-4 text-green-500" />
                              <span className="font-medium">Reviewed: {request.reviewedAt.toLocaleDateString()}</span>
                            </div>
                          )}
                          {request.reviewedBy && (
                            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-full border border-gray-200">
                              <User className="h-4 w-4 text-purple-500" />
                              <span className="font-medium">By: {request.reviewedBy}</span>
                            </div>
                          )}
                        </div>

                        {request.adminNotes && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 mb-4">
                            <p className="text-sm text-blue-700 font-medium">
                              <span className="text-blue-600 font-semibold">Admin Notes:</span> {request.adminNotes}
                            </p>
                          </div>
                        )}

                        {request.rejectionReason && (
                          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200">
                            <p className="text-sm text-red-700 font-medium">
                              <span className="text-red-600 font-semibold">Rejection Reason:</span> {request.rejectionReason}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
                    <Calendar className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Leave Requests Yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start your leave management journey by submitting your first leave request. 
                  It's quick, easy, and secure!
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Submit Your First Request
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* AI Floating Chatbot */}
        <div className="fixed bottom-6 right-6 z-50">
          <AiChatbot className="shadow-2xl" />
        </div>
        </div>
      </div>
    </AdminLayout>
  )
}