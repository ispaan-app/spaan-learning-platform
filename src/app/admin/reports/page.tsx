'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  Users,
  GraduationCap,
  Building2,
  TrendingUp,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'

interface Report {
  id: string
  title: string
  description: string
  type: 'users' | 'learners' | 'placements' | 'applications' | 'analytics' | 'financial' | 'performance' | 'compliance'
  status: 'generated' | 'generating' | 'failed' | 'scheduled'
  createdAt: string
  generatedBy: string
  fileSize?: string
  downloadCount: number
  format: 'pdf' | 'excel' | 'csv' | 'json'
  scheduledFor?: string
  parameters?: {
    dateRange?: string
    program?: string
    status?: string
    includeCharts?: boolean
    includeDetails?: boolean
  }
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: any
  category: string
  parameters: string[]
  estimatedTime: string
  fileFormats: string[]
}

interface ReportStats {
  totalReports: number
  generatedThisMonth: number
  totalDownloads: number
  averageGenerationTime: string
  mostPopularType: string
  scheduledReports: number
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [stats, setStats] = useState<ReportStats>({
    totalReports: 0,
    generatedThisMonth: 0,
    totalDownloads: 0,
    averageGenerationTime: '0m',
    mostPopularType: 'users',
    scheduledReports: 0
  })
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [dateRange, setDateRange] = useState<string>('')
  const [reportParameters, setReportParameters] = useState({
    dateRange: '30days',
    program: 'all',
    status: 'all',
    includeCharts: true,
    includeDetails: true,
    format: 'pdf' as 'pdf' | 'excel' | 'csv' | 'json'
  })

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'user-summary',
      name: 'User Summary Report',
      description: 'Comprehensive overview of all users, roles, and activity',
      icon: Users,
      category: 'Users',
      parameters: ['dateRange', 'role', 'status', 'includeCharts'],
      estimatedTime: '2-3 minutes',
      fileFormats: ['pdf', 'excel', 'csv']
    },
    {
      id: 'learner-progress',
      name: 'Learner Progress Report',
      description: 'Detailed progress tracking and performance metrics for learners',
      icon: GraduationCap,
      category: 'Learners',
      parameters: ['dateRange', 'program', 'includeCharts', 'includeDetails'],
      estimatedTime: '3-5 minutes',
      fileFormats: ['pdf', 'excel']
    },
    {
      id: 'placement-performance',
      name: 'Placement Performance Report',
      description: 'Analysis of work placement success rates and company performance',
      icon: Building2,
      category: 'Placements',
      parameters: ['dateRange', 'company', 'includeCharts'],
      estimatedTime: '4-6 minutes',
      fileFormats: ['pdf', 'excel', 'csv']
    },
    {
      id: 'application-analytics',
      name: 'Application Analytics Report',
      description: 'Trends and insights on application patterns and outcomes',
      icon: TrendingUp,
      category: 'Applications',
      parameters: ['dateRange', 'program', 'status', 'includeCharts'],
      estimatedTime: '2-4 minutes',
      fileFormats: ['pdf', 'excel']
    },
    {
      id: 'financial-summary',
      name: 'Financial Summary Report',
      description: 'Revenue, costs, and financial performance metrics',
      icon: FileText,
      category: 'Financial',
      parameters: ['dateRange', 'includeCharts', 'includeDetails'],
      estimatedTime: '5-8 minutes',
      fileFormats: ['pdf', 'excel']
    },
    {
      id: 'compliance-report',
      name: 'Compliance Report',
      description: 'Regulatory compliance and audit trail documentation',
      icon: CheckCircle,
      category: 'Compliance',
      parameters: ['dateRange', 'includeDetails'],
      estimatedTime: '3-5 minutes',
      fileFormats: ['pdf']
    }
  ]

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      // Mock data for demonstration
      const mockReports: Report[] = [
        {
          id: '1',
          title: 'User Summary Report',
          description: 'Complete overview of all users in the system',
          type: 'users',
          status: 'generated',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          generatedBy: 'Admin User',
          fileSize: '2.4 MB',
          downloadCount: 15,
          format: 'pdf'
        },
        {
          id: '2',
          title: 'Learner Progress Report',
          description: 'Detailed progress tracking for all learners',
          type: 'learners',
          status: 'generated',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          generatedBy: 'Admin User',
          fileSize: '1.8 MB',
          downloadCount: 8,
          format: 'excel'
        },
        {
          id: '3',
          title: 'Placement Status Report',
          description: 'Current status and performance of all placements',
          type: 'placements',
          status: 'generating',
          createdAt: new Date(Date.now() - 300000).toISOString(),
          generatedBy: 'Admin User',
          downloadCount: 0,
          format: 'csv'
        }
      ]
      setReports(mockReports)
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (templateId: string) => {
    try {
      setGenerating(templateId)
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const template = reportTemplates.find(t => t.id === templateId)
      if (!template) return

      const newReport: Report = {
        id: Date.now().toString(),
        title: template.name,
        description: template.description,
        type: template.category.toLowerCase() as any,
        status: 'generated',
        createdAt: new Date().toISOString(),
        generatedBy: 'Admin User',
        fileSize: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
        downloadCount: 0,
        format: 'pdf'
      }

      setReports(prev => [newReport, ...prev])
      setSelectedTemplate(null)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setGenerating(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generated':
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>
      case 'generating':
        return <Badge className="bg-yellow-100 text-yellow-800">Generating...</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'generating':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Generate and manage system reports</p>
          </div>
          <Button onClick={loadReports} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Report Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Generate New Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="template">Report Template</Label>
                <Select value={selectedTemplate?.id || ''} onValueChange={(value) => {
                  const template = reportTemplates.find(t => t.id === value);
                  setSelectedTemplate(template || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report template" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTemplates.map((template) => {
                      const IconComponent = template.icon
                      return (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center space-x-2">
                            <IconComponent className="w-4 h-4" />
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dateRange">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="1year">Last year</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={() => selectedTemplate && generateReport(selectedTemplate.id)}
                  disabled={!selectedTemplate || generating === selectedTemplate.id}
                  className="w-full"
                >
                  {generating === selectedTemplate?.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportTemplates.map((template) => {
                const IconComponent = template.icon
                return (
                  <div
                    key={template.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <Badge variant="outline" className="mt-2">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Generated Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Reports</span>
              <Badge variant="outline">{reports.length} reports</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports generated</h3>
                <p className="text-gray-600">Generate your first report using the templates above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(report.status)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{report.title}</h3>
                          {getStatusBadge(report.status)}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(report.createdAt)}</span>
                          </div>
                          <span>by {report.generatedBy}</span>
                          {report.fileSize && (
                            <span>{report.fileSize}</span>
                          )}
                          <span>{report.downloadCount} downloads</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {report.status === 'generated' && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
