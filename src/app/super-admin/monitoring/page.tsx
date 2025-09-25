'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  HardDrive, 
  Cpu,
  RefreshCw,
  Bell,
  Shield,
  Zap
} from 'lucide-react'

interface SystemMetrics {
  errorRate: number
  avgResponseTime: number
  memoryUsage: number
  cpuUsage: number
  databaseErrors: number
  activeAlerts: number
  totalAlerts: number
  backupStatus: string
  lastBackup: string
  uptime: string
}

interface AlertData {
  id: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  resolved: boolean
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/monitoring/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics)
        setAlerts(data.alerts || [])
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/monitoring/alerts/${alertId}/resolve`, {
        method: 'POST'
      })
      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        ))
      }
    } catch (error) {
      console.error('Error resolving alert:', error)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600'
    if (value >= thresholds.warning) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading metrics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time system health and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={fetchMetrics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(metrics?.errorRate || 0, { warning: 0.02, critical: 0.05 })}>
                {((metrics?.errorRate || 0) * 100).toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(metrics?.avgResponseTime || 0, { warning: 1000, critical: 2000 })}>
                {Math.round(metrics?.avgResponseTime || 0)}ms
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor((metrics?.memoryUsage || 0) * 100, { warning: 70, critical: 90 })}>
                {((metrics?.memoryUsage || 0) * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              System memory usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor((metrics?.cpuUsage || 0) * 100, { warning: 60, critical: 80 })}>
                {((metrics?.cpuUsage || 0) * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              CPU utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.filter(alert => !alert.resolved).length === 0 ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                No active alerts
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.filter(alert => !alert.resolved).map((alert) => (
                  <Alert key={alert.id}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    (metrics?.databaseErrors || 0) === 0 ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm">
                    {(metrics?.databaseErrors || 0) === 0 ? 'Healthy' : 'Issues'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Backup System</span>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    metrics?.backupStatus === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm capitalize">
                    {metrics?.backupStatus || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uptime</span>
                <span className="text-sm text-muted-foreground">
                  {metrics?.uptime || 'Unknown'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Backup</span>
                <span className="text-sm text-muted-foreground">
                  {metrics?.lastBackup || 'Never'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Performance charts will be displayed here</p>
              <p className="text-sm">Real-time monitoring data visualization</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
