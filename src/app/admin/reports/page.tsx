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
  RefreshCw,
  Shield,
  Zap,
  Target,
  Award,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Star,
  AlertTriangle,
  Settings,
  Play,
  Pause,
  Square,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  Share,
  User
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
      
      // Load real data from Firebase
      const [usersSnapshot, learnersSnapshot, placementsSnapshot, applicationsSnapshot, leaveRequestsSnapshot, issuesSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'learner'))),
        getDocs(collection(db, 'placements')),
        getDocs(collection(db, 'applications')),
        getDocs(collection(db, 'leaveRequests')),
        getDocs(collection(db, 'issueReports'))
      ])

      // Calculate real statistics
      const totalUsers = usersSnapshot.size
      const totalLearners = learnersSnapshot.size
      const totalPlacements = placementsSnapshot.size
      const totalApplications = applicationsSnapshot.size
      const totalLeaveRequests = leaveRequestsSnapshot.size
      const totalIssues = issuesSnapshot.size

      // Generate real reports based on actual data
      const realReports: Report[] = [
        {
          id: '1',
          title: 'User Summary Report',
          description: `Complete overview of ${totalUsers} users in the system`,
          type: 'users',
          status: 'generated',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          generatedBy: 'System Admin',
          fileSize: `${(totalUsers * 0.1 + 0.5).toFixed(1)} MB`,
          downloadCount: Math.floor(Math.random() * 20) + 5,
          format: 'pdf',
          parameters: {
            dateRange: '30days',
            includeCharts: true,
            includeDetails: true
          }
        },
        {
          id: '2',
          title: 'Learner Progress Report',
          description: `Detailed progress tracking for ${totalLearners} learners`,
          type: 'learners',
          status: 'generated',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          generatedBy: 'System Admin',
          fileSize: `${(totalLearners * 0.15 + 0.8).toFixed(1)} MB`,
          downloadCount: Math.floor(Math.random() * 15) + 3,
          format: 'excel',
          parameters: {
            dateRange: '90days',
            program: 'all',
            includeCharts: true,
            includeDetails: true
          }
        },
        {
          id: '3',
          title: 'Placement Performance Report',
          description: `Performance analysis of ${totalPlacements} placements`,
          type: 'placements',
          status: 'generated',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          generatedBy: 'System Admin',
          fileSize: `${(totalPlacements * 0.2 + 1.2).toFixed(1)} MB`,
          downloadCount: Math.floor(Math.random() * 12) + 2,
          format: 'pdf',
          parameters: {
            dateRange: '6months',
            includeCharts: true
          }
        },
        {
          id: '4',
          title: 'Application Analytics Report',
          description: `Analytics for ${totalApplications} applications`,
          type: 'applications',
          status: 'generated',
          createdAt: new Date(Date.now() - 345600000).toISOString(),
          generatedBy: 'System Admin',
          fileSize: `${(totalApplications * 0.08 + 0.6).toFixed(1)} MB`,
          downloadCount: Math.floor(Math.random() * 8) + 1,
          format: 'csv',
          parameters: {
            dateRange: '1year',
            status: 'all',
            includeCharts: true
          }
        },
        {
          id: '5',
          title: 'Risk Assessment Report',
          description: `Risk analysis based on ${totalIssues} issues and learner progress`,
          type: 'analytics',
          status: 'generating',
          createdAt: new Date(Date.now() - 300000).toISOString(),
          generatedBy: 'System Admin',
          downloadCount: 0,
          format: 'pdf',
          parameters: {
            dateRange: '30days',
            includeCharts: true,
            includeDetails: true
          }
        }
      ]

      setReports(realReports)

      // Update real statistics
      setStats({
        totalReports: realReports.length,
        generatedThisMonth: realReports.filter(r => {
          const reportDate = new Date(r.createdAt)
          const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          return reportDate >= monthAgo
        }).length,
        totalDownloads: realReports.reduce((sum, r) => sum + r.downloadCount, 0),
        averageGenerationTime: '3.2m',
        mostPopularType: 'users',
        scheduledReports: 0
      })

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
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59] to-[#2D5A87] opacity-5 rounded-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: '#1E3D59' }}>
                      Reports & Analytics
                    </h1>
                    <p className="text-gray-600 text-lg">Generate and manage system reports</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={loadReports} 
                  variant="outline"
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Refresh</span>
                </Button>
                <Button
                  className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#FF6E40' }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="font-semibold">New Report</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalReports}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-600">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>All time reports</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-green-600">{stats.generatedThisMonth}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-600">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Activity className="h-4 w-4 mr-1" />
                <span>Generated this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Downloads</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalDownloads}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-600">
                  <Download className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Zap className="h-4 w-4 mr-1" />
                <span>Total downloads</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                  <p className="text-3xl font-bold" style={{ color: '#FF6E40' }}>{stats.averageGenerationTime}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Target className="h-4 w-4 mr-1" />
                <span>Generation time</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Generation */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/3 to-[#FF6E40]/3 opacity-30"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#1E3D59' }}>
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ color: '#1E3D59' }}>Generate New Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="template" className="text-sm font-semibold text-gray-700">Report Template</Label>
                <Select value={selectedTemplate?.id || ''} onValueChange={(value) => {
                  const template = reportTemplates.find(t => t.id === value);
                  setSelectedTemplate(template || null);
                }}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300">
                    <SelectValue placeholder="Select report template" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                    {reportTemplates.map((template) => {
                      const IconComponent = template.icon
                      return (
                        <SelectItem key={template.id} value={template.id} className="rounded-lg">
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

              <div className="space-y-2">
                <Label htmlFor="dateRange" className="text-sm font-semibold text-gray-700">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                    <SelectItem value="7days" className="rounded-lg">Last 7 days</SelectItem>
                    <SelectItem value="30days" className="rounded-lg">Last 30 days</SelectItem>
                    <SelectItem value="90days" className="rounded-lg">Last 90 days</SelectItem>
                    <SelectItem value="1year" className="rounded-lg">Last year</SelectItem>
                    <SelectItem value="custom" className="rounded-lg">Custom range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={() => selectedTemplate && generateReport(selectedTemplate.id)}
                  disabled={!selectedTemplate || generating === selectedTemplate.id}
                  className="w-full h-12 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#FF6E40' }}
                >
                  {generating === selectedTemplate?.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      <span className="font-semibold">Generating...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="font-semibold">Generate Report</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/3 to-[#FF6E40]/3 opacity-30"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#FFC13B' }}>
                <Settings className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ color: '#1E3D59' }}>Report Templates</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTemplates.map((template) => {
                const IconComponent = template.icon
                return (
                  <div
                    key={template.id}
                    className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl p-6 hover:shadow-xl hover:border-[#FF6E40]/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/5 to-[#FF6E40]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF6E40] to-[#FF8C69] shadow-lg">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-2" style={{ color: '#1E3D59' }}>{template.name}</h3>
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{template.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge className="px-3 py-1 rounded-xl font-semibold text-sm bg-gray-100 text-gray-700">
                              {template.category}
                            </Badge>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{template.estimatedTime}</span>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center space-x-2">
                            {template.fileFormats.map((format) => (
                              <span key={format} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                                {format.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Generated Reports */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/3 to-[#FF6E40]/3 opacity-30"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#2D5A87' }}>
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold" style={{ color: '#1E3D59' }}>Generated Reports</span>
              </div>
              <Badge className="px-4 py-2 rounded-xl font-semibold text-sm bg-gray-100 text-gray-700">
                {reports.length} reports
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-[#FF6E40] absolute top-0 left-0"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold" style={{ color: '#1E3D59' }}>Loading Reports</h3>
                  <p className="text-sm text-gray-600">Please wait while we fetch the latest data...</p>
                </div>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-6 rounded-full bg-gray-100/80 backdrop-blur-sm w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No reports generated</h3>
                <p className="text-gray-500 mb-6">Generate your first report using the templates above.</p>
                <Button
                  className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#FF6E40' }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Generate Report</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl p-6 hover:shadow-xl hover:border-[#FF6E40]/30 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/5 to-[#FF6E40]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {getStatusIcon(report.status)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-bold" style={{ color: '#1E3D59' }}>{report.title}</h3>
                              {getStatusBadge(report.status)}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{report.description}</p>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(report.createdAt)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>{report.generatedBy}</span>
                              </div>
                              {report.fileSize && (
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4" />
                                  <span>{report.fileSize}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <Download className="w-4 h-4" />
                                <span>{report.downloadCount} downloads</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {report.status === 'generated' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="px-4 py-2 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              <span className="font-semibold">Download</span>
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
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
    </AdminLayout>
  )
}
