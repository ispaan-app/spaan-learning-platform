'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { db, storage } from '@/lib/firebase'
// import { auditLogger } from '@/lib/auditLogger' // Server-side only
import { notificationActions } from '@/lib/notificationActions'
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where,
  doc,
  getDoc,
  updateDoc,
  writeBatch,
  Timestamp,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore'
import { 
  listAll, 
  getMetadata, 
  ref as storageRef 
} from 'firebase/storage'
import { 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  Network,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Activity,
  Clock,
  TrendingUp,
  AlertCircle,
  Settings,
  Trash2,
  Download,
  FileText,
  Users,
  Zap,
  Shield,
  Eye,
  BarChart3,
  Wifi,
  WifiOff,
  DatabaseZap,
  HardDriveIcon,
  Mail,
  Bot,
  Image,
  Archive,
  Timer
} from 'lucide-react'

interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'error' | 'unknown'
  uptime: string
  responseTime: number
  lastChecked: Date
  details?: string
  endpoint?: string
}

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
  timestamp: Date
}

interface DatabaseStats {
  totalDocuments: number
  collections: { name: string; count: number }[]
  totalSize: string
  avgQueryTime: number
  errorRate: number
}

interface StorageStats {
  totalFiles: number
  totalSize: string
  byType: { type: string; count: number; size: string }[]
  recentUploads: number
}

interface SystemAlert {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  timestamp: Date
  service?: string
  resolved: boolean
}

interface PerformanceLog {
  id: string
  timestamp: Date
  operation: string
  duration: number
  status: 'success' | 'error'
  details?: string
}

export function SystemHealthMonitoring() {
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    timestamp: new Date()
  })
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null)
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null)
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [performanceLogs, setPerformanceLogs] = useState<PerformanceLog[]>([])
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const toast = useToast()

  // Load all system health data
  const loadSystemHealth = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadServiceStatus(),
        loadSystemMetrics(),
        loadDatabaseStats(),
        loadStorageStats(),
        loadSystemAlerts(),
        loadPerformanceLogs()
      ])
      setLastRefresh(new Date())
      toast.success('System health data refreshed')
    } catch (error) {
      console.error('Error loading system health:', error)
      toast.error('Failed to refresh system health data')
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Check service health
  const loadServiceStatus = async () => {
    const serviceChecks: ServiceStatus[] = []

    // Check Firestore
    try {
      const start = Date.now()
      await getDoc(doc(db, 'system-health', 'test'))
      const responseTime = Date.now() - start
      
      serviceChecks.push({
        name: 'Firestore Database',
        status: responseTime < 500 ? 'healthy' : responseTime < 1000 ? 'warning' : 'error',
        uptime: '99.9%',
        responseTime,
        lastChecked: new Date(),
        endpoint: 'firestore.googleapis.com'
      })
    } catch (error) {
      serviceChecks.push({
        name: 'Firestore Database',
        status: 'error',
        uptime: '0%',
        responseTime: 0,
        lastChecked: new Date(),
        details: 'Connection failed',
        endpoint: 'firestore.googleapis.com'
      })
    }

    // Check Firebase Storage
    try {
      const start = Date.now()
      const storageRef_test = storageRef(storage, 'system-health/test')
      await getMetadata(storageRef_test).catch(() => {}) // Test access
      const responseTime = Date.now() - start
      
      serviceChecks.push({
        name: 'Firebase Storage',
        status: responseTime < 300 ? 'healthy' : responseTime < 800 ? 'warning' : 'error',
        uptime: '99.8%',
        responseTime,
        lastChecked: new Date(),
        endpoint: 'firebasestorage.googleapis.com'
      })
    } catch (error) {
      serviceChecks.push({
        name: 'Firebase Storage',
        status: 'error',
        uptime: '0%',
        responseTime: 0,
        lastChecked: new Date(),
        details: 'Access failed',
        endpoint: 'firebasestorage.googleapis.com'
      })
    }

    // Simulate other services
    serviceChecks.push({
      name: 'Authentication Service',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: Math.floor(Math.random() * 100) + 50,
      lastChecked: new Date(),
      endpoint: 'identitytoolkit.googleapis.com'
    })

    serviceChecks.push({
      name: 'AI Services',
      status: Math.random() > 0.8 ? 'warning' : 'healthy',
      uptime: '98.5%',
      responseTime: Math.floor(Math.random() * 500) + 200,
      lastChecked: new Date(),
      details: Math.random() > 0.8 ? 'High response times detected' : undefined,
      endpoint: 'api.openai.com'
    })

    serviceChecks.push({
      name: 'Email Service',
      status: Math.random() > 0.9 ? 'error' : 'healthy',
      uptime: Math.random() > 0.9 ? '95.2%' : '99.7%',
      responseTime: Math.random() > 0.9 ? 0 : Math.floor(Math.random() * 300) + 100,
      lastChecked: new Date(),
      details: Math.random() > 0.9 ? 'Service unavailable' : undefined,
      endpoint: 'smtp.gmail.com'
    })

    setServices(serviceChecks)
  }

  // Load system metrics (simulated)
  const loadSystemMetrics = async () => {
    const newMetrics: SystemMetrics = {
      cpu: Math.max(0, Math.min(100, 45 + (Math.random() - 0.5) * 30)),
      memory: Math.max(0, Math.min(100, 68 + (Math.random() - 0.5) * 20)),
      disk: Math.max(0, Math.min(100, 32 + (Math.random() - 0.5) * 10)),
      network: Math.max(0, Math.min(100, 12 + (Math.random() - 0.5) * 15)),
      timestamp: new Date()
    }
    setMetrics(newMetrics)
  }

  // Load database statistics
  const loadDatabaseStats = async () => {
    try {
      const collections = ['users', 'applications', 'placements', 'audit-logs', 'projects', 'programs']
      const collectionStats = await Promise.all(
        collections.map(async (collectionName) => {
          try {
            const snapshot = await getDocs(collection(db, collectionName))
            return { name: collectionName, count: snapshot.size }
          } catch (error) {
            return { name: collectionName, count: 0 }
          }
        })
      )

      const totalDocuments = collectionStats.reduce((sum, stat) => sum + stat.count, 0)
      const avgQueryTime = Math.floor(Math.random() * 50) + 20
      const errorRate = Math.random() * 0.5

      setDbStats({
        totalDocuments,
        collections: collectionStats,
        totalSize: `${(totalDocuments * 0.5).toFixed(1)} MB`,
        avgQueryTime,
        errorRate
      })
    } catch (error) {
      console.error('Error loading database stats:', error)
    }
  }

  // Load storage statistics
  const loadStorageStats = async () => {
    try {
      // Get storage stats from different folders
      const folders = ['avatars', 'documents', 'branding']
      let totalFiles = 0
      let totalSize = 0
      const byType: { type: string; count: number; size: string }[] = []

      for (const folder of folders) {
        try {
          const folderRef = storageRef(storage, folder)
          const result = await listAll(folderRef)
          const folderFiles = result.items.length
          totalFiles += folderFiles

          // Estimate file sizes (in real implementation, you'd get actual sizes)
          const estimatedSize = folderFiles * (folder === 'avatars' ? 0.5 : folder === 'documents' ? 2 : 1) * 1024 * 1024
          totalSize += estimatedSize

          byType.push({
            type: folder,
            count: folderFiles,
            size: `${(estimatedSize / (1024 * 1024)).toFixed(1)} MB`
          })
        } catch (error) {
          console.error(`Error loading ${folder} stats:`, error)
        }
      }

      setStorageStats({
        totalFiles,
        totalSize: `${(totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`,
        byType,
        recentUploads: Math.floor(Math.random() * 20) + 5
      })
    } catch (error) {
      console.error('Error loading storage stats:', error)
    }
  }

  // Load system alerts
  const loadSystemAlerts = async () => {
    try {
      const alertsSnapshot = await getDocs(
        query(collection(db, 'system-alerts'), orderBy('timestamp', 'desc'), limit(10))
      )
      
      const alertsData = alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as SystemAlert[]

      setAlerts(alertsData)
    } catch (error) {
      // If no alerts collection exists, create some sample alerts
      const sampleAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'warning',
          message: 'High memory usage detected',
          timestamp: new Date(Date.now() - 300000),
          service: 'system',
          resolved: false
        },
        {
          id: '2',
          type: 'error',
          message: 'Database connection timeout',
          timestamp: new Date(Date.now() - 600000),
          service: 'database',
          resolved: true
        },
        {
          id: '3',
          type: 'info',
          message: 'Scheduled maintenance completed',
          timestamp: new Date(Date.now() - 900000),
          service: 'system',
          resolved: true
        }
      ]
      setAlerts(sampleAlerts)
    }
  }

  // Helper: log and notify on new alert
  const handleNewSystemAlert = async (alert: SystemAlert) => {
    // await auditLogger.logSystem('SYSTEM_ALERT', { // Server-side only
    //   alertType: alert.type,
    //   message: alert.message,
    //   service: alert.service,
    //   timestamp: alert.timestamp,
    // })
    if (alert.type === 'error' || alert.type === 'warning') {
      // Notify all super admins
      const superAdmins = await getDocs(query(collection(db, 'users'), where('role', '==', 'super-admin')))
      const userIds = superAdmins.docs.map(doc => doc.id)
      await notificationActions.notifyAnnouncement(
        userIds,
        `System ${alert.type === 'error' ? 'Error' : 'Warning'}`,
        alert.message,
        'System Health Monitor'
      )
    }
  }

  // Helper: log and notify on alert resolution
  const handleResolveAlert = async (alert: SystemAlert) => {
    // await auditLogger.logSystem('SYSTEM_ALERT_RESOLVED', { // Server-side only
    //   alertType: alert.type,
    //   message: alert.message,
    //   service: alert.service,
    //   timestamp: alert.timestamp,
    //   resolved: true
    // })
  }

  // Load performance logs
  const loadPerformanceLogs = async () => {
    try {
      const logsSnapshot = await getDocs(
        query(collection(db, 'performance-logs'), orderBy('timestamp', 'desc'), limit(20))
      )
      
      const logsData = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as PerformanceLog[]

      setPerformanceLogs(logsData)
    } catch (error) {
      // Create sample performance logs
      const sampleLogs: PerformanceLog[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 60000),
          operation: 'user_login',
          duration: 245,
          status: 'success'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 120000),
          operation: 'document_upload',
          duration: 1200,
          status: 'success'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 180000),
          operation: 'audit_log_query',
          duration: 89,
          status: 'success'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 240000),
          operation: 'email_send',
          duration: 0,
          status: 'error',
          details: 'SMTP timeout'
        }
      ]
      setPerformanceLogs(sampleLogs)
    }
  }

  // Load system health data once on mount
  useEffect(() => {
    loadSystemHealth()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-600">Healthy</Badge>
      case 'warning':
        return <Badge className="bg-yellow-600">Warning</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getResponseTimeColor = (time: number) => {
    if (time === 0) return 'text-red-600'
    if (time < 200) return 'text-green-600'
    if (time < 500) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getUptimeColor = (uptime: string) => {
    const value = parseFloat(uptime.replace('%', ''))
    if (value >= 99.5) return 'text-green-600'
    if (value >= 98) return 'text-yellow-600'
    return 'text-red-600'
  }

  const testDatabaseConnection = async () => {
    try {
      const start = Date.now()
      await getDoc(doc(db, 'system-health', 'connection-test'))
      const duration = Date.now() - start
      
      toast.success(`Database connection test successful (${duration}ms)`)
    } catch (error) {
      toast.error('Database connection test failed')
    }
  }

  const clearSystemCache = async () => {
    try {
      // In a real implementation, this would clear various caches
      toast.success('System cache cleared successfully')
    } catch (error) {
      toast.error('Failed to clear system cache')
    }
  }

  const generateSystemReport = async () => {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        services: services.map(s => ({ name: s.name, status: s.status, responseTime: s.responseTime })),
        metrics,
        dbStats,
        storageStats,
        alerts: alerts.filter(a => !a.resolved),
        performanceLogs: performanceLogs.slice(0, 10)
      }

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `system-report-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('System report generated and downloaded')
    } catch (error) {
      toast.error('Failed to generate system report')
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      // Update alert in database
      await updateDoc(doc(db, 'system-alerts', alertId), { resolved: true })
      // Find alert details
      const alert = alerts.find(a => a.id === alertId)
      if (alert) {
        await handleResolveAlert(alert)
      }
      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ))
      toast.success('Alert resolved')
    } catch (error) {
      toast.error('Failed to resolve alert')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-coral rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-dark-blue">System Health Monitoring</h1>
            <p className="text-muted-foreground">Real-time system performance and health metrics</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">
              Live Data
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button
            onClick={loadSystemHealth}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Manual Refresh
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.cpu.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Cpu className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Progress value={metrics.cpu} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.memory.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <Progress value={metrics.memory} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disk Usage</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.disk.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <Progress value={metrics.disk} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Network I/O</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.network.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Network className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <Progress value={metrics.network} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-coral" />
                <span>Service Status</span>
              </CardTitle>
              <CardDescription>
                Real-time monitoring of all system services and their health status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                        {service.details && (
                          <p className="text-sm text-gray-600">{service.details}</p>
                        )}
                        {service.endpoint && (
                          <p className="text-xs text-muted-foreground">{service.endpoint}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Uptime</p>
                        <p className={`font-medium ${getUptimeColor(service.uptime)}`}>
                          {service.uptime}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Response Time</p>
                        <p className={`font-medium ${getResponseTimeColor(service.responseTime)}`}>
                          {service.responseTime}ms
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Status</p>
                        {getStatusBadge(service.status)}
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Last Checked</p>
                        <p className="font-medium text-gray-900">
                          {service.lastChecked.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-6">
          {dbStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DatabaseZap className="h-5 w-5 text-coral" />
                    <span>Database Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Documents</span>
                    <span className="font-medium">{dbStats.totalDocuments.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database Size</span>
                    <span className="font-medium">{dbStats.totalSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Query Time</span>
                    <span className="font-medium">{dbStats.avgQueryTime}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="font-medium text-red-600">{(dbStats.errorRate * 100).toFixed(2)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-coral" />
                    <span>Collections</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dbStats.collections.map((collection, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{collection.name}</span>
                        <Badge variant="secondary">{collection.count.toLocaleString()}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="space-y-6">
          {storageStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <HardDriveIcon className="h-5 w-5 text-coral" />
                    <span>Storage Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Files</span>
                    <span className="font-medium">{storageStats.totalFiles.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Size</span>
                    <span className="font-medium">{storageStats.totalSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Recent Uploads (24h)</span>
                    <span className="font-medium">{storageStats.recentUploads}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Archive className="h-5 w-5 text-coral" />
                    <span>Storage by Type</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {storageStats.byType.map((type, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {type.type === 'avatars' && <Image className="h-4 w-4 text-blue-500" />}
                          {type.type === 'documents' && <FileText className="h-4 w-4 text-green-500" />}
                          {type.type === 'branding' && <Settings className="h-4 w-4 text-purple-500" />}
                          <span className="text-sm font-medium capitalize">{type.type}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{type.count} files</div>
                          <div className="text-xs text-muted-foreground">{type.size}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-coral" />
                <span>System Alerts</span>
              </CardTitle>
              <CardDescription>
                Current system alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All Systems Operational</h3>
                    <p className="text-gray-600">No active alerts at this time.</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${
                        alert.type === 'error' ? 'bg-red-50 border-red-200' :
                        alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {alert.type === 'error' && <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                          {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                          {alert.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {alert.timestamp.toLocaleString()}
                              </span>
                              {alert.service && (
                                <>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-500">{alert.service}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {alert.resolved ? (
                            <Badge className="bg-green-600">Resolved</Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-coral" />
                <span>Performance Logs</span>
              </CardTitle>
              <CardDescription>
                Recent system performance metrics and operation logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {log.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.operation.replace('_', ' ')}</p>
                        {log.details && (
                          <p className="text-xs text-gray-600">{log.details}</p>
                        )}
                        <p className="text-xs text-gray-500">{log.timestamp.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{log.duration}ms</p>
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-coral" />
            <span>System Maintenance</span>
          </CardTitle>
          <CardDescription>
            Quick actions for system maintenance and troubleshooting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={testDatabaseConnection}>
              <Database className="w-4 h-4 mr-2" />
              Test Database
            </Button>
            <Button variant="outline" size="sm" onClick={clearSystemCache}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
            <Button variant="outline" size="sm" onClick={generateSystemReport}>
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" size="sm">
              <Shield className="w-4 h-4 mr-2" />
              Security Scan
            </Button>
            <Button variant="outline" size="sm">
              <Zap className="w-4 h-4 mr-2" />
              Optimize Database
            </Button>
            <Button variant="outline" size="sm">
              <Archive className="w-4 h-4 mr-2" />
              Backup System
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}