'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Zap, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Download,
  Trash2
} from 'lucide-react'

interface PerformanceStats {
  totalRequests: number
  averageResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  errorRate: number
  throughput: number
  memoryUsage: number
  cpuUsage: number
}

interface WebVitals {
  FCP: number
  LCP: number
  FID: number
  CLS: number
  TTFB: number
}

interface ApiStats {
  [endpoint: string]: {
    count: number
    averageTime: number
    minTime: number
    maxTime: number
    errorRate: number
  }
}

export function PerformanceDashboard() {
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [webVitals, setWebVitals] = useState<WebVitals[]>([])
  const [apiStats, setApiStats] = useState<ApiStats>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchPerformanceData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchPerformanceData, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      
      // Fetch performance stats
      const statsResponse = await fetch('/api/performance/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch Web Vitals
      const vitalsResponse = await fetch('/api/performance/web-vitals')
      if (vitalsResponse.ok) {
        const vitalsData = await vitalsResponse.json()
        setWebVitals(vitalsData)
      }

      // Fetch API stats
      const apiResponse = await fetch('/api/performance/api-stats')
      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        setApiStats(apiData)
      }

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performance data')
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600'
    if (value <= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <Badge className="bg-green-100 text-green-800">Good</Badge>
    if (value <= thresholds.warning) return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const exportData = () => {
    const data = {
      stats,
      webVitals,
      apiStats,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearData = async () => {
    try {
      await fetch('/api/performance/clear', { method: 'POST' })
      await fetchPerformanceData()
    } catch (err) {
      setError('Failed to clear performance data')
    }
  }

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
          <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor application performance and optimize user experience
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          
          <Button onClick={fetchPerformanceData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button onClick={clearData} variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All time requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPerformanceColor(stats.averageResponseTime, { good: 200, warning: 500 })}`}>
                {formatTime(stats.averageResponseTime)}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                {getPerformanceBadge(stats.averageResponseTime, { good: 200, warning: 500 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPerformanceColor(stats.errorRate * 100, { good: 1, warning: 5 })}`}>
                {(stats.errorRate * 100).toFixed(2)}%
              </div>
              <div className="flex items-center space-x-2 mt-1">
                {getPerformanceBadge(stats.errorRate * 100, { good: 1, warning: 5 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(stats.memoryUsage)}</div>
              <p className="text-xs text-muted-foreground">
                Current usage
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Web Vitals */}
      {webVitals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Web Vitals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500">FCP</div>
                <div className={`text-lg font-bold ${getPerformanceColor(webVitals[0]?.FCP || 0, { good: 1800, warning: 3000 })}`}>
                  {formatTime(webVitals[0]?.FCP || 0)}
                </div>
                <div className="text-xs text-gray-500">First Contentful Paint</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500">LCP</div>
                <div className={`text-lg font-bold ${getPerformanceColor(webVitals[0]?.LCP || 0, { good: 2500, warning: 4000 })}`}>
                  {formatTime(webVitals[0]?.LCP || 0)}
                </div>
                <div className="text-xs text-gray-500">Largest Contentful Paint</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500">FID</div>
                <div className={`text-lg font-bold ${getPerformanceColor(webVitals[0]?.FID || 0, { good: 100, warning: 300 })}`}>
                  {formatTime(webVitals[0]?.FID || 0)}
                </div>
                <div className="text-xs text-gray-500">First Input Delay</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500">CLS</div>
                <div className={`text-lg font-bold ${getPerformanceColor(webVitals[0]?.CLS || 0, { good: 0.1, warning: 0.25 })}`}>
                  {(webVitals[0]?.CLS || 0).toFixed(3)}
                </div>
                <div className="text-xs text-gray-500">Cumulative Layout Shift</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500">TTFB</div>
                <div className={`text-lg font-bold ${getPerformanceColor(webVitals[0]?.TTFB || 0, { good: 800, warning: 1800 })}`}>
                  {formatTime(webVitals[0]?.TTFB || 0)}
                </div>
                <div className="text-xs text-gray-500">Time to First Byte</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Performance */}
      {Object.keys(apiStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>API Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(apiStats).map(([endpoint, stats]) => (
                <div key={endpoint} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{endpoint}</div>
                    <div className="text-sm text-gray-500">
                      {stats.count} requests • {formatTime(stats.averageTime)} avg
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatTime(stats.minTime)} - {formatTime(stats.maxTime)}</div>
                      <div className="text-xs text-gray-500">min - max</div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getPerformanceColor(stats.errorRate * 100, { good: 1, warning: 5 })}`}>
                        {(stats.errorRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">error rate</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Optimize Images</div>
                <div className="text-sm text-gray-600">Use WebP format and implement lazy loading</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Enable Caching</div>
                <div className="text-sm text-gray-600">Implement Redis caching for frequently accessed data</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium">Code Splitting</div>
                <div className="text-sm text-gray-600">Use dynamic imports to reduce initial bundle size</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-medium">Monitor Long Tasks</div>
                <div className="text-sm text-gray-600">Break up long-running JavaScript tasks</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

