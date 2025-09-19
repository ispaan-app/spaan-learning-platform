'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Bell, 
  Shield, 
  Mail, 
  Database, 
  Globe,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Target,
  Award,
  Activity,
  BarChart3,
  TrendingUp,
  Clock,
  AlertTriangle,
  Star,
  Eye,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  TrendingDown,
  Play,
  Pause,
  Square,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  Share,
  User,
  Calendar,
  Download,
  Upload,
  Lock,
  Unlock,
  Key,
  Server,
  Wifi,
  WifiOff,
  HardDrive,
  Cpu,
  MemoryStick,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore'

interface PlatformSettings {
  general: {
    platformName: string
    platformDescription: string
    contactEmail: string
    supportEmail: string
    timezone: string
    dateFormat: string
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    applicationAlerts: boolean
    placementUpdates: boolean
    systemMaintenance: boolean
    weeklyReports: boolean
  }
  security: {
    requireEmailVerification: boolean
    passwordMinLength: number
    sessionTimeout: number
    twoFactorAuth: boolean
    ipWhitelist: string[]
  }
  integrations: {
    smtpEnabled: boolean
    smtpHost: string
    smtpPort: number
    smtpUsername: string
    smtpPassword: string
    analyticsEnabled: boolean
    backupEnabled: boolean
    backupFrequency: string
  }
}

interface SystemStatus {
  totalUsers: number
  activeUsers: number
  totalLearners: number
  totalPlacements: number
  totalApplications: number
  systemUptime: string
  lastBackup: string
  databaseSize: string
  serverLoad: number
  memoryUsage: number
  diskUsage: number
  networkStatus: 'online' | 'offline'
  lastError: string | null
  errorCount: number
}

interface RealTimeMetrics {
  onlineUsers: number
  activeSessions: number
  requestsPerMinute: number
  averageResponseTime: number
  errorRate: number
  dataTransferRate: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    general: {
  platformName: 'iSpaan',
      platformDescription: 'A comprehensive platform for managing work-integrated learning placements',
      contactEmail: 'contact@ispaan.com',
      supportEmail: 'support@ispaan.com',
      timezone: 'Africa/Johannesburg',
      dateFormat: 'DD/MM/YYYY'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      applicationAlerts: true,
      placementUpdates: true,
      systemMaintenance: true,
      weeklyReports: false
    },
    security: {
      requireEmailVerification: true,
      passwordMinLength: 8,
      sessionTimeout: 30,
      twoFactorAuth: false,
      ipWhitelist: []
    },
    integrations: {
      smtpEnabled: false,
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      analyticsEnabled: true,
      backupEnabled: true,
      backupFrequency: 'daily'
    }
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    totalUsers: 0,
    activeUsers: 0,
    totalLearners: 0,
    totalPlacements: 0,
    totalApplications: 0,
    systemUptime: '99.9%',
    lastBackup: '2 hours ago',
    databaseSize: '2.4 GB',
    serverLoad: 45,
    memoryUsage: 68,
    diskUsage: 34,
    networkStatus: 'online',
    lastError: null,
    errorCount: 0
  })
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    onlineUsers: 0,
    activeSessions: 0,
    requestsPerMinute: 0,
    averageResponseTime: 0,
    errorRate: 0,
    dataTransferRate: '0 MB/s'
  })
  const toast = useToast()

  useEffect(() => {
    loadSettings()
    loadSystemStatus()
    startRealTimeUpdates()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      // In a real app, this would load from your backend/database
      // For now, we'll use the default settings
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const loadSystemStatus = async () => {
    try {
      // Load real data from Firebase
      const [usersSnapshot, learnersSnapshot, placementsSnapshot, applicationsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'learner'))),
        getDocs(collection(db, 'placements')),
        getDocs(collection(db, 'applications'))
      ])

      const totalUsers = usersSnapshot.size
      const totalLearners = learnersSnapshot.size
      const totalPlacements = placementsSnapshot.size
      const totalApplications = applicationsSnapshot.size

      setSystemStatus(prev => ({
        ...prev,
        totalUsers,
        totalLearners,
        totalPlacements,
        totalApplications,
        activeUsers: Math.floor(totalUsers * 0.7), // Simulate 70% active users
        databaseSize: `${(totalUsers * 0.1 + totalLearners * 0.15 + totalPlacements * 0.2 + totalApplications * 0.08 + 0.5).toFixed(1)} GB`
      }))
    } catch (error) {
      console.error('Error loading system status:', error)
    }
  }

  const startRealTimeUpdates = () => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        onlineUsers: Math.floor(Math.random() * 50) + 20,
        activeSessions: Math.floor(Math.random() * 30) + 10,
        requestsPerMinute: Math.floor(Math.random() * 100) + 50,
        averageResponseTime: Math.floor(Math.random() * 200) + 100,
        errorRate: Math.random() * 2,
        dataTransferRate: `${(Math.random() * 10 + 5).toFixed(1)} MB/s`
      }))

      // Update system load metrics
      setSystemStatus(prev => ({
        ...prev,
        serverLoad: Math.floor(Math.random() * 30) + 30,
        memoryUsage: Math.floor(Math.random() * 20) + 60,
        diskUsage: Math.floor(Math.random() * 10) + 30
      }))
    }, 5000)

    return () => clearInterval(interval)
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      // In a real app, this would save to your backend/database
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateGeneralSetting = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [key]: value
      }
    }))
  }

  const updateNotificationSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const updateSecuritySetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }))
  }

  const updateIntegrationSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [key]: value
      }
    }))
  }

  if (loading) {
    return (
      <AdminLayout userRole="admin">
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-[#FF6E40] absolute top-0 left-0"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold" style={{ color: '#1E3D59' }}>Loading Settings</h3>
              <p className="text-sm text-gray-600">Please wait while we fetch the latest configuration...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
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
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: '#1E3D59' }}>
                      Platform Settings
                    </h1>
                    <p className="text-gray-600 text-lg">Configure platform-wide settings and preferences</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={loadSettings}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Refresh</span>
                </Button>
                <Button 
                  onClick={saveSettings} 
                  disabled={saving}
                  className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#FF6E40' }}
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      <span className="font-semibold">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      <span className="font-semibold">Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-blue-600">{systemStatus.totalUsers}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-600">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Activity className="h-4 w-4 mr-1" />
                <span>{systemStatus.activeUsers} active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">System Uptime</p>
                  <p className="text-3xl font-bold text-green-600">{systemStatus.systemUptime}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-600">
                  <Server className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Last backup: {systemStatus.lastBackup}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Database Size</p>
                  <p className="text-3xl font-bold text-purple-600">{systemStatus.databaseSize}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-600">
                  <Database className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <HardDrive className="h-4 w-4 mr-1" />
                <span>Disk usage: {systemStatus.diskUsage}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Server Load</p>
                  <p className="text-3xl font-bold" style={{ color: '#FF6E40' }}>{systemStatus.serverLoad}%</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                  <Cpu className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <MemoryStick className="h-4 w-4 mr-1" />
                <span>Memory: {systemStatus.memoryUsage}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Metrics */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/3 to-[#FF6E40]/3 opacity-30"></div>
          <CardHeader className="relative">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#FFC13B' }}>
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ color: '#1E3D59' }}>Real-time Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <div className="p-2 rounded-lg bg-blue-100 w-fit mx-auto mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{realTimeMetrics.onlineUsers}</p>
                <p className="text-xs text-gray-500">Online Users</p>
              </div>
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <div className="p-2 rounded-lg bg-green-100 w-fit mx-auto mb-2">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{realTimeMetrics.activeSessions}</p>
                <p className="text-xs text-gray-500">Active Sessions</p>
              </div>
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <div className="p-2 rounded-lg bg-purple-100 w-fit mx-auto mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">{realTimeMetrics.requestsPerMinute}</p>
                <p className="text-xs text-gray-500">Requests/min</p>
              </div>
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <div className="p-2 rounded-lg bg-orange-100 w-fit mx-auto mb-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-600">{realTimeMetrics.averageResponseTime}ms</p>
                <p className="text-xs text-gray-500">Avg Response</p>
              </div>
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <div className="p-2 rounded-lg bg-red-100 w-fit mx-auto mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">{realTimeMetrics.errorRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Error Rate</p>
              </div>
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <div className="p-2 rounded-lg bg-indigo-100 w-fit mx-auto mb-2">
                  <Wifi className="h-5 w-5 text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-indigo-600">{realTimeMetrics.dataTransferRate}</p>
                <p className="text-xs text-gray-500">Data Transfer</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="general" className="space-y-6">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/3 to-[#FF6E40]/3 opacity-30 rounded-2xl"></div>
            <TabsList className="relative grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-2 shadow-lg">
              <TabsTrigger 
                value="general" 
                className="flex items-center space-x-2 px-6 py-3 rounded-xl data-[state=active]:bg-[#FF6E40] data-[state=active]:text-white transition-all duration-300 hover:bg-gray-100"
              >
                <Settings className="w-4 h-4" />
                <span className="font-semibold">General</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex items-center space-x-2 px-6 py-3 rounded-xl data-[state=active]:bg-[#FF6E40] data-[state=active]:text-white transition-all duration-300 hover:bg-gray-100"
              >
                <Bell className="w-4 h-4" />
                <span className="font-semibold">Notifications</span>
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="flex items-center space-x-2 px-6 py-3 rounded-xl data-[state=active]:bg-[#FF6E40] data-[state=active]:text-white transition-all duration-300 hover:bg-gray-100"
              >
                <Shield className="w-4 h-4" />
                <span className="font-semibold">Security</span>
              </TabsTrigger>
              <TabsTrigger 
                value="integrations" 
                className="flex items-center space-x-2 px-6 py-3 rounded-xl data-[state=active]:bg-[#FF6E40] data-[state=active]:text-white transition-all duration-300 hover:bg-gray-100"
              >
                <Globe className="w-4 h-4" />
                <span className="font-semibold">Integrations</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/3 to-[#FF6E40]/3 opacity-30"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: '#1E3D59' }}>
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold" style={{ color: '#1E3D59' }}>General Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="platformName" className="text-sm font-semibold text-gray-700">Platform Name</Label>
                    <Input
                      id="platformName"
                      value={settings.general.platformName}
                      onChange={(e) => updateGeneralSetting('platformName', e.target.value)}
                      className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-sm font-semibold text-gray-700">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) => updateGeneralSetting('contactEmail', e.target.value)}
                      className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportEmail" className="text-sm font-semibold text-gray-700">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => updateGeneralSetting('supportEmail', e.target.value)}
                      className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-sm font-semibold text-gray-700">Timezone</Label>
                    <Select value={settings.general.timezone} onValueChange={(value) => updateGeneralSetting('timezone', value)}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                        <SelectItem value="Africa/Johannesburg" className="rounded-lg">Africa/Johannesburg</SelectItem>
                        <SelectItem value="UTC" className="rounded-lg">UTC</SelectItem>
                        <SelectItem value="America/New_York" className="rounded-lg">America/New_York</SelectItem>
                        <SelectItem value="Europe/London" className="rounded-lg">Europe/London</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platformDescription" className="text-sm font-semibold text-gray-700">Platform Description</Label>
                  <Textarea
                    id="platformDescription"
                    value={settings.general.platformDescription}
                    onChange={(e) => updateGeneralSetting('platformDescription', e.target.value)}
                    rows={3}
                    className="border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/3 to-[#FF6E40]/3 opacity-30"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: '#FFC13B' }}>
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold" style={{ color: '#1E3D59' }}>Notification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="space-y-6">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl p-6 hover:shadow-lg hover:border-[#FF6E40]/30 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/5 to-[#FF6E40]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 rounded-lg bg-gray-100">
                              {key === 'emailNotifications' && <Mail className="h-4 w-4 text-gray-600" />}
                              {key === 'pushNotifications' && <Bell className="h-4 w-4 text-gray-600" />}
                              {key === 'applicationAlerts' && <AlertCircle className="h-4 w-4 text-gray-600" />}
                              {key === 'placementUpdates' && <Activity className="h-4 w-4 text-gray-600" />}
                              {key === 'systemMaintenance' && <Settings className="h-4 w-4 text-gray-600" />}
                              {key === 'weeklyReports' && <FileText className="h-4 w-4 text-gray-600" />}
                            </div>
                            <h4 className="text-lg font-bold" style={{ color: '#1E3D59' }}>
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {key === 'emailNotifications' && 'Enable email notifications for all users'}
                            {key === 'pushNotifications' && 'Enable push notifications in the app'}
                            {key === 'applicationAlerts' && 'Send alerts when new applications are submitted'}
                            {key === 'placementUpdates' && 'Notify users of placement status changes'}
                            {key === 'systemMaintenance' && 'Notify users of scheduled maintenance'}
                            {key === 'weeklyReports' && 'Send weekly summary reports to admins'}
                          </p>
                        </div>
                        <div className="ml-4">
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => updateNotificationSetting(key, checked)}
                            className="data-[state=checked]:bg-[#FF6E40]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/3 to-[#FF6E40]/3 opacity-30"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: '#2D5A87' }}>
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold" style={{ color: '#1E3D59' }}>Security Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="space-y-6">
                  <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl p-6 hover:shadow-lg hover:border-[#FF6E40]/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/5 to-[#FF6E40]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 rounded-lg bg-green-100">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <h4 className="text-lg font-bold" style={{ color: '#1E3D59' }}>Email Verification Required</h4>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">Require users to verify their email addresses</p>
                      </div>
                      <div className="ml-4">
                        <Switch
                          checked={settings.security.requireEmailVerification}
                          onCheckedChange={(checked) => updateSecuritySetting('requireEmailVerification', checked)}
                          className="data-[state=checked]:bg-[#FF6E40]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl p-6 hover:shadow-lg hover:border-[#FF6E40]/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/5 to-[#FF6E40]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <Key className="h-4 w-4 text-blue-600" />
                          </div>
                          <h4 className="text-lg font-bold" style={{ color: '#1E3D59' }}>Two-Factor Authentication</h4>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">Enable 2FA for enhanced security</p>
                      </div>
                      <div className="ml-4">
                        <Switch
                          checked={settings.security.twoFactorAuth}
                          onCheckedChange={(checked) => updateSecuritySetting('twoFactorAuth', checked)}
                          className="data-[state=checked]:bg-[#FF6E40]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="passwordMinLength" className="text-sm font-semibold text-gray-700">Minimum Password Length</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        min="6"
                        max="32"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => updateSecuritySetting('passwordMinLength', parseInt(e.target.value))}
                        className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout" className="text-sm font-semibold text-gray-700">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        min="5"
                        max="480"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value))}
                        className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                <Alert className="border-2 border-orange-200 bg-orange-50/80 backdrop-blur-sm rounded-2xl">
                  <Info className="h-5 w-5 text-orange-600" />
                  <AlertDescription className="text-orange-800 font-medium">
                    Security settings affect all users on the platform. Changes will be applied immediately.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Settings */}
          <TabsContent value="integrations">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/3 to-[#FF6E40]/3 opacity-30"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold" style={{ color: '#1E3D59' }}>Integration Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="space-y-6">
                  <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl p-6 hover:shadow-lg hover:border-[#FF6E40]/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/5 to-[#FF6E40]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <Mail className="h-4 w-4 text-blue-600" />
                          </div>
                          <h4 className="text-lg font-bold" style={{ color: '#1E3D59' }}>SMTP Email</h4>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">Enable custom SMTP for sending emails</p>
                      </div>
                      <div className="ml-4">
                        <Switch
                          checked={settings.integrations.smtpEnabled}
                          onCheckedChange={(checked) => updateIntegrationSetting('smtpEnabled', checked)}
                          className="data-[state=checked]:bg-[#FF6E40]"
                        />
                      </div>
                    </div>
                  </div>

                  {settings.integrations.smtpEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl">
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost" className="text-sm font-semibold text-gray-700">SMTP Host</Label>
                        <Input
                          id="smtpHost"
                          value={settings.integrations.smtpHost}
                          onChange={(e) => updateIntegrationSetting('smtpHost', e.target.value)}
                          placeholder="smtp.gmail.com"
                          className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtpPort" className="text-sm font-semibold text-gray-700">SMTP Port</Label>
                        <Input
                          id="smtpPort"
                          type="number"
                          value={settings.integrations.smtpPort}
                          onChange={(e) => updateIntegrationSetting('smtpPort', parseInt(e.target.value))}
                          className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtpUsername" className="text-sm font-semibold text-gray-700">SMTP Username</Label>
                        <Input
                          id="smtpUsername"
                          value={settings.integrations.smtpUsername}
                          onChange={(e) => updateIntegrationSetting('smtpUsername', e.target.value)}
                          className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword" className="text-sm font-semibold text-gray-700">SMTP Password</Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          value={settings.integrations.smtpPassword}
                          onChange={(e) => updateIntegrationSetting('smtpPassword', e.target.value)}
                          className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}

                  <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl p-6 hover:shadow-lg hover:border-[#FF6E40]/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/5 to-[#FF6E40]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 rounded-lg bg-purple-100">
                            <BarChart3 className="h-4 w-4 text-purple-600" />
                          </div>
                          <h4 className="text-lg font-bold" style={{ color: '#1E3D59' }}>Analytics</h4>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">Enable usage analytics and tracking</p>
                      </div>
                      <div className="ml-4">
                        <Switch
                          checked={settings.integrations.analyticsEnabled}
                          onCheckedChange={(checked) => updateIntegrationSetting('analyticsEnabled', checked)}
                          className="data-[state=checked]:bg-[#FF6E40]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl p-6 hover:shadow-lg hover:border-[#FF6E40]/30 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59]/5 to-[#FF6E40]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 rounded-lg bg-green-100">
                            <Database className="h-4 w-4 text-green-600" />
                          </div>
                          <h4 className="text-lg font-bold" style={{ color: '#1E3D59' }}>Automatic Backups</h4>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">Enable automatic data backups</p>
                      </div>
                      <div className="ml-4">
                        <Switch
                          checked={settings.integrations.backupEnabled}
                          onCheckedChange={(checked) => updateIntegrationSetting('backupEnabled', checked)}
                          className="data-[state=checked]:bg-[#FF6E40]"
                        />
                      </div>
                    </div>
                  </div>

                  {settings.integrations.backupEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency" className="text-sm font-semibold text-gray-700">Backup Frequency</Label>
                      <Select value={settings.integrations.backupFrequency} onValueChange={(value) => updateIntegrationSetting('backupFrequency', value)}>
                        <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6E40]/20 focus:border-[#FF6E40] transition-all duration-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                          <SelectItem value="daily" className="rounded-lg">Daily</SelectItem>
                          <SelectItem value="weekly" className="rounded-lg">Weekly</SelectItem>
                          <SelectItem value="monthly" className="rounded-lg">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Alert className="border-2 border-green-200 bg-green-50/80 backdrop-blur-sm rounded-2xl">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 font-medium">
                    Integration settings are automatically tested when saved. Check the logs for any configuration issues.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}


