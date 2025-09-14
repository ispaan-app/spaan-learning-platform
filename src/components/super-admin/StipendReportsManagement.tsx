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
  Eye
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
}

export function StipendReportsManagement({ initialReports }: StipendReportsManagementProps) {
  const [reports, setReports] = useState<StipendReport[]>(initialReports)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all')
  const [selectedReport, setSelectedReport] = useState<StipendReport | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [showResolutionDialog, setShowResolutionDialog] = useState(false)

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.learnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.issue?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    totalAmount: reports.reduce((sum, r) => sum + (r.amount || 0), 0)
  }

  const handleRefresh = async () => {
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
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">R{stats.totalAmount.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stipend Reports</CardTitle>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleRefresh}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by learner name, company, or issue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-48">
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

          {/* Reports Table */}
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{report.learnerName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{report.companyName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{report.month} {report.year}</span>
                        </div>
                        {report.amount && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-green-600">R{report.amount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {report.issue && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">
                            <strong>Issue:</strong> {report.issue}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Submitted: {formatDate(report.submittedAt)}</span>
                        {report.resolvedAt && (
                          <span>Resolved: {formatDate(report.resolvedAt)}</span>
                        )}
                        {report.resolvedBy && (
                          <span>By: {report.resolvedBy}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(report.status)}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Report Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Learner</Label>
                                <p className="font-medium">{report.learnerName}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Company</Label>
                                <p className="font-medium">{report.companyName}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Period</Label>
                                <p className="font-medium">{report.month} {report.year}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Amount</Label>
                                <p className="font-medium text-green-600">R{report.amount?.toLocaleString() || 'N/A'}</p>
                              </div>
                            </div>
                            
                            {report.issue && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Issue Description</Label>
                                <p className="mt-1 p-3 bg-gray-50 rounded-md">{report.issue}</p>
                              </div>
                            )}
                            
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Status</Label>
                              <div className="mt-1">{getStatusBadge(report.status)}</div>
                            </div>
                            
                            {report.notes && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Resolution Notes</Label>
                                <p className="mt-1 p-3 bg-gray-50 rounded-md">{report.notes}</p>
                              </div>
                            )}
                            
                            {report.status === 'pending' && (
                              <div className="pt-4 border-t">
                                <Label className="text-sm font-medium text-gray-600 mb-2 block">Resolution Notes</Label>
                                <Textarea
                                  placeholder="Add notes about how this issue was resolved..."
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                  rows={3}
                                />
                                <div className="flex justify-end space-x-3 mt-4">
                                  <Button
                                    onClick={() => handleResolveReport(report.id)}
                                    disabled={!resolutionNotes.trim()}
                                    className="bg-green-600 hover:bg-green-700"
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
                </CardContent>
              </Card>
            ))}
            
            {filteredReports.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
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


