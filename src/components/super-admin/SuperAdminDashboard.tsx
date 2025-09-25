
'use client';

import { SuperAdminWelcomeHeader } from './SuperAdminWelcomeHeader';
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
import { useRouter } from 'next/navigation'
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
import { ProgramService } from '@/lib/program-service'
import { toast as sonnerToast } from 'sonner'
import { useSuperAdminData } from '@/hooks/useSuperAdminData'
// ...existing code...


function SuperAdminDashboard() {
  const { user } = useAuth()
  const { unreadCount, stats: notificationStats } = useNotifications()
  const router = useRouter()
  
  // Use optimized data fetching hook
  const { 
    globalStats, 
    learnerDistribution, 
    learnerProvince, 
    recentActivity, 
    systemMetrics, 
    loading, 
    error, 
    refresh, 
    lastUpdated 
  } = useSuperAdminData()
  
  // Client-side only state to prevent hydration issues
  const [mounted, setMounted] = useState(false)
  
  // Additional state for UI
  const [refreshing, setRefreshing] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcastRole, setBroadcastRole] = useState('all')
  const [broadcastLoading, setBroadcastLoading] = useState(false)

  // Set mounted to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refresh()
    } catch (error) {
      console.error('Error refreshing data:', error)
      sonnerToast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
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

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const getProgramName = (programId: string) => {
    return programId || 'Unknown Program'
  }

  // Show loading state until component is mounted
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Super Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <FirestoreErrorHandler>
      <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
        {/* Enhanced Welcome Header with Glassmorphism */}
        <SuperAdminWelcomeHeader 
          userName={user?.displayName || user?.email?.split('@')[0] || "Super Admin"} 
        />

        {/* Real-time Status Bar */}
        <div className="relative">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-100/80 backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                  <span className="text-sm font-medium text-green-700">Live Data</span>
                </div>
                
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-100/80 backdrop-blur-sm">
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-yellow-100/80 backdrop-blur-sm">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">
                    Updated {lastUpdated?.toLocaleTimeString() || 'Never'}
                  </span>
                </div>
                
                {unreadCount > 0 && (
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-100/80 backdrop-blur-sm">
                    <Bell className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">
                      {unreadCount} notifications
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="font-semibold">Refresh</span>
                </Button>
              </div>
            </div>
          </div>
        </div>


        {/* Enhanced Global Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users Card */}
          <div className="relative group">
            <Card className="relative bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1 text-slate-600">Total Users</p>
                    <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {globalStats.totalUsers.toLocaleString()}
                    </p>
                    <p className="text-sm mb-3 text-slate-500">All platform users</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                      <span className="text-xs font-medium text-green-600">Live</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-blue-600 to-purple-600">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Learners: {globalStats.totalLearners}</span>
                  <span className="text-slate-600">Applicants: {globalStats.totalApplicants}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Administrators Card */}
          <div className="relative group">
            <Card className="relative bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-lg"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1 text-slate-600">Administrators</p>
                    <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {globalStats.totalAdmins}
                    </p>
                    <p className="text-sm mb-3 text-slate-500">Admin & Super Admin users</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                      <span className="text-xs font-medium text-green-600">Live</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-purple-600 to-pink-600">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">System Health: {globalStats.systemHealth}%</span>
                  <span className="text-slate-600">Uptime: {globalStats.uptime}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Placements Card */}
          <div className="relative group">
            <Card className="relative bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-lg"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1 text-slate-600">Active Placements</p>
                    <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      {globalStats.activePlacements}
                    </p>
                    <p className="text-sm mb-3 text-slate-500">Current work placements</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                      <span className="text-xs font-medium text-green-600">Live</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-yellow-600 to-orange-600">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-yellow-500 to-orange-500" 
                    style={{ 
                      width: `${Math.min((globalStats.activePlacements / 100) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Applications Card */}
          <div className="relative group">
            <Card className="relative bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-lg"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1 text-slate-600">Pending Applications</p>
                    <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      {globalStats.pendingApplications}
                    </p>
                    <p className="text-sm mb-3 text-slate-500">Awaiting review</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                      <span className="text-xs font-medium text-green-600">Live</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-red-600 to-pink-600">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 to-pink-500" 
                    style={{ 
                      width: `${Math.min((globalStats.pendingApplications / 50) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-2 text-slate-600">CPU Usage</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{systemMetrics.cpuUsage}%</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100">
                  <Cpu className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <Progress value={systemMetrics.cpuUsage} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-2 text-slate-600">Memory Usage</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{systemMetrics.memoryUsage}%</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100">
                  <HardDrive className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <Progress value={systemMetrics.memoryUsage} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-2 text-slate-600">Disk Usage</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{systemMetrics.diskUsage}%</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-orange-100 to-red-100">
                  <Database className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <Progress value={systemMetrics.diskUsage} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-2 text-slate-600">Network Latency</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{systemMetrics.networkLatency}ms</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100">
                  <Network className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-500">
                {systemMetrics.networkLatency < 20 ? 'Excellent' : systemMetrics.networkLatency < 50 ? 'Good' : 'Fair'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Broadcast Announcement */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border border-white/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-purple-600 to-pink-600">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Broadcast Announcement</span>
              <Badge className="ml-auto bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">Super Admin Only</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleBroadcast}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Title</label>
                  <input
                    className="w-full rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-2 border-slate-200 bg-white/80 backdrop-blur-sm"
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    placeholder="Announcement Title"
                    maxLength={80}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Audience</label>
                  <select
                    className="w-full rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-2 border-slate-200 bg-white/80 backdrop-blur-sm"
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
                <label className="block text-sm font-semibold mb-2 text-slate-700">Message</label>
                <textarea
                  className="w-full rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-2 border-slate-200 bg-white/80 backdrop-blur-sm"
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
                  className="px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0"
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

        {/* Super Admin Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* User Management */}
          <Card 
            className="group bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20"
            onClick={() => handleNavigation('/super-admin/users')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-blue-600 to-purple-600">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800">User Management</h3>
                  <p className="text-sm text-slate-600">Manage all platform users</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card 
            className="group bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20"
            onClick={() => handleNavigation('/super-admin/analytics')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-purple-600 to-pink-600">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800">Analytics</h3>
                  <p className="text-sm text-slate-600">Platform insights & reports</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card 
            className="group bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20"
            onClick={() => handleNavigation('/super-admin/system-health')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-orange-600 to-red-600">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800">System Health</h3>
                  <p className="text-sm text-slate-600">Monitor system performance</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card 
            className="group bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20"
            onClick={() => handleNavigation('/super-admin/security')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-yellow-600 to-orange-600">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800">Security</h3>
                  <p className="text-sm text-slate-600">Security monitoring & audit</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          {/* AI Reports */}
          <Card 
            className="group bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20"
            onClick={() => handleNavigation('/super-admin/ai-reports')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-indigo-600 to-purple-600">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800">AI Reports</h3>
                  <p className="text-sm text-slate-600">AI-powered analytics</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          {/* Attendance */}
          <Card 
            className="group bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20"
            onClick={() => handleNavigation('/super-admin/attendance')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-green-600 to-emerald-600">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800">Attendance</h3>
                  <p className="text-sm text-slate-600">Track learner attendance</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          {/* Programs */}
          <Card 
            className="group bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20"
            onClick={() => handleNavigation('/super-admin/programs')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-teal-600 to-blue-600">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800">Programs</h3>
                  <p className="text-sm text-slate-600">Manage training programs</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card 
            className="group bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20"
            onClick={() => handleNavigation('/super-admin/settings')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-slate-600 to-gray-600">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800">Settings</h3>
                  <p className="text-sm text-slate-600">Platform configuration</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          {/* Learners */}
          <Card 
            className="group bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20"
            onClick={() => handleNavigation('/super-admin/learners')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-cyan-600 to-blue-600">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800">Learners</h3>
                  <p className="text-sm text-slate-600">Manage learner profiles</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          {/* Reports */}
          <Card 
            className="group bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20"
            onClick={() => handleNavigation('/super-admin/reports')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-violet-600 to-purple-600">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800">Reports</h3>
                  <p className="text-sm text-slate-600">Generate platform reports</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          {/* Audit */}
          <Card 
            className="group bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20"
            onClick={() => handleNavigation('/super-admin/audit')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-red-600 to-pink-600">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800">Audit Logs</h3>
                  <p className="text-sm text-slate-600">System activity logs</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card 
            className="group bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20"
            onClick={() => handleNavigation('/super-admin/performance')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-emerald-600 to-green-600">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800">Performance</h3>
                  <p className="text-sm text-slate-600">System performance metrics</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          {/* Inbox */}
          <Card 
            className="group bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20"
            onClick={() => handleNavigation('/super-admin/inbox')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-amber-600 to-orange-600">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800">Inbox</h3>
                  <p className="text-sm text-slate-600">Messages & notifications</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          {/* Grant Permissions */}
          <Card 
            className="group bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-white/20"
            onClick={() => handleNavigation('/super-admin/grant-permissions')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-rose-600 to-red-600">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800">Permissions</h3>
                  <p className="text-sm text-slate-600">Grant user permissions</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Charts */}
          <div className="space-y-8">
            {/* Learner Distribution by Program */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border border-white/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-blue-600 to-purple-600">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Learner Distribution by Program</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Loading data...</p>
                    </div>
                  </div>
                ) : (
                  <LearnerDistributionChart data={learnerDistribution} />
                )}
              </CardContent>
            </Card>

            {/* Learner Distribution by Province */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border border-white/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-yellow-600 to-orange-600">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Geographic Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LearnerProvinceChart data={learnerProvince} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Tools and Recent Activity */}
          <div className="space-y-8">
            {/* AI Report Generator */}
            <div className="bg-white/90 backdrop-blur-sm shadow-2xl border border-white/20 rounded-2xl overflow-hidden">
              <AiReportGenerator platformData={{
                totalUsers: globalStats.totalUsers || 0,
                totalLearners: globalStats.totalLearners || 0,
                totalApplicants: globalStats.pendingApplications || 0,
                activePlacements: globalStats.activePlacements || 0,
                learnerDistribution: learnerDistribution || [],
                learnerProvince: learnerProvince || [],
                recentActivity: recentActivity.map((a: any) => ({
                  id: a.id || '',
                  adminName: typeof a.adminName === 'string' ? a.adminName : '',
                  action: typeof a.action === 'string' ? a.action : '',
                  target: typeof a.target === 'string' ? a.target : null,
                  timestamp: typeof a.timestamp === 'string' ? a.timestamp : '',
                  details: typeof a.details === 'string' ? a.details : null,
                  adminRole: typeof a.adminRole === 'string' ? a.adminRole : ''
                }))
              }} />
            </div>

            <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border border-white/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-orange-600 to-red-600">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Recent Platform Activity</span>
                  <div className="ml-auto flex items-center space-x-2 px-3 py-1 rounded-full bg-green-100/80 backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-sm font-medium text-green-700">Live</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivity activities={recentActivity.map((a: any) => ({
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
