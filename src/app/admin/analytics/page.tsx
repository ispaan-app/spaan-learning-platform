'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  GraduationCap, 
  Building2, 
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'

interface AnalyticsData {
  totalUsers: number
  totalLearners: number
  totalApplicants: number
  totalPlacements: number
  activePlacements: number
  completionRate: number
  monthlyGrowth: number
  dropoutRate: number
  averageProgress: number
  satisfactionScore: number
  newThisMonth: number
  highRiskLearners: number
}

interface MonthlyData {
  month: string
  users: number
  learners: number
  applications: number
  placements: number
  completions: number
  dropouts: number
  revenue?: number
}

interface ProgramData {
  program: string
  count: number
  completionRate: number
  averageProgress: number
  satisfaction: number
  dropoutRate: number
}

interface StatusData {
  status: string
  count: number
  percentage: number
}

interface RiskAnalysis {
  highRisk: number
  mediumRisk: number
  lowRisk: number
  totalAnalyzed: number
  riskTrend: 'increasing' | 'decreasing' | 'stable'
}

interface EngagementMetrics {
  averageLoginFrequency: number
  averageSessionDuration: number
  assignmentCompletionRate: number
  attendanceRate: number
  participationScore: number
}

interface PlacementPerformance {
  company: string
  learners: number
  satisfaction: number
  completionRate: number
  averageHours: number
  successRate: number
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [programData, setProgramData] = useState<ProgramData[]>([])
  const [statusData, setStatusData] = useState<StatusData[]>([])
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null)
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null)
  const [placementPerformance, setPlacementPerformance] = useState<PlacementPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('6months')
  const [selectedMetric, setSelectedMetric] = useState('overview')

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Load basic analytics
      const [usersSnapshot, learnersSnapshot, applicantsSnapshot, placementsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'learner'))),
        getDocs(query(collection(db, 'users'), where('role', '==', 'applicant'))),
        getDocs(collection(db, 'placements'))
      ])

      const totalUsers = usersSnapshot.size
      const totalLearners = learnersSnapshot.size
      const totalApplicants = applicantsSnapshot.size
      const totalPlacements = placementsSnapshot.size
      const activePlacements = placementsSnapshot.docs.filter(doc => doc.data().status === 'active').length
      
      // Calculate enhanced analytics
      const completionRate = totalPlacements > 0 ? (activePlacements / totalPlacements) * 100 : 0
      const monthlyGrowth = 12.5 // Mock growth percentage
      const dropoutRate = 8.2 // Mock dropout rate
      const averageProgress = 68.5 // Mock average progress
      const satisfactionScore = 4.3 // Mock satisfaction score
      const newThisMonth = Math.floor(totalLearners * 0.15) // Mock new learners this month
      const highRiskLearners = Math.floor(totalLearners * 0.12) // Mock high risk learners

      setAnalyticsData({
        totalUsers,
        totalLearners,
        totalApplicants,
        totalPlacements,
        activePlacements,
        completionRate,
        monthlyGrowth,
        dropoutRate,
        averageProgress,
        satisfactionScore,
        newThisMonth,
        highRiskLearners
      })

      // Load risk analysis data
      const riskAnalysisData: RiskAnalysis = {
        highRisk: highRiskLearners,
        mediumRisk: Math.floor(totalLearners * 0.25),
        lowRisk: totalLearners - highRiskLearners - Math.floor(totalLearners * 0.25),
        totalAnalyzed: totalLearners,
        riskTrend: 'stable'
      }
      setRiskAnalysis(riskAnalysisData)

      // Load engagement metrics
      const engagementData: EngagementMetrics = {
        averageLoginFrequency: 4.2,
        averageSessionDuration: 45,
        assignmentCompletionRate: 78.5,
        attendanceRate: 85.2,
        participationScore: 7.8
      }
      setEngagementMetrics(engagementData)

      // Load placement performance data
      const placementPerformanceData: PlacementPerformance[] = [
        { company: 'TechCorp', learners: 12, satisfaction: 4.5, completionRate: 95, averageHours: 420, successRate: 92 },
        { company: 'InnovateLabs', learners: 8, satisfaction: 4.2, completionRate: 88, averageHours: 380, successRate: 85 },
        { company: 'DataFlow', learners: 15, satisfaction: 4.7, completionRate: 97, averageHours: 450, successRate: 94 },
        { company: 'CloudTech', learners: 6, satisfaction: 4.0, completionRate: 83, averageHours: 350, successRate: 80 }
      ]
      setPlacementPerformance(placementPerformanceData)

      // Load monthly data (mock data for demonstration)
      const mockMonthlyData = generateMockMonthlyData()
      setMonthlyData(mockMonthlyData)

      // Load program distribution data
      const programCounts: { [key: string]: number } = {}
      learnersSnapshot.docs.forEach(doc => {
        const program = doc.data().program || 'unknown'
        programCounts[program] = (programCounts[program] || 0) + 1
      })

      const programData = Object.entries(programCounts).map(([program, count]) => ({
        program: program.charAt(0).toUpperCase() + program.slice(1).replace('-', ' '),
        count,
        completionRate: Math.random() * 100 // Mock completion rate
      }))

      setProgramData(programData.map(item => ({
        ...item,
        averageProgress: Math.floor(Math.random() * 40) + 60, // 60-100%
        satisfaction: Math.floor(Math.random() * 20) + 80, // 80-100%
        dropoutRate: Math.floor(Math.random() * 10) + 5 // 5-15%
      })))

      // Load status distribution data
      const statusCounts: { [key: string]: number } = {}
      applicantsSnapshot.docs.forEach(doc => {
        const status = doc.data().status || 'unknown'
        statusCounts[status] = (statusCounts[status] || 0) + 1
      })

      const totalApplications = applicantsSnapshot.size
      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
        count,
        percentage: totalApplications > 0 ? (count / totalApplications) * 100 : 0
      }))

      setStatusData(statusData)

    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockMonthlyData = (): MonthlyData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map((month, index) => ({
      month,
      users: Math.floor(Math.random() * 50) + 20,
      learners: Math.floor(Math.random() * 30) + 10,
      applications: Math.floor(Math.random() * 40) + 15,
      placements: Math.floor(Math.random() * 20) + 5,
      completions: Math.floor(Math.random() * 15) + 5,
      dropouts: Math.floor(Math.random() * 8) + 2
    }))
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600">
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <AdminLayout userRole="admin">
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading analytics...</p>
          </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive insights into platform performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
                <SelectItem value="1year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadAnalyticsData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        {analyticsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.totalUsers}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+{analyticsData.monthlyGrowth}%</span>
                    </div>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Learners</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.totalLearners}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+8.2%</span>
                    </div>
                  </div>
                  <GraduationCap className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Placements</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.activePlacements}</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+15.3%</span>
                    </div>
                  </div>
                  <Building2 className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.completionRate.toFixed(1)}%</p>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+2.1%</span>
                    </div>
                  </div>
                  <Activity className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Monthly Growth</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="learners" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="applications" stackId="1" stroke="#ffc658" fill="#ffc658" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Program Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChartIcon className="w-5 h-5" />
                <span>Program Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={programData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {programData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900">Application Processing Time</p>
                    <p className="text-sm text-blue-700">Average time to process applications</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-900">2.3</p>
                    <p className="text-sm text-blue-700">days</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-900">Placement Success Rate</p>
                    <p className="text-sm text-green-700">Successful placement matches</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-900">94.2%</p>
                    <p className="text-sm text-green-700">success rate</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium text-purple-900">User Satisfaction</p>
                    <p className="text-sm text-purple-700">Average user rating</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-900">4.7</p>
                    <p className="text-sm text-purple-700">out of 5</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-orange-900">System Uptime</p>
                    <p className="text-sm text-orange-700">Platform availability</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-900">99.9%</p>
                    <p className="text-sm text-orange-700">uptime</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
