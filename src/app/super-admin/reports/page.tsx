'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { WelcomeCard } from '@/components/ui/welcome-card'
import { PageLoader } from '@/components/ui/loading'
import { useAuth } from '@/hooks/useAuth'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  Search,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Clock,
  Eye,
  RefreshCw,
  Plus,
  MoreHorizontal
} from 'lucide-react'
import { getReports, generateReport, downloadReport, Report } from '@/lib/reports-service'

const reportTypes = [
  { value: 'all', label: 'All Reports', icon: FileText },
  { value: 'analytics', label: 'Analytics', icon: BarChart3 },
  { value: 'financial', label: 'Financial', icon: TrendingUp },
  { value: 'technical', label: 'Technical', icon: Activity },
  { value: 'security', label: 'Security', icon: Users }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100'
    case 'running':
      return 'text-blue-600 bg-blue-100'
    case 'failed':
      return 'text-red-600 bg-red-100'
    case 'pending':
      return 'text-yellow-600 bg-yellow-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'analytics':
      return <BarChart3 className="h-4 w-4" />
    case 'financial':
      return <TrendingUp className="h-4 w-4" />
    case 'technical':
      return <Activity className="h-4 w-4" />
    case 'security':
      return <Users className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

export default function SuperAdminReportsPage() {
  const { user, userData } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [generating, setGenerating] = useState<string | null>(null)

  const loadReports = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getReports()
      setReports(data)
    } catch (err) {
      console.error('Error loading reports:', err)
      setError('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const handleGenerateReport = async (reportType: string) => {
    if (!user?.uid) return
    
    try {
      setGenerating(reportType)
      const result = await generateReport(reportType, {}, user.uid)
      
      if (result.success) {
        // Refresh reports list
        await loadReports()
      } else {
        setError(result.error || 'Failed to generate report')
      }
    } catch (err) {
      console.error('Error generating report:', err)
      setError('Failed to generate report')
    } finally {
      setGenerating(null)
    }
  }

  const handleDownloadReport = async (reportId: string) => {
    try {
      const result = await downloadReport(reportId)
      
      if (result.success && result.url) {
        // In a real implementation, this would trigger the download
        window.open(result.url, '_blank')
      } else {
        setError(result.error || 'Failed to download report')
      }
    } catch (err) {
      console.error('Error downloading report:', err)
      setError('Failed to download report')
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
                          report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    const matchesType = typeFilter === 'all' || report.type.toLowerCase() === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  if (loading) {
    return <PageLoader message="Loading reports..." />
  }
  
  return (
    <AdminLayout userRole="super-admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark-blue">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Generate and manage comprehensive platform reports
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Report
            </Button>
            <Button className="bg-coral hover:bg-coral/90">
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </div>
        </div>

        {/* Welcome Card */}
        <WelcomeCard 
          userName={user?.displayName || userData?.firstName || "Reports Admin"} 
          userRole="super-admin" 
          className="mb-6"
        />

        {/* Report Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-coral rounded-xl shadow-coral">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark-blue">24</p>
                  <p className="text-muted-foreground">Total Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark-blue">156</p>
                  <p className="text-muted-foreground">Downloads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gold rounded-xl shadow-gold">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark-blue">3</p>
                  <p className="text-muted-foreground">Running</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-dark-blue rounded-xl shadow-dark-blue">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark-blue">8</p>
                  <p className="text-muted-foreground">Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search reports by name or description..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent">
                  <option>All Types</option>
                  <option>Analytics</option>
                  <option>Financial</option>
                  <option>Technical</option>
                  <option>Security</option>
                </select>
                <select className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent">
                  <option>All Status</option>
                  <option>Completed</option>
                  <option>Running</option>
                  <option>Failed</option>
                  <option>Pending</option>
                </select>
                <Input 
                  type="date" 
                  className="w-40"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Types */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {reportTypes.map((type) => {
            const IconComponent = type.icon
            return (
              <Card key={type.value} className="shadow-lg hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-4 text-center">
                  <IconComponent className="h-8 w-8 text-coral mx-auto mb-2" />
                  <h3 className="font-medium text-dark-blue">{type.label}</h3>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Reports List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-coral" />
              <span>Recent Reports</span>
            </CardTitle>
            <CardDescription>
              View and manage all generated reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getTypeIcon(report.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-dark-blue">{report.name}</h3>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>Created: {report.created}</span>
                        <span>Size: {report.size}</span>
                        <span>Downloads: {report.downloads}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadReport(report.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-coral" />
                <span>Analytics Reports</span>
              </CardTitle>
              <CardDescription>
                Generate user and platform analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleGenerateReport('user_analytics')}
                  disabled={generating === 'user_analytics'}
                >
                  {generating === 'user_analytics' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'User Growth Report'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleGenerateReport('user_engagement')}
                  disabled={generating === 'user_engagement'}
                >
                  {generating === 'user_engagement' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Engagement Analysis'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleGenerateReport('system_performance')}
                  disabled={generating === 'system_performance'}
                >
                  {generating === 'system_performance' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Page Performance'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-coral" />
                <span>Financial Reports</span>
              </CardTitle>
              <CardDescription>
                Revenue and financial metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Revenue Summary
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Payment Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Subscription Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-coral" />
                <span>System Reports</span>
              </CardTitle>
              <CardDescription>
                Technical and security reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  System Health
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Security Audit
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Error Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Reports */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-coral" />
              <span>Scheduled Reports</span>
            </CardTitle>
            <CardDescription>
              Automatically generated reports and their schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-dark-blue">Weekly Analytics Report</h3>
                    <p className="text-sm text-muted-foreground">Every Monday at 9:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="text-green-600 bg-green-100">Active</Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-dark-blue">Monthly Revenue Report</h3>
                    <p className="text-sm text-muted-foreground">First day of each month at 8:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="text-green-600 bg-green-100">Active</Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}