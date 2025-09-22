'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WelcomeCard } from '@/components/ui/welcome-card'
import { PageLoader } from '@/components/ui/loading'
import { useAuth } from '@/hooks/useAuth'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  UserPlus, 
  Activity, 
  Eye,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award
} from 'lucide-react'
import { getAnalyticsData, AnalyticsData } from '@/lib/analytics-service'

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
    case 'warning':
      return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
    case 'info':
      return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
    default:
      return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
  }
}

export default function SuperAdminAnalyticsPage() {
  const { user, userData } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  })

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getAnalyticsData(dateRange)
      setAnalytics(data)
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const handleRefresh = () => {
    loadAnalytics()
  }

  const handleExport = () => {
    if (!analytics) return
    
    const csvContent = [
      ['Metric', 'Value'].join(','),
      ['Total Users', analytics.overview.totalUsers].join(','),
      ['New Users', analytics.overview.newUsers].join(','),
      ['Active Users', analytics.overview.activeUsers].join(','),
      ['Total Revenue', analytics.overview.totalRevenue].join(','),
      ['Conversion Rate', analytics.overview.conversionRate + '%'].join(','),
      ['Bounce Rate', analytics.overview.bounceRate + '%'].join(',')
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return <PageLoader message="Loading analytics data..." />
  }

  if (error) {
    return (
      <AdminLayout userRole="super-admin">
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <div className="text-red-500 text-xl">Error: {error}</div>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </AdminLayout>
    )
  }

  if (!analytics) {
    return (
      <AdminLayout userRole="super-admin">
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <div className="text-gray-500 text-xl">No analytics data available</div>
          <Button onClick={handleRefresh}>Refresh</Button>
        </div>
      </AdminLayout>
    )
  }
  
  return (
    <AdminLayout userRole="super-admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-end">
          <div className="flex space-x-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Last 30 days
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button className="bg-coral hover:bg-coral/90" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Welcome Card */}
        <WelcomeCard 
          userName={user?.displayName || userData?.firstName || "Analytics Admin"} 
          userRole="super-admin" 
          className="mb-6"
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card className="shadow-lg hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-coral rounded-xl shadow-coral">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark-blue">{analytics.overview.totalUsers.toLocaleString()}</p>
                  <p className="text-muted-foreground">Total Users</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">+12.5%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark-blue">{analytics.overview.newUsers}</p>
                  <p className="text-muted-foreground">New Users</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">+8.2%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gold rounded-xl shadow-gold">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark-blue">{analytics.overview.activeUsers}</p>
                  <p className="text-muted-foreground">Active Users</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">+15.3%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-dark-blue rounded-xl shadow-dark-blue">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark-blue">${analytics.overview.totalRevenue.toLocaleString()}</p>
                  <p className="text-muted-foreground">Revenue</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">+22.1%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark-blue">{analytics.overview.conversionRate}%</p>
                  <p className="text-muted-foreground">Conversion</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">+3.2%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-dark-blue">{analytics.overview.bounceRate}%</p>
                  <p className="text-muted-foreground">Bounce Rate</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-500">-2.1%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-coral" />
                <span>User Growth</span>
              </CardTitle>
              <CardDescription>
                Monthly user registration and revenue trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization would go here</p>
                  <p className="text-sm text-gray-400">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Role Distribution */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-coral" />
                <span>User Distribution</span>
              </CardTitle>
              <CardDescription>
                Breakdown of users by role and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.userRoles.map((role, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${role.color}`}></div>
                    <span className="font-medium text-dark-blue">{role.role}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-dark-blue">{role.count}</p>
                    <p className="text-sm text-muted-foreground">{role.percentage}%</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Top Pages and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-coral" />
                <span>Top Pages</span>
              </CardTitle>
              <CardDescription>
                Most visited pages and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium text-dark-blue">{page.page}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {page.views.toLocaleString()} views
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {page.unique.toLocaleString()} unique
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={page.bounce > 30 ? "destructive" : "default"}>
                        {page.bounce}% bounce
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-coral" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Latest platform activities and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-dark-blue">{activity.action}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-muted-foreground">{activity.user}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-coral" />
              <span>Performance Insights</span>
            </CardTitle>
            <CardDescription>
              Key insights and recommendations for platform optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">Positive Trends</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• User growth up 12.5% this month</li>
                  <li>• Conversion rate improved by 3.2%</li>
                  <li>• Bounce rate decreased by 2.1%</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">Areas for Improvement</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Settings page has high bounce rate</li>
                  <li>• Consider mobile optimization</li>
                  <li>• Review user onboarding flow</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Recommendations</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Implement A/B testing</li>
                  <li>• Add user feedback system</li>
                  <li>• Optimize page load times</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}