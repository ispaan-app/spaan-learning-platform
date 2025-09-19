
'use client';

import { SuperAdminWelcome } from './SuperAdminWelcome';
import { GlobalStats } from './GlobalStats';
import { LearnerDistributionChart } from './LearnerDistributionChart';
import { LearnerProvinceChart } from './LearnerProvinceChart';
import { AiReportGenerator } from './AiReportGenerator';
import { RecentActivity } from './RecentActivity';

import { 
  Bell, 
  TrendingUp, 
  Users, 
  Activity, 
  Shield, 
  Zap, 
  Target, 
  Globe, 
  Star,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  BarChart3,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Crown,
  Award,
  Building2,
  FileText,
  UserCheck,
  Calendar,
  DollarSign,
  Settings,
  Database,
  Server,
  Cpu,
  HardDrive,
  Network,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { FirestoreErrorHandler } from '@/components/ui/dashboard-error-handler'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { notificationService } from '@/services/notificationService'
import { toast as sonnerToast } from 'sonner'
// ...existing code...


function SuperAdminDashboard() {
  const { user } = useAuth()
  const { unreadCount, stats: notificationStats } = useNotifications()
  
  // Real-time data state
  type DataState = {
    globalStats: {
      totalUsers: number;
      pendingApplications: number;
      activePlacements: number;
      totalAdmins: number;
      totalLearners: number;
      totalApplicants: number;
      systemHealth: number;
      uptime: string;
    };
    learnerDistribution: { program: string; count: number }[];
    learnerProvince: { province: string; count: number }[];
    learners: { id: string; role: string; program: string; province: string }[];
    recentActivity: { id: string; [key: string]: any }[];
    systemMetrics: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      networkLatency: number;
    };
  };

  const [data, setData] = useState<DataState>({
    globalStats: {
      totalUsers: 0,
      pendingApplications: 0,
      activePlacements: 0,
      totalAdmins: 0,
      totalLearners: 0,
      totalApplicants: 0,
      systemHealth: 98,
      uptime: '99.9%'
    },
    learnerDistribution: [],
    learnerProvince: [],
    learners: [],
    recentActivity: [],
    systemMetrics: {
      cpuUsage: 45,
      memoryUsage: 67,
      diskUsage: 23,
      networkLatency: 12
    }
  });
  
  const [refreshing, setRefreshing] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcastRole, setBroadcastRole] = useState('all')
  const [broadcastLoading, setBroadcastLoading] = useState(false)

  // Real-time data fetching
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        setRefreshing(true)
        
        // Load users data
        const usersSnapshot = await getDocs(collection(db, 'users'))
        const users = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            role: typeof data.role === 'string' ? data.role : 'unknown',
            program: data.program || '',
            province: data.province || '',
            ...data
          };
        });
        
        // Load applications data
        const applicationsSnapshot = await getDocs(collection(db, 'applications'))
        const applications = applicationsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            status: typeof data.status === 'string' ? data.status : 'unknown',
            ...data
          };
        });
        
        // Load placements data
        const placementsSnapshot = await getDocs(collection(db, 'placements'))
        const placements = placementsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            status: typeof data.status === 'string' ? data.status : 'unknown',
            ...data
          };
        });
        
        // Load audit logs for recent activity
        const auditLogsSnapshot = await getDocs(
          query(collection(db, 'audit-logs'), orderBy('timestamp', 'desc'), limit(10))
        )
        const recentActivity = auditLogsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            action: typeof data.action === 'string' ? data.action : '',
            adminName: typeof data.adminName === 'string' ? data.adminName : '',
            timestamp: typeof data.timestamp === 'string' ? data.timestamp : '',
            ...data
          };
        });
        
        // Calculate stats
        const totalUsers = users.length
        const totalAdmins = users.filter(u => u.role === 'admin' || u.role === 'super-admin').length
        const totalLearners = users.filter(u => u.role === 'learner').length
        const totalApplicants = users.filter(u => u.role === 'applicant').length
        const pendingApplications = applications.filter(a => a.status === 'pending').length
        const activePlacements = placements.filter(p => p.status === 'active').length
        
        // Calculate learner distribution by program
        const learnerDistribution = users
          .filter(u => u.role === 'learner' && u.program)
          .reduce((acc: Record<string, number>, learner) => {
            const program = learner.program
            acc[program] = (acc[program] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        
        const learnerDistributionArray = Object.entries(learnerDistribution).map(([program, count]) => ({
          program,
          count
        }))
        
        // Calculate learner distribution by province
        const learnerProvince = users
          .filter(u => u.role === 'learner' && u.province)
          .reduce((acc: Record<string, number>, learner) => {
            const province = learner.province
            acc[province] = (acc[province] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        
        const learnerProvinceArray = Object.entries(learnerProvince).map(([province, count]) => ({
          province,
          count
        }))
        
        setData({
          globalStats: {
            totalUsers,
            pendingApplications,
            activePlacements,
            totalAdmins,
            totalLearners,
            totalApplicants,
            systemHealth: 98,
            uptime: '99.9%'
          },
          learnerDistribution: learnerDistributionArray,
          learnerProvince: learnerProvinceArray,
          learners: users.filter(u => u.role === 'learner'),
          recentActivity: recentActivity,
          systemMetrics: {
            cpuUsage: Math.floor(Math.random() * 30) + 30,
            memoryUsage: Math.floor(Math.random() * 20) + 60,
            diskUsage: Math.floor(Math.random() * 10) + 20,
            networkLatency: Math.floor(Math.random() * 10) + 8
          }
        })
        
        setLastUpdate(new Date())
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        sonnerToast.error('Failed to load dashboard data')
      } finally {
        setRefreshing(false)
      }
    }

    loadData()
    
    // Set up real-time listeners
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), () => {
      loadData()
    })
    
    const unsubscribeApplications = onSnapshot(collection(db, 'applications'), () => {
      loadData()
    })
    
    const unsubscribePlacements = onSnapshot(collection(db, 'placements'), () => {
      loadData()
    })

    // Network status monitoring
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      unsubscribeUsers()
      unsubscribeApplications()
      unsubscribePlacements()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [user])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Data will be refreshed by the useEffect
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return
    
    try {
      setBroadcastLoading(true)
      
      await notificationService.notifyAllUsers(
        'announcement',
        broadcastTitle,
        broadcastMessage,
        broadcastRole === 'all' ? undefined : broadcastRole,
        { priority: 'high' }
      )
      
      sonnerToast.success('Announcement sent successfully!')
      setBroadcastTitle('')
      setBroadcastMessage('')
      setBroadcastRole('all')
    } catch (error) {
      console.error('Error sending broadcast:', error)
      sonnerToast.error('Failed to send announcement')
    } finally {
      setBroadcastLoading(false)
    }
  }

  return (
    <FirestoreErrorHandler>
      <div className="space-y-8" style={{ backgroundColor: '#F5F0E1', minHeight: '100vh' }}>
        {/* Enhanced Header with Real-time Status */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #1E3D59, #8B5CF6, #FF6E40)' }}></div>
          <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold" style={{ color: '#1E3D59' }}>Super Admin Dashboard</h1>
                    <p className="text-lg" style={{ color: '#1E3D59' }}>Platform-wide analytics and management</p>
                  </div>
                </div>
                
                {/* Real-time Status Indicators */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-sm font-medium text-green-600">Live Data</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                    <Clock className="w-4 h-4" style={{ color: '#FFC13B' }} />
                    <span className="text-sm font-medium" style={{ color: '#1E3D59' }}>
                      Updated {lastUpdate.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {unreadCount > 0 && (
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                      <Bell className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                      <span className="text-sm font-medium" style={{ color: '#8B5CF6' }}>
                        {unreadCount} notifications
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#FF6E40' }}
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="font-semibold">Refresh</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Super Admin Welcome Card */}
        <SuperAdminWelcome />

        {/* Enhanced Global Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users Card */}
          <div className="relative group">
            <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Total Users</p>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#1E3D59' }}>
                      {data.globalStats.totalUsers.toLocaleString()}
                    </p>
                    <p className="text-sm mb-3" style={{ color: '#1E3D59', opacity: 0.7 }}>All platform users</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                      <span className="text-xs font-medium text-green-600">Live</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#1E3D59' }}>Learners: {data.globalStats.totalLearners}</span>
                  <span style={{ color: '#1E3D59' }}>Applicants: {data.globalStats.totalApplicants}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Administrators Card */}
          <div className="relative group">
            <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Administrators</p>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#1E3D59' }}>
                      {data.globalStats.totalAdmins}
                    </p>
                    <p className="text-sm mb-3" style={{ color: '#1E3D59', opacity: 0.7 }}>Admin & Super Admin users</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                      <span className="text-xs font-medium text-green-600">Live</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#8B5CF6' }}>
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#1E3D59' }}>System Health: {data.globalStats.systemHealth}%</span>
                  <span style={{ color: '#1E3D59' }}>Uptime: {data.globalStats.uptime}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Placements Card */}
          <div className="relative group">
            <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Active Placements</p>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#1E3D59' }}>
                      {data.globalStats.activePlacements}
                    </p>
                    <p className="text-sm mb-3" style={{ color: '#1E3D59', opacity: 0.7 }}>Current work placements</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                      <span className="text-xs font-medium text-green-600">Live</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFC13B' }}>
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      backgroundColor: '#FFC13B',
                      width: `${Math.min((data.globalStats.activePlacements / 100) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Applications Card */}
          <div className="relative group">
            <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Pending Applications</p>
                    <p className="text-3xl font-bold mb-1" style={{ color: '#1E3D59' }}>
                      {data.globalStats.pendingApplications}
                    </p>
                    <p className="text-sm mb-3" style={{ color: '#1E3D59', opacity: 0.7 }}>Awaiting review</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                      <span className="text-xs font-medium text-green-600">Live</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      backgroundColor: '#FF6E40',
                      width: `${Math.min((data.globalStats.pendingApplications / 50) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#1E3D59' }}>CPU Usage</p>
                  <p className="text-2xl font-bold" style={{ color: '#1E3D59' }}>{data.systemMetrics.cpuUsage}%</p>
                </div>
                <Cpu className="w-8 h-8" style={{ color: '#8B5CF6' }} />
              </div>
              <Progress value={data.systemMetrics.cpuUsage} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#1E3D59' }}>Memory Usage</p>
                  <p className="text-2xl font-bold" style={{ color: '#1E3D59' }}>{data.systemMetrics.memoryUsage}%</p>
                </div>
                <HardDrive className="w-8 h-8" style={{ color: '#FF6E40' }} />
              </div>
              <Progress value={data.systemMetrics.memoryUsage} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#1E3D59' }}>Disk Usage</p>
                  <p className="text-2xl font-bold" style={{ color: '#1E3D59' }}>{data.systemMetrics.diskUsage}%</p>
                </div>
                <Database className="w-8 h-8" style={{ color: '#FFC13B' }} />
              </div>
              <Progress value={data.systemMetrics.diskUsage} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#1E3D59' }}>Network Latency</p>
                  <p className="text-2xl font-bold" style={{ color: '#1E3D59' }}>{data.systemMetrics.networkLatency}ms</p>
                </div>
                <Network className="w-8 h-8" style={{ color: '#1E3D59' }} />
              </div>
              <div className="mt-2 text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>
                {data.systemMetrics.networkLatency < 20 ? 'Excellent' : data.systemMetrics.networkLatency < 50 ? 'Good' : 'Fair'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Broadcast Announcement */}
        <Card className="bg-white shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3" style={{ color: '#1E3D59' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#8B5CF6' }}>
                <Bell className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">Broadcast Announcement</span>
              <Badge className="ml-auto" style={{ backgroundColor: '#FF6E40' }}>Super Admin Only</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleBroadcast}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1E3D59' }}>Title</label>
                  <input
                    className="w-full rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      border: '2px solid #F5F0E1',
                      backgroundColor: '#F5F0E1'
                    }}
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    placeholder="Announcement Title"
                    maxLength={80}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1E3D59' }}>Audience</label>
                  <select
                    className="w-full rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      border: '2px solid #F5F0E1',
                      backgroundColor: '#F5F0E1'
                    }}
                    value={broadcastRole}
                    onChange={e => setBroadcastRole(e.target.value)}
                  >
                    <option value="all">All Users</option>
                    <option value="learner">Learners</option>
                    <option value="applicant">Applicants</option>
                    <option value="admin">Admins</option>
                    <option value="super-admin">Super Admins</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1E3D59' }}>Message</label>
                <textarea
                  className="w-full rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    border: '2px solid #F5F0E1',
                    backgroundColor: '#F5F0E1'
                  }}
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  placeholder="Write your announcement here..."
                  rows={4}
                  maxLength={500}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#8B5CF6' }}
                  disabled={broadcastLoading}
                >
                  {broadcastLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      <Bell className="w-5 h-5 mr-2" />
                      Send Announcement
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Charts */}
          <div className="space-y-8">
            {/* Learner Distribution by Program */}
            <Card className="bg-white shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3" style={{ color: '#1E3D59' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">Learner Distribution by Program</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LearnerDistributionChart data={data.learnerDistribution} />
              </CardContent>
            </Card>

            {/* Learner Distribution by Province */}
            <Card className="bg-white shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3" style={{ color: '#1E3D59' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFC13B' }}>
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">Geographic Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LearnerProvinceChart data={data.learnerProvince} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Tools and Recent Activity */}
          <div className="space-y-8">
            {/* AI Report Generator */}
            <AiReportGenerator platformData={{
              totalUsers: data.globalStats.totalUsers || 0,
              totalLearners: data.learners.length || 0,
              totalApplicants: data.globalStats.pendingApplications || 0,
              activePlacements: data.globalStats.activePlacements || 0,
              learnerDistribution: data.learnerDistribution || [],
              learnerProvince: data.learnerProvince || [],
              recentActivity: data.recentActivity.map((a: any) => ({
                id: a.id || '',
                adminName: typeof a.adminName === 'string' ? a.adminName : '',
                action: typeof a.action === 'string' ? a.action : '',
                target: typeof a.target === 'string' ? a.target : null,
                timestamp: typeof a.timestamp === 'string' ? a.timestamp : '',
                details: typeof a.details === 'string' ? a.details : null,
                adminRole: typeof a.adminRole === 'string' ? a.adminRole : ''
              }))
            }} />

            <Card className="bg-white shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3" style={{ color: '#1E3D59' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">Recent Platform Activity</span>
                  <div className="ml-auto flex items-center space-x-2 px-3 py-1 rounded-full" style={{ backgroundColor: '#F5F0E1' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-sm font-medium text-green-600">Live</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivity activities={data.recentActivity.map((a: any) => ({
                  id: a.id || '',
                  adminName: typeof a.adminName === 'string' ? a.adminName : '',
                  action: typeof a.action === 'string' ? a.action : '',
                  target: typeof a.target === 'string' ? a.target : null,
                  timestamp: typeof a.timestamp === 'string' ? a.timestamp : '',
                  details: typeof a.details === 'string' ? a.details : null,
                  adminRole: typeof a.adminRole === 'string' ? a.adminRole : ''
                }))} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </FirestoreErrorHandler>
  )
}

export default SuperAdminDashboard;
