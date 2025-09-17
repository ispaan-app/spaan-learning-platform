'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MessageCircle,
  Send,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Minus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Zap,
  Star,
  Heart,
  Crown,
  Shield,
  Brain,
  Users,
  Award,
  Target,
  Activity,
  TrendingUp,
  RefreshCw,
  Settings,
  Bell,
  Download,
  Upload,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaveRequest {
  id: string
  type: 'sick' | 'personal' | 'vacation' | 'emergency' | 'other'
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  comments?: string
}

interface LeaveBalance {
  totalDays: number
  usedDays: number
  remainingDays: number
  sickDays: number
  personalDays: number
  vacationDays: number
}

export function EnhancedLeavePage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
    totalDays: 20,
    usedDays: 8,
    remainingDays: 12,
    sickDays: 5,
    personalDays: 7,
    vacationDays: 8
  })
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)

  const [newRequest, setNewRequest] = useState({
    type: 'personal' as LeaveRequest['type'],
    startDate: '',
    endDate: '',
    reason: '',
    days: 0
  })

  useEffect(() => {
    // Mock data
    setLeaveRequests([
      {
        id: '1',
        type: 'vacation',
        startDate: '2024-01-15',
        endDate: '2024-01-17',
        days: 3,
        reason: 'Family vacation',
        status: 'approved',
        submittedAt: '2024-01-10T10:00:00Z',
        reviewedAt: '2024-01-11T14:30:00Z',
        reviewedBy: 'John Smith'
      },
      {
        id: '2',
        type: 'sick',
        startDate: '2024-01-20',
        endDate: '2024-01-20',
        days: 1,
        reason: 'Doctor appointment',
        status: 'pending',
        submittedAt: '2024-01-19T09:00:00Z'
      },
      {
        id: '3',
        type: 'personal',
        startDate: '2024-01-25',
        endDate: '2024-01-25',
        days: 1,
        reason: 'Personal matters',
        status: 'rejected',
        submittedAt: '2024-01-24T16:00:00Z',
        reviewedAt: '2024-01-24T17:00:00Z',
        reviewedBy: 'Jane Doe',
        comments: 'Please provide more details about the personal matter'
      }
    ])
  }, [])

  const handleSubmitRequest = async () => {
    setIsLoading(true)
    
    // Calculate days
    const start = new Date(newRequest.startDate)
    const end = new Date(newRequest.endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    const request: LeaveRequest = {
      id: Date.now().toString(),
      type: newRequest.type,
      startDate: newRequest.startDate,
      endDate: newRequest.endDate,
      days,
      reason: newRequest.reason,
      status: 'pending',
      submittedAt: new Date().toISOString()
    }
    
    setLeaveRequests(prev => [request, ...prev])
    setNewRequest({
      type: 'personal',
      startDate: '',
      endDate: '',
      reason: '',
      days: 0
    })
    setShowNewRequest(false)
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'cancelled':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vacation':
        return 'text-blue-600 bg-blue-100'
      case 'sick':
        return 'text-red-600 bg-red-100'
      case 'personal':
        return 'text-purple-600 bg-purple-100'
      case 'emergency':
        return 'text-orange-600 bg-orange-100'
      case 'other':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const calculateDays = () => {
    if (newRequest.startDate && newRequest.endDate) {
      const start = new Date(newRequest.startDate)
      const end = new Date(newRequest.endDate)
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    }
    return 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Leave Management</h1>
              <p className="text-xl text-gray-600">Request and manage your time off</p>
            </div>
            <Button
              onClick={() => setShowNewRequest(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Request
            </Button>
          </div>
        </div>

        {/* Leave Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Days</p>
                  <p className="text-2xl font-bold text-gray-900">{leaveBalance.totalDays}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-emerald-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Remaining</p>
                  <p className="text-2xl font-bold text-gray-900">{leaveBalance.remainingDays}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 to-orange-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Used</p>
                  <p className="text-2xl font-bold text-gray-900">{leaveBalance.usedDays}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leaveRequests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leave Requests List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Leave Requests</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaveRequests.map((request) => (
                    <div key={request.id} className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            request.type === 'vacation' ? 'bg-blue-100' :
                            request.type === 'sick' ? 'bg-red-100' :
                            request.type === 'personal' ? 'bg-purple-100' :
                            request.type === 'emergency' ? 'bg-orange-100' :
                            'bg-gray-100'
                          }`}>
                            <Calendar className={`w-6 h-6 ${
                              request.type === 'vacation' ? 'text-blue-600' :
                              request.type === 'sick' ? 'text-red-600' :
                              request.type === 'personal' ? 'text-purple-600' :
                              request.type === 'emergency' ? 'text-orange-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 capitalize">{request.type} Leave</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold">{request.days} day{request.days > 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Submitted</p>
                          <p className="font-semibold">
                            {new Date(request.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Reason</p>
                        <p className="text-gray-900">{request.reason}</p>
                      </div>
                      
                      {request.comments && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Comments</p>
                          <p className="text-gray-900">{request.comments}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {request.reviewedBy && `Reviewed by ${request.reviewedBy}`}
                        </div>
                        <div className="flex space-x-2">
                          {request.status === 'pending' && (
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Leave Types Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  <span>Leave Types</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Vacation</span>
                    <span className="font-semibold">{leaveBalance.vacationDays} days</span>
                  </div>
                  <Progress value={(leaveBalance.vacationDays / leaveBalance.totalDays) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sick</span>
                    <span className="font-semibold">{leaveBalance.sickDays} days</span>
                  </div>
                  <Progress value={(leaveBalance.sickDays / leaveBalance.totalDays) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Personal</span>
                    <span className="font-semibold">{leaveBalance.personalDays} days</span>
                  </div>
                  <Progress value={(leaveBalance.personalDays / leaveBalance.totalDays) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Calendar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Summary
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* New Request Modal */}
        {showNewRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>New Leave Request</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewRequest(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Leave Type
                    </label>
                    <select
                      value={newRequest.type}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, type: e.target.value as LeaveRequest['type'] }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="personal">Personal</option>
                      <option value="sick">Sick</option>
                      <option value="vacation">Vacation</option>
                      <option value="emergency">Emergency</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {calculateDays()} day{calculateDays() > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={newRequest.startDate}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, startDate: e.target.value }))}
                      className="p-3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={newRequest.endDate}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, endDate: e.target.value }))}
                      className="p-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <Textarea
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Please provide a reason for your leave request..."
                    className="p-3 min-h-[100px]"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewRequest(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitRequest}
                    disabled={isLoading || !newRequest.startDate || !newRequest.endDate || !newRequest.reason}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Submit Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
