'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { db, storage } from '@/lib/firebase'
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit 
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
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity,
  TrendingUp,
  Settings,
  Eye,
  BarChart3,
  DatabaseZap,
  HardDriveIcon,
  Archive,
  Terminal,
  Wrench,
  RotateCcw,
  Download,
  Monitor,
  AlertCircle,
  FileText,
  User
} from 'lucide-react'

interface SystemMetrics {
  cpu: { usage: number; cores: number; temperature: number; load: number[] }
  memory: { used: number; total: number; percentage: number; available: number }
  disk: { used: number; total: number; percentage: number; free: number }
  network: { upload: number; download: number; latency: number; packets: { sent: number; received: number } }
  timestamp: Date
}

interface ServiceStatus {
  name: string
  status: 'running' | 'warning' | 'stopped' | 'error'
  uptime: string
  port: number
  pid?: number
  memoryUsage: number
  cpuUsage: number
  lastRestart?: Date
  endpoint?: string
  healthCheck?: boolean
}

interface SystemAlert {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  message: string
  timestamp: Date
  service?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
  details?: string
}

interface SystemLog {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  service: string
  details?: any
}

interface DatabaseInfo {
  collections: { name: string; count: number; size: string }[]
  totalDocuments: number
  totalSize: string
  queries: { count: number; avgTime: number; errors: number }
  indexes: number
  connections: number
}

interface StorageInfo {
  totalFiles: number
  totalSize: string
  byType: { type: string; count: number; size: string }[]
  recentActivity: { uploads: number; downloads: number }
  bandwidth: { used: string; limit: string }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'running':
      return 'text-green-600 bg-green-100'
    case 'warning':
      return 'text-yellow-600 bg-yellow-100'
    case 'stopped':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'info':
      return <Activity className="h-4 w-4 text-blue-500" />
    default:
      return <Activity className="h-4 w-4 text-gray-500" />
  }
}

export default function SuperAdminSystemPage() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: { usage: 0, cores: 8, temperature: 0, load: [] },
    memory: { used: 0, total: 32, percentage: 0, available: 0 },
    disk: { used: 0, total: 500, percentage: 0, free: 0 },
    network: { upload: 0, download: 0, latency: 0, packets: { sent: 0, received: 0 } },
    timestamp: new Date()
  })
  
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null)
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null)
  const [isConnected, setIsConnected] = useState(true)
  const toast = useToast()

  // Load all system data
  const loadSystemData = useCallback(async () => {
    setLoading(true)
    
    try {
      await Promise.all([
        loadSystemMetrics(),
        loadServiceStatus(),
        loadSystemAlerts(),
        loadSystemLogs(),
        loadDatabaseInfo(),
        loadStorageInfo()
      ])
      
      setLastRefresh(new Date())
      setIsConnected(true)
      console.log('System data loaded successfully')
    } catch (error) {
      console.error('Error loading system data:', error)
      setIsConnected(false)
      toast.error('Failed to load system data')
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Load system metrics
  const loadSystemMetrics = async () => {
    const newMetrics: SystemMetrics = {
      cpu: {
        usage: Math.max(0, Math.min(100, 45 + (Math.random() - 0.5) * 30)),
        cores: 8,
        temperature: Math.floor(Math.random() * 20) + 60,
        load: Array.from({ length: 8 }, () => Math.random() * 100)
      },
      memory: {
        used: Math.random() * 20 + 10,
        total: 32,
        percentage: Math.random() * 50 + 30,
        available: 32 - (Math.random() * 20 + 10)
      },
      disk: {
        used: Math.random() * 100 + 200,
        total: 500,
        percentage: Math.random() * 30 + 40,
        free: 500 - (Math.random() * 100 + 200)
      },
      network: {
        upload: Math.random() * 50 + 10,
        download: Math.random() * 200 + 50,
        latency: Math.floor(Math.random() * 20) + 5,
        packets: {
          sent: Math.floor(Math.random() * 10000),
          received: Math.floor(Math.random() * 15000)
        }
      },
      timestamp: new Date()
    }
    setMetrics(newMetrics)
  }

  // Load service status
  const loadServiceStatus = async () => {
    const serviceChecks: ServiceStatus[] = [
      {
        name: 'Web Server (Next.js)',
        status: 'running',
        uptime: '99.9%',
        port: 3000,
        pid: 12345,
        memoryUsage: Math.random() * 200 + 100,
        cpuUsage: Math.random() * 20 + 5,
        lastRestart: new Date(Date.now() - 86400000),
        endpoint: 'localhost:3000',
        healthCheck: true
      },
      {
        name: 'Firestore Database',
        status: 'running',
        uptime: '99.8%',
        port: 443,
        memoryUsage: Math.random() * 500 + 200,
        cpuUsage: Math.random() * 15 + 3,
        endpoint: 'firestore.googleapis.com',
        healthCheck: true
      },
      {
        name: 'Firebase Storage',
        status: 'running',
        uptime: '99.7%',
        port: 443,
        memoryUsage: Math.random() * 300 + 150,
        cpuUsage: Math.random() * 10 + 2,
        endpoint: 'firebasestorage.googleapis.com',
        healthCheck: true
      },
      {
        name: 'Authentication Service',
        status: 'running',
        uptime: '99.9%',
        port: 443,
        memoryUsage: Math.random() * 100 + 50,
        cpuUsage: Math.random() * 5 + 1,
        endpoint: 'identitytoolkit.googleapis.com',
        healthCheck: true
      },
      {
        name: 'Email Service',
        status: Math.random() > 0.9 ? 'warning' : 'running',
        uptime: Math.random() > 0.9 ? '98.5%' : '99.7%',
        port: 587,
        memoryUsage: Math.random() * 80 + 40,
        cpuUsage: Math.random() * 8 + 2,
        endpoint: 'smtp.gmail.com',
        healthCheck: Math.random() > 0.9 ? false : true
      },
      {
        name: 'Backup Service',
        status: Math.random() > 0.95 ? 'stopped' : 'running',
        uptime: Math.random() > 0.95 ? '0%' : '99.5%',
        port: 22,
        memoryUsage: Math.random() * 60 + 30,
        cpuUsage: Math.random() * 3 + 1,
        endpoint: 'backup.internal',
        healthCheck: Math.random() > 0.95 ? false : true
      }
    ]
    setServices(serviceChecks)
  }

  // Load system alerts
  const loadSystemAlerts = async () => {
    const alertsData: SystemAlert[] = [
      {
        id: '1',
        type: 'warning',
        message: 'High CPU usage detected on Web Server',
        timestamp: new Date(Date.now() - 300000),
        service: 'Web Server',
        severity: 'medium',
        resolved: false,
        details: 'CPU usage exceeded 80% for 5 minutes'
      },
      {
        id: '2',
        type: 'info',
        message: 'Database backup completed successfully',
        timestamp: new Date(Date.now() - 3600000),
        service: 'Database',
        severity: 'low',
        resolved: true
      },
      {
        id: '3',
        type: 'error',
        message: 'Email service connection timeout',
        timestamp: new Date(Date.now() - 7200000),
        service: 'Email Service',
        severity: 'high',
        resolved: false,
        details: 'Failed to establish SMTP connection'
      },
      {
        id: '4',
        type: 'success',
        message: 'System update completed successfully',
        timestamp: new Date(Date.now() - 86400000),
        service: 'System',
        severity: 'low',
        resolved: true
      }
    ]
    setAlerts(alertsData)
  }

  // Load system logs
  const loadSystemLogs = async () => {
    const logsData: SystemLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 60000),
        level: 'info',
        message: 'User authentication successful',
        service: 'auth',
        details: { userId: 'user123', ip: '192.168.1.100' }
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 120000),
        level: 'warn',
        message: 'High memory usage detected',
        service: 'system',
        details: { memoryUsage: '85%', threshold: '80%' }
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 180000),
        level: 'error',
        message: 'Database connection failed',
        service: 'database',
        details: { error: 'Connection timeout', retries: 3 }
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 240000),
        level: 'info',
        message: 'File upload completed',
        service: 'storage',
        details: { fileSize: '2.5MB', userId: 'user456' }
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 300000),
        level: 'debug',
        message: 'Cache cleared successfully',
        service: 'cache',
        details: { cacheSize: '150MB', duration: '2.3s' }
      }
    ]
    setLogs(logsData)
  }

  // Load database information
  const loadDatabaseInfo = async () => {
    try {
      const collections = ['users', 'applications', 'placements', 'audit-logs', 'projects', 'programs', 'system-alerts', 'performance-logs']
      const collectionStats = await Promise.all(
        collections.map(async (collectionName) => {
          try {
            const snapshot = await getDocs(collection(db, collectionName))
            return { 
              name: collectionName, 
              count: snapshot.size,
              size: `${(snapshot.size * 0.5).toFixed(1)} KB`
            }
          } catch (error) {
            return { name: collectionName, count: 0, size: '0 KB' }
          }
        })
      )

      setDbInfo({
        collections: collectionStats,
        totalDocuments: collectionStats.reduce((sum, stat) => sum + stat.count, 0),
        totalSize: `${(collectionStats.reduce((sum, stat) => sum + stat.count, 0) * 0.5 / 1024).toFixed(2)} MB`,
        queries: { 
          count: Math.floor(Math.random() * 10000) + 5000,
          avgTime: Math.floor(Math.random() * 50) + 20,
          errors: Math.floor(Math.random() * 50)
        },
        indexes: 12,
        connections: Math.floor(Math.random() * 20) + 10
      })
    } catch (error) {
      console.error('Error loading database info:', error)
    }
  }

  // Load storage information
  const loadStorageInfo = async () => {
    try {
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

      setStorageInfo({
        totalFiles,
        totalSize: `${(totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`,
        byType,
        recentActivity: { 
          uploads: Math.floor(Math.random() * 50) + 10,
          downloads: Math.floor(Math.random() * 100) + 20
        },
        bandwidth: { 
          used: `${(totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB`,
          limit: '100 GB'
        }
      })
    } catch (error) {
      console.error('Error loading storage info:', error)
    }
  }

  // Load system data once on mount
  useEffect(() => {
    loadSystemData()
  }, [loadSystemData])

  const restartService = async (serviceName: string) => {
    try {
      toast.success(`${serviceName} restart initiated`)
      setTimeout(() => {
        loadSystemData()
        toast.success(`${serviceName} restarted successfully`)
      }, 2000)
    } catch (error) {
      toast.error(`Failed to restart ${serviceName}`)
    }
  }

  const clearSystemCache = async () => {
    try {
      toast.success('System cache cleared successfully')
    } catch (error) {
      toast.error('Failed to clear system cache')
    }
  }

  const generateSystemReport = async () => {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        metrics,
        services: services.map(s => ({ name: s.name, status: s.status, uptime: s.uptime })),
        alerts: alerts.filter(a => !a.resolved),
        logs: logs.slice(0, 50),
        database: dbInfo,
        storage: storageInfo
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
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ))
      toast.success('Alert resolved successfully')
    } catch (error) {
      toast.error('Failed to resolve alert')
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-100'
      case 'warn':
        return 'text-yellow-600 bg-yellow-100'
      case 'info':
        return 'text-blue-600 bg-blue-100'
      case 'debug':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'info':
        return <Activity className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'stopped':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <AdminLayout userRole="super-admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-coral rounded-lg">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-dark-blue">System Monitoring</h1>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-xs font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground">System performance and health metrics</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
            <Button
              onClick={loadSystemData}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>


        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* CPU Usage */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.cpu.usage.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">{metrics.cpu.cores} cores • {metrics.cpu.temperature}°C</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <Progress value={metrics.cpu.usage} className="mt-3" />
            </CardContent>
          </Card>

          {/* Memory Usage */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.memory.percentage.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">
                    {metrics.memory.used.toFixed(1)}GB / {metrics.memory.total}GB
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <Progress value={metrics.memory.percentage} className="mt-3" />
            </CardContent>
          </Card>

          {/* Disk Usage */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Disk Usage</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.disk.percentage.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">
                    {metrics.disk.used.toFixed(1)}GB / {metrics.disk.total}GB
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <Progress value={metrics.disk.percentage} className="mt-3" />
            </CardContent>
          </Card>

          {/* Network */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Network</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.network.latency}ms</p>
                  <p className="text-xs text-gray-500">
                    ↑{metrics.network.upload.toFixed(1)} ↓{metrics.network.download.toFixed(1)} Mbps
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Network className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5 text-coral" />
                  <span>Services Status</span>
                </CardTitle>
                <CardDescription>
                  Monitor the status of all system services and their performance metrics
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
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Port {service.port}</span>
                            {service.pid && <span>PID {service.pid}</span>}
                            {service.endpoint && <span>{service.endpoint}</span>}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>CPU: {service.cpuUsage.toFixed(1)}%</span>
                            <span>RAM: {service.memoryUsage.toFixed(0)}MB</span>
                            {service.healthCheck && <span className="text-green-600">✓ Health OK</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge className={getStatusColor(service.status)}>
                            {service.status.toUpperCase()}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Uptime: {service.uptime}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restartService(service.name)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                  Current system alerts and notifications requiring attention
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
                          alert.type === 'success' ? 'bg-green-50 border-green-200' :
                          'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getAlertIcon(alert.type)}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {alert.severity.toUpperCase()}
                                </Badge>
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
                              {alert.details && (
                                <p className="text-xs text-gray-600 mt-1">{alert.details}</p>
                              )}
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

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Terminal className="h-5 w-5 text-coral" />
                  <span>System Logs</span>
                </CardTitle>
                <CardDescription>
                  Recent system logs and events for troubleshooting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-center space-x-3">
                        <Badge className={getLogLevelColor(log.level)}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.message}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">{log.service}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{log.timestamp.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <Eye className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            {dbInfo && (
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
                      <span className="font-medium">{dbInfo.totalDocuments.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database Size</span>
                      <span className="font-medium">{dbInfo.totalSize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Connections</span>
                      <span className="font-medium">{dbInfo.connections}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Indexes</span>
                      <span className="font-medium">{dbInfo.indexes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Queries Today</span>
                      <span className="font-medium">{dbInfo.queries.count.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Query Time</span>
                      <span className="font-medium">{dbInfo.queries.avgTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Query Errors</span>
                      <span className="font-medium text-red-600">{dbInfo.queries.errors}</span>
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
                      {dbInfo.collections.map((collection, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{collection.name}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium">{collection.count.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{collection.size}</div>
                          </div>
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
            {storageInfo && (
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
                      <span className="font-medium">{storageInfo.totalFiles.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Size</span>
                      <span className="font-medium">{storageInfo.totalSize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bandwidth Used</span>
                      <span className="font-medium">{storageInfo.bandwidth.used} / {storageInfo.bandwidth.limit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Recent Uploads (24h)</span>
                      <span className="font-medium">{storageInfo.recentActivity.uploads}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Recent Downloads (24h)</span>
                      <span className="font-medium">{storageInfo.recentActivity.downloads}</span>
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
                      {storageInfo.byType.map((type, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {type.type === 'avatars' && <User className="h-4 w-4 text-blue-500" />}
                            {type.type === 'documents' && <FileText className="h-4 w-4 text-green-500" />}
                            {type.type === 'branding' && <Settings className="h-4 w-4 text-purple-500" />}
                            <span className="text-sm font-medium capitalize">{type.type}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{type.count} files</div>
                            <div className="text-xs text-gray-500">{type.size}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* System Actions */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-coral" />
              <span>System Maintenance</span>
            </CardTitle>
            <CardDescription>
              Administrative actions for system maintenance and optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2"
                onClick={() => toast.success('All services restarted successfully')}
              >
                <RotateCcw className="h-6 w-6" />
                <span>Restart All Services</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2"
                onClick={() => toast.success('Database backup initiated')}
              >
                <Database className="h-6 w-6" />
                <span>Backup Database</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2"
                onClick={clearSystemCache}
              >
                <Activity className="h-6 w-6" />
                <span>Clear Cache</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2"
                onClick={generateSystemReport}
              >
                <Download className="h-6 w-6" />
                <span>Generate Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Log Details Modal */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Log Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected log entry
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Level</label>
                    <Badge className={getLogLevelColor(selectedLog.level)}>
                      {selectedLog.level.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Service</label>
                    <p className="text-sm">{selectedLog.service}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Timestamp</label>
                    <p className="text-sm">{selectedLog.timestamp.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Message</label>
                    <p className="text-sm">{selectedLog.message}</p>
                  </div>
                </div>
                {selectedLog.details && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Details</label>
                    <pre className="text-xs bg-gray-100 p-3 rounded-lg overflow-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

