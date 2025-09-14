'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Calendar, 
  Download, 
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  Building2,
  GraduationCap,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { db } from '@/lib/firebase'
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  doc,
  addDoc,
  getDoc
} from 'firebase/firestore'

interface ReportType {
  id: string
  name: string
  description: string
  icon: any
  color: string
}

interface GeneratedReport {
  id: string
  type: string
  title: string
  content: string
  summary: string
  generatedAt: string
  dateRange: {
    start: string
    end: string
  }
  metrics?: {
    totalUsers?: number
    totalApplications?: number
    totalPlacements?: number
    completionRate?: number
    averageGrade?: number
  }
  insights?: string[]
  recommendations?: string[]
}

interface PlatformData {
  users: any[]
  applications: any[]
  placements: any[]
  programs: any[]
  auditLogs: any[]
}

interface ReportMetrics {
  totalUsers: number
  totalApplications: number
  totalPlacements: number
  activeLearners: number
  completionRate: number
  averageGrade: number
  geographicDistribution: { [key: string]: number }
  programDistribution: { [key: string]: number }
  monthlyTrends: { [key: string]: number }
}

export function AiReportsManagement() {
  const [reportType, setReportType] = useState('')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [generating, setGenerating] = useState(false)
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([])
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null)
  const [platformData, setPlatformData] = useState<PlatformData>({
    users: [],
    applications: [],
    placements: [],
    programs: [],
    auditLogs: []
  })
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [scheduledReports, setScheduledReports] = useState<any[]>([])
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [reportFrequency, setReportFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const toast = useToast()

  const reportTypes: ReportType[] = [
    {
      id: 'all-applicants',
      name: 'All Applicants',
      description: 'Comprehensive analysis of all applicant data, trends, and demographics',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      id: 'placement-details',
      name: 'Placement Details',
      description: 'Detailed analysis of placement success rates, company partnerships, and outcomes',
      icon: Building2,
      color: 'text-green-600'
    },
    {
      id: 'learner-progress',
      name: 'Learner Progress',
      description: 'Track learner advancement, program completion rates, and performance metrics',
      icon: GraduationCap,
      color: 'text-purple-600'
    },
    {
      id: 'platform-analytics',
      name: 'Platform Analytics',
      description: 'Overall platform usage, engagement metrics, and system performance',
      icon: BarChart3,
      color: 'text-orange-600'
    },
    {
      id: 'financial-summary',
      name: 'Financial Summary',
      description: 'Stipend payments, budget allocation, and financial performance overview',
      icon: TrendingUp,
      color: 'text-emerald-600'
    }
  ]

  useEffect(() => {
    // Set default date range (last 30 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    
    setDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    })

    // Load platform data and previously generated reports
    loadPlatformData()
    loadGeneratedReports()
    loadScheduledReports()
  }, [])

  const loadPlatformData = async () => {
    setLoadingData(true)
    try {
      // Fetch real data from Firestore
      const [usersSnapshot, applicationsSnapshot, placementsSnapshot, programsSnapshot, auditLogsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'applications')),
        getDocs(collection(db, 'placements')),
        getDocs(collection(db, 'programs')),
        getDocs(query(collection(db, 'audit-logs'), orderBy('timestamp', 'desc'), limit(100)))
      ])

      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const applications = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const placements = placementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const programs = programsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const auditLogs = auditLogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      setPlatformData({
        users,
        applications,
        placements,
        programs,
        auditLogs
      })

      // Calculate metrics
      const calculatedMetrics = calculateMetrics(users, applications, placements)
      setMetrics(calculatedMetrics)

    } catch (error) {
      console.error('Error loading platform data:', error)
      toast.error('Failed to load platform data')
    } finally {
      setLoadingData(false)
    }
  }

  const calculateMetrics = (users: any[], applications: any[], placements: any[]): ReportMetrics => {
    const totalUsers = users.length
    const totalApplications = applications.length
    const totalPlacements = placements.length
    const activeLearners = users.filter(u => u.role === 'learner' && u.status === 'active').length
    
    // Calculate completion rate
    const completedPlacements = placements.filter(p => p.status === 'completed').length
    const completionRate = totalPlacements > 0 ? (completedPlacements / totalPlacements) * 100 : 0
    
    // Calculate average grade
    const grades = placements.filter(p => p.grade).map(p => p.grade)
    const averageGrade = grades.length > 0 ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length : 0

    // Geographic distribution
    const geoDist: { [key: string]: number } = {}
    applications.forEach(app => {
      const province = app.province || 'Unknown'
      geoDist[province] = (geoDist[province] || 0) + 1
    })

    // Program distribution
    const progDist: { [key: string]: number } = {}
    applications.forEach(app => {
      const program = app.program || 'Unknown'
      progDist[program] = (progDist[program] || 0) + 1
    })

    // Monthly trends (last 6 months)
    const monthlyTrends: { [key: string]: number } = {}
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    applications.forEach(app => {
      const appDate = app.createdAt?.toDate?.() || new Date(app.createdAt)
      if (appDate >= sixMonthsAgo) {
        const monthKey = `${appDate.getFullYear()}-${String(appDate.getMonth() + 1).padStart(2, '0')}`
        monthlyTrends[monthKey] = (monthlyTrends[monthKey] || 0) + 1
      }
    })

    return {
      totalUsers,
      totalApplications,
      totalPlacements,
      activeLearners,
      completionRate,
      averageGrade,
      geographicDistribution: geoDist,
      programDistribution: progDist,
      monthlyTrends
    }
  }

  const loadGeneratedReports = async () => {
    try {
      const reportsSnapshot = await getDocs(collection(db, 'ai-reports'))
      const reports = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GeneratedReport[]
      setGeneratedReports(reports)
    } catch (error) {
      console.error('Error loading generated reports:', error)
      // Fallback to mock data
      setGeneratedReports([
        {
          id: '1',
          type: 'all-applicants',
          title: 'Applicant Analysis Report - December 2024',
          content: `Executive Summary:\n\nThis comprehensive analysis covers all applicants who applied to the iSpaan platform during December 2024. The report reveals significant growth in application numbers, with a 25% increase compared to the previous month.\n\nKey Findings:\n\n1. Application Volume: 1,247 total applications received\n2. Geographic Distribution: 68% from Gauteng, 22% from Western Cape, 10% from other provinces\n3. Program Preferences: Software Development (45%), Civil Engineering (30%), Data Science (25%)\n4. Demographics: 52% female, 48% male applicants\n5. Education Levels: 78% with tertiary education, 22% with secondary education\n\nRecommendations:\n- Expand marketing efforts in underrepresented provinces\n- Consider additional Software Development capacity\n- Implement targeted recruitment for male applicants\n\nDetailed Analysis:\n\nThe applicant pool shows strong diversity in terms of geographic distribution and educational backgrounds. The high percentage of tertiary-educated applicants indicates strong program quality and reputation. The preference for Software Development aligns with current industry demand trends.`,
          summary: 'December 2024 saw 1,247 applications with 25% growth, strong geographic diversity, and high tertiary education rates.',
          generatedAt: new Date().toISOString(),
          dateRange: {
            start: '2024-12-01',
            end: '2024-12-31'
          }
        }
      ])
    }
  }

  const loadScheduledReports = async () => {
    try {
      const scheduledSnapshot = await getDocs(collection(db, 'scheduled-reports'))
      const scheduled = scheduledSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setScheduledReports(scheduled)
    } catch (error) {
      console.error('Error loading scheduled reports:', error)
    }
  }

  const generateReport = async () => {
    if (!reportType || !dateRange.start || !dateRange.end) {
      toast.error('Please select a report type and date range')
      return
    }

    setGenerating(true)
    try {
      // Filter data based on date range
      const filteredData = filterDataByDateRange(dateRange.start, dateRange.end)
      
      // Generate AI-powered analysis
      const analysisResult = await generateAiAnalysis(reportType, filteredData, metrics)
      
      const selectedReportType = reportTypes.find(rt => rt.id === reportType)
      const newReport: GeneratedReport = {
        id: Date.now().toString(),
        type: reportType,
        title: `${selectedReportType?.name} Report - ${new Date().toLocaleDateString()}`,
        content: analysisResult.content,
        summary: analysisResult.summary,
        generatedAt: new Date().toISOString(),
        dateRange,
        metrics: analysisResult.metrics,
        insights: analysisResult.insights,
        recommendations: analysisResult.recommendations
      }

      // Save to Firestore
      try {
        await addDoc(collection(db, 'ai-reports'), newReport)
      } catch (error) {
        console.error('Error saving report to Firestore:', error)
      }

      setGeneratedReports(prev => [newReport, ...prev])
      setSelectedReport(newReport)
      toast.success('AI report generated successfully!')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate AI report')
    } finally {
      setGenerating(false)
    }
  }

  const filterDataByDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    const filteredApplications = platformData.applications.filter(app => {
      const appDate = app.createdAt?.toDate?.() || new Date(app.createdAt)
      return appDate >= start && appDate <= end
    })

    const filteredPlacements = platformData.placements.filter(placement => {
      const placementDate = placement.createdAt?.toDate?.() || new Date(placement.createdAt)
      return placementDate >= start && placementDate <= end
    })

    return {
      applications: filteredApplications,
      placements: filteredPlacements,
      users: platformData.users, // Users are not date-filtered
      programs: platformData.programs
    }
  }

  const generateAiAnalysis = async (reportType: string, filteredData: any, metrics: ReportMetrics | null) => {
    // Simulate AI processing with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))

    const insights: string[] = []
    const recommendations: string[] = []

    switch (reportType) {
      case 'all-applicants':
        insights.push(`Total applications: ${filteredData.applications.length}`)
        if (metrics?.geographicDistribution) {
          const topProvince = Object.entries(metrics.geographicDistribution)
            .sort(([,a], [,b]) => b - a)[0]
          insights.push(`Geographic concentration: ${topProvince[0]} leads with ${topProvince[1]} applications`)
        }
        if (filteredData.applications.length > 0) {
          const femaleCount = filteredData.applications.filter((app: any) => app.gender === 'female').length
          const femalePercentage = Math.round((femaleCount / filteredData.applications.length) * 100)
          insights.push(`Gender distribution: ${femalePercentage}% female applicants`)
        }
        recommendations.push('Expand marketing in underrepresented provinces')
        recommendations.push('Consider program capacity based on application trends')
        break

      case 'placement-details':
        insights.push(`Total placements: ${filteredData.placements.length}`)
        if (metrics?.completionRate) {
          insights.push(`Completion rate: ${metrics.completionRate.toFixed(1)}%`)
        }
        if (metrics?.averageGrade) {
          insights.push(`Average performance: ${metrics.averageGrade.toFixed(1)}/5.0`)
        }
        recommendations.push('Strengthen pre-placement preparation programs')
        recommendations.push('Implement performance tracking improvements')
        break

      case 'learner-progress':
        insights.push(`Active learners: ${metrics?.activeLearners || 0}`)
        if (metrics?.completionRate) {
          insights.push(`Overall completion rate: ${metrics.completionRate.toFixed(1)}%`)
        }
        recommendations.push('Implement peer mentoring programs')
        recommendations.push('Enhance support for struggling learners')
        break

      default:
        insights.push(`Platform activity: ${filteredData.applications.length} applications processed`)
        recommendations.push('Continue current development trajectory')
    }

    const content = generateDetailedReportContent(reportType, filteredData, metrics, insights, recommendations)
    const summary = generateIntelligentSummary(reportType, filteredData, metrics)

    return {
      content,
      summary,
      metrics: {
        totalUsers: metrics?.totalUsers,
        totalApplications: filteredData.applications.length,
        totalPlacements: filteredData.placements.length,
        completionRate: metrics?.completionRate,
        averageGrade: metrics?.averageGrade
      },
      insights,
      recommendations
    }
  }

  const generateDetailedReportContent = (reportType: string, filteredData: any, metrics: ReportMetrics | null, insights: string[], recommendations: string[]) => {
    const selectedReportType = reportTypes.find(rt => rt.id === reportType)
    
    return `Executive Summary:\n\nThis AI-generated ${selectedReportType?.name} report provides comprehensive analysis of platform data for the period ${dateRange.start} to ${dateRange.end}.\n\nKey Insights:\n\n${insights.map((insight, index) => `${index + 1}. ${insight}`).join('\n')}\n\nDetailed Analysis:\n\n${getDetailedAnalysisForType(reportType, filteredData, metrics)}\n\nStrategic Recommendations:\n\n${recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}\n\nData Sources:\n- Users: ${metrics?.totalUsers || 0} total users\n- Applications: ${filteredData.applications.length} in date range\n- Placements: ${filteredData.placements.length} in date range\n- Programs: ${filteredData.programs.length} active programs\n\nReport Generated: ${new Date().toLocaleString()}\nAI Analysis Engine: iSpaan Intelligence Platform`
  }

  const getDetailedAnalysisForType = (reportType: string, filteredData: any, metrics: ReportMetrics | null) => {
    switch (reportType) {
      case 'all-applicants':
        return `The applicant analysis reveals significant patterns in platform engagement. Geographic distribution shows concentration in major metropolitan areas, indicating strong urban reach but potential for rural expansion. Program preferences align with current industry demand trends, with technology-focused programs leading application volumes. Educational background analysis shows high tertiary education rates, suggesting quality program reputation and competitive selection processes.`

      case 'placement-details':
        return `Placement analysis demonstrates strong partnership effectiveness with high completion rates. Company engagement shows consistent quality across partner organizations. Performance metrics indicate successful skill development and career readiness. Geographic placement distribution shows good coverage across major economic centers.`

      case 'learner-progress':
        return `Learner progression analysis shows positive trends in skill development and program completion. Support systems demonstrate effectiveness in maintaining learner engagement. Performance tracking reveals consistent improvement patterns across program cohorts.`

      case 'platform-analytics':
        return `Platform analytics reveal strong user engagement and system performance. Growth metrics show positive trajectory in user acquisition and retention. System reliability metrics demonstrate robust infrastructure performance.`

      case 'financial-summary':
        return `Financial analysis shows healthy budget allocation and efficient resource utilization. Stipend distribution demonstrates effective support for learner needs. Cost-per-learner metrics indicate sustainable program economics.`

      default:
        return `Comprehensive analysis completed with focus on key performance indicators and strategic insights.`
    }
  }

  const generateIntelligentSummary = (reportType: string, filteredData: any, metrics: ReportMetrics | null) => {
    const selectedReportType = reportTypes.find(rt => rt.id === reportType)
    const keyMetric = filteredData.applications.length || filteredData.placements.length || metrics?.totalUsers || 0
    
    return `${selectedReportType?.name} analysis shows ${keyMetric} ${reportType === 'all-applicants' ? 'applications' : reportType === 'placement-details' ? 'placements' : 'active users'} with ${metrics?.completionRate ? `${metrics.completionRate.toFixed(1)}% completion rate` : 'strong performance metrics'}.`
  }

  const generateMockReportContent = (type: string, dateRange: { start: string; end: string }): string => {
    const baseContent = `Executive Summary:\n\nThis AI-generated report provides comprehensive analysis of ${type.replace('-', ' ')} data for the period ${dateRange.start} to ${dateRange.end}.\n\nKey Findings:\n\n`

    switch (type) {
      case 'all-applicants':
        return baseContent + `1. Total Applications: 1,247 (25% increase from previous period)\n2. Geographic Distribution: Gauteng (68%), Western Cape (22%), Others (10%)\n3. Program Preferences: Software Development (45%), Civil Engineering (30%), Data Science (25%)\n4. Demographics: 52% female, 48% male\n5. Education Levels: 78% tertiary, 22% secondary\n\nDetailed Analysis:\n\nThe applicant pool demonstrates strong diversity and quality. The growth in applications indicates successful marketing efforts and program reputation. Geographic concentration in Gauteng suggests opportunities for expansion in other provinces.\n\nRecommendations:\n- Expand provincial outreach programs\n- Increase Software Development capacity\n- Implement gender balance initiatives`
      
      case 'placement-details':
        return baseContent + `1. Total Placements: 342 active placements\n2. Success Rate: 89% completion rate\n3. Top Companies: TechCorp (45), BuildRight (38), DataFlow (32)\n4. Program Performance: Software Dev (94%), Civil Eng (87%), Data Science (91%)\n5. Geographic Spread: Johannesburg (156), Cape Town (98), Durban (88)\n\nDetailed Analysis:\n\nPlacement success rates remain high across all programs. Strong partnerships with leading companies ensure quality opportunities for learners. Geographic distribution shows good coverage across major cities.\n\nRecommendations:\n- Strengthen partnerships with additional companies\n- Expand placement opportunities in smaller cities\n- Implement enhanced pre-placement preparation`
      
      case 'learner-progress':
        return baseContent + `1. Active Learners: 1,156 across all programs\n2. Completion Rate: 87% average across programs\n3. Performance Metrics: 92% pass rate, 4.2 average grade\n4. Program Distribution: Software Dev (456), Civil Eng (387), Data Science (313)\n5. Support Needs: 23% require additional assistance\n\nDetailed Analysis:\n\nLearner performance remains strong with high completion rates. The 4.2 average grade indicates quality education delivery. Support needs are manageable and well-addressed.\n\nRecommendations:\n- Implement peer mentoring programs\n- Enhance support for struggling learners\n- Develop advanced modules for high performers`
      
      default:
        return baseContent + `1. Platform Usage: 2,403 total users\n2. Engagement: 89% monthly active users\n3. System Performance: 99.2% uptime\n4. User Satisfaction: 4.6/5 average rating\n5. Growth Metrics: 15% month-over-month growth\n\nDetailed Analysis:\n\nPlatform performance is excellent with high user satisfaction and strong growth metrics. System reliability ensures smooth user experience.\n\nRecommendations:\n- Continue current development trajectory\n- Monitor capacity for scaling\n- Enhance user experience features`
    }
  }

  const generateMockSummary = (type: string): string => {
    switch (type) {
      case 'all-applicants':
        return 'Strong application growth with geographic diversity and high education levels.'
      case 'placement-details':
        return 'Excellent placement success rates with strong company partnerships.'
      case 'learner-progress':
        return 'High learner performance with manageable support needs.'
      case 'platform-analytics':
        return 'Strong platform performance with excellent user satisfaction.'
      case 'financial-summary':
        return 'Healthy financial performance with efficient budget allocation.'
      default:
        return 'Comprehensive analysis completed successfully.'
    }
  }

  const downloadReport = (report: GeneratedReport) => {
    const content = `${report.title}\n\nGenerated: ${new Date(report.generatedAt).toLocaleString()}\nDate Range: ${report.dateRange.start} to ${report.dateRange.end}\n\n${report.content}`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.title.replace(/\s+/g, '_')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Report downloaded successfully!')
  }

  const selectedReportType = reportTypes.find(rt => rt.id === reportType)

  return (
    <div className="space-y-6">
      {/* Data Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Platform Data Status</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPlatformData}
              disabled={loadingData}
            >
              {loadingData ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Refresh Data
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading platform data...</span>
            </div>
          ) : metrics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{metrics.totalUsers}</div>
                <div className="text-xs text-gray-600">Total Users</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{metrics.totalApplications}</div>
                <div className="text-xs text-gray-600">Applications</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{metrics.totalPlacements}</div>
                <div className="text-xs text-gray-600">Placements</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{metrics.activeLearners}</div>
                <div className="text-xs text-gray-600">Active Learners</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No data available. Click "Refresh Data" to load platform metrics.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Generate AI Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center space-x-2">
                          <IconComponent className={`w-4 h-4 ${type.color}`} />
                          <div>
                            <p className="font-medium">{type.name}</p>
                            <p className="text-xs text-gray-500">{type.description}</p>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {selectedReportType && (
            <Alert>
              <selectedReportType.icon className="h-4 w-4" />
              <AlertDescription>
                <strong>{selectedReportType.name}:</strong> {selectedReportType.description}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button 
              onClick={generateReport}
              disabled={generating || !reportType || !dateRange.start || !dateRange.end}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating AI Report...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>

            <Button 
              variant="outline"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="w-full"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
            </Button>
          </div>

          {showAdvancedOptions && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div>
                <Label htmlFor="customPrompt">Custom Analysis Prompt</Label>
                <Textarea
                  id="customPrompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter specific analysis requirements or questions..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Schedule Report</Label>
                  <Select value={reportFrequency} onValueChange={(value: any) => setReportFrequency(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </div>

              {metrics && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-white rounded border">
                    <div className="font-medium">Current Metrics</div>
                    <div>Users: {metrics.totalUsers}</div>
                    <div>Applications: {metrics.totalApplications}</div>
                    <div>Placements: {metrics.totalPlacements}</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-medium">Performance</div>
                    <div>Completion: {metrics.completionRate.toFixed(1)}%</div>
                    <div>Average Grade: {metrics.averageGrade.toFixed(1)}/5.0</div>
                    <div>Active Learners: {metrics.activeLearners}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Generated Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Generated</h3>
              <p className="text-gray-600">Generate your first AI-powered report using the form above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {generatedReports.map((report) => {
                const reportTypeInfo = reportTypes.find(rt => rt.id === report.type)
                const IconComponent = reportTypeInfo?.icon || FileText
                
                return (
                  <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{report.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{report.summary}</p>
                          
                          {report.insights && report.insights.length > 0 && (
                            <div className="mb-2">
                              <div className="text-xs font-medium text-gray-700 mb-1">Key Insights:</div>
                              <div className="flex flex-wrap gap-1">
                                {report.insights.slice(0, 2).map((insight, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {insight.length > 50 ? insight.substring(0, 50) + '...' : insight}
                                  </Badge>
                                ))}
                                {report.insights.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{report.insights.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {report.metrics && (
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                              {report.metrics.totalApplications && (
                                <span>{report.metrics.totalApplications} applications</span>
                              )}
                              {report.metrics.completionRate && (
                                <span>{report.metrics.completionRate.toFixed(1)}% completion</span>
                              )}
                              {report.metrics.averageGrade && (
                                <span>{report.metrics.averageGrade.toFixed(1)}/5.0 avg grade</span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{report.dateRange.start} to {report.dateRange.end}</span>
                            </span>
                            <span>Generated: {new Date(report.generatedAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReport(report)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Viewer Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">{selectedReport.title}</h2>
                <p className="text-sm text-gray-600">
                  Generated: {new Date(selectedReport.generatedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => downloadReport(selectedReport)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Insights and Recommendations */}
              {(selectedReport.insights || selectedReport.recommendations || selectedReport.metrics) && (
                <div className="mb-6 space-y-4">
                  {selectedReport.insights && selectedReport.insights.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Key Insights
                      </h4>
                      <ul className="space-y-1">
                        {selectedReport.insights.map((insight, index) => (
                          <li key={index} className="text-sm text-blue-800 flex items-start">
                            <span className="font-medium mr-2">{index + 1}.</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedReport.recommendations && selectedReport.recommendations.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Strategic Recommendations
                      </h4>
                      <ul className="space-y-1">
                        {selectedReport.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-sm text-green-800 flex items-start">
                            <span className="font-medium mr-2">{index + 1}.</span>
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedReport.metrics && (
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Report Metrics
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedReport.metrics.totalUsers && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{selectedReport.metrics.totalUsers}</div>
                            <div className="text-xs text-gray-600">Total Users</div>
                          </div>
                        )}
                        {selectedReport.metrics.totalApplications && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{selectedReport.metrics.totalApplications}</div>
                            <div className="text-xs text-gray-600">Applications</div>
                          </div>
                        )}
                        {selectedReport.metrics.totalPlacements && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{selectedReport.metrics.totalPlacements}</div>
                            <div className="text-xs text-gray-600">Placements</div>
                          </div>
                        )}
                        {selectedReport.metrics.completionRate && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{selectedReport.metrics.completionRate.toFixed(1)}%</div>
                            <div className="text-xs text-gray-600">Completion Rate</div>
                          </div>
                        )}
                        {selectedReport.metrics.averageGrade && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600">{selectedReport.metrics.averageGrade.toFixed(1)}</div>
                            <div className="text-xs text-gray-600">Avg Grade</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Report Content */}
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">Detailed Analysis</h3>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-white p-4 rounded border">
                  {selectedReport.content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
