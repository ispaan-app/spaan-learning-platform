'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Search, 
  Filter, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Building2,
  Calendar,
  MessageSquare,
  RefreshCw,
  Download,
  Eye,
  Wifi,
  WifiOff
} from 'lucide-react'
import { toast } from '@/lib/toast'

interface StipendReport {
  id: string
  learnerId: string
  learnerName: string
  placementId: string
  companyName: string
  month: string
  year: number
  status: 'pending' | 'resolved'
  submittedAt: Date | string
  resolvedAt?: Date | string
  resolvedBy?: string
  notes?: string
  amount?: number
  issue?: string
}

interface StipendReportsManagementProps {
  initialReports: StipendReport[]
  loading?: boolean
  onRefresh?: () => void
  refreshing?: boolean
  realTimeStats?: {
    total: number
    pending: number
    resolved: number
    totalAmount: number
    systemHealth: string
  }
  isOnline?: boolean
  lastUpdate?: Date
}

export function StipendReportsManagement({ 
  initialReports, 
  loading: externalLoading = false,
  onRefresh,
  refreshing = false,
  realTimeStats,
  isOnline = true,
  lastUpdate = new Date()
}: StipendReportsManagementProps) {
  const [reports, setReports] = useState<StipendReport[]>(initialReports)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all')
  const [selectedReport, setSelectedReport] = useState<StipendReport | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [showResolutionDialog, setShowResolutionDialog] = useState(false)

  // Use external loading state if provided
  const isLoading = externalLoading || loading

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.learnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.issue?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = realTimeStats || {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    totalAmount: reports.reduce((sum, r) => sum + (r.amount || 0), 0),
    systemHealth: 'excellent'
  }

  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh()
    } else {
      setLoading(true)
      try {
        // In a real app, this would fetch fresh data
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success('Data refreshed successfully')
      } catch (error) {
        toast.error('Failed to refresh data')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleResolveReport = async (reportId: string) => {
    try {
      // Update the report status
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              status: 'resolved' as const,
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'Super Admin',
              notes: resolutionNotes
            }
          : report
      ))
      
      setShowResolutionDialog(false)
      setResolutionNotes('')
      toast.success('Report resolved successfully')
    } catch (error) {
      toast.error('Failed to resolve report')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive" className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>Pending</span></Badge>
      case 'resolved':
        return <Badge variant="default" className="flex items-center space-x-1 bg-green-600"><CheckCircle className="w-3 h-3" /><span>Resolved</span></Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-8">
      {/* Loading State */}
      {isLoading && (
        <Card className="bg-white shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin"></div>
              <div className="text-center">
                <h3 className="text-lg font-semibold" style={{ color: '#1E3D59' }}>Loading Stipend Reports</h3>
                <p className="text-sm" style={{ color: '#1E3D59' }}>Fetching data from database...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Filters and Actions with AppEver Design */}
      <Card className="bg-white shadow-xl">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Header with Real-time Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#1E3D59' }}>Stipend Reports</h2>
                  <p className="text-sm" style={{ color: '#1E3D59' }}>Manage and resolve payment issues</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                  <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                  <span className="text-sm font-medium text-green-600">Live Data</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing || isLoading}
                  variant="outline"
                  size="sm"
                  className="px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  style={{ color: '#1E3D59' }}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
                  style={{ color: '#1E3D59' }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by learner name, company, or issue..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-48 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Reports Table with AppEver Design */}
      <Card className="bg-white shadow-xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="group relative">
                <Card className="relative bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Report Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                            <DollarSign className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-gray-900">{report.learnerName}</div>
                            <div className="text-sm text-gray-600">{report.companyName}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(report.status)}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105"
                                style={{ color: '#1E3D59', borderColor: '#1E3D59' }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-bold" style={{ color: '#1E3D59' }}>Report Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                                    <Label className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Learner</Label>
                                    <p className="font-medium text-gray-900">{report.learnerName}</p>
                                  </div>
                                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                                    <Label className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Company</Label>
                                    <p className="font-medium text-gray-900">{report.companyName}</p>
                                  </div>
                                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                                    <Label className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Period</Label>
                                    <p className="font-medium text-gray-900">{report.month} {report.year}</p>
                                  </div>
                                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                                    <Label className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Amount</Label>
                                    <p className="font-medium text-green-600">R{report.amount?.toLocaleString() || 'N/A'}</p>
                                  </div>
                                </div>
                                
                                {report.issue && (
                                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                                    <Label className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Issue Description</Label>
                                    <p className="mt-2 p-3 bg-white rounded-md text-gray-700">{report.issue}</p>
                                  </div>
                                )}
                                
                                <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                                  <Label className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Status</Label>
                                  <div className="mt-2">{getStatusBadge(report.status)}</div>
                                </div>
                                
                                {report.notes && (
                                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                                    <Label className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Resolution Notes</Label>
                                    <p className="mt-2 p-3 bg-white rounded-md text-gray-700">{report.notes}</p>
                                  </div>
                                )}
                                
                                {report.status === 'pending' && (
                                  <div className="pt-4 border-t">
                                    <Label className="text-sm font-semibold mb-2 block" style={{ color: '#1E3D59' }}>Resolution Notes</Label>
                                    <Textarea
                                      placeholder="Add notes about how this issue was resolved..."
                                      value={resolutionNotes}
                                      onChange={(e) => setResolutionNotes(e.target.value)}
                                      rows={3}
                                      className="rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                                    />
                                    <div className="flex justify-end space-x-3 mt-4">
                                      <Button
                                        onClick={() => handleResolveReport(report.id)}
                                        disabled={!resolutionNotes.trim()}
                                        className="px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                        style={{ backgroundColor: '#10B981' }}
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Mark as Resolved
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      {/* Report Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2 p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                          <Calendar className="w-4 h-4" style={{ color: '#1E3D59' }} />
                          <span className="text-sm font-medium" style={{ color: '#1E3D59' }}>
                            {report.month} {report.year}
                          </span>
                        </div>
                        {report.amount && (
                          <div className="flex items-center space-x-2 p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                            <DollarSign className="w-4 h-4" style={{ color: '#1E3D59' }} />
                            <span className="text-sm font-medium text-green-600">
                              R{report.amount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                          <Clock className="w-4 h-4" style={{ color: '#1E3D59' }} />
                          <span className="text-sm font-medium" style={{ color: '#1E3D59' }}>
                            {formatDate(report.submittedAt)}
                          </span>
                        </div>
                      </div>
                      
                      {report.issue && (
                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="w-4 h-4" style={{ color: '#FF6E40' }} />
                            <span className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Issue</span>
                          </div>
                          <p className="text-sm text-gray-700">{report.issue}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                        <div className="flex items-center space-x-4">
                          <span>Submitted: {formatDate(report.submittedAt)}</span>
                          {report.resolvedAt && (
                            <span>Resolved: {formatDate(report.resolvedAt)}</span>
                          )}
                          {report.resolvedBy && (
                            <span>By: {report.resolvedBy}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
            
            {filteredReports.length === 0 && !isLoading && (
              <Card className="bg-white shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F5F0E1' }}>
                    <AlertCircle className="w-8 h-8" style={{ color: '#FF6E40' }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#1E3D59' }}>No Reports Found</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search criteria or filters.'
                      : 'No stipend reports have been submitted yet.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


