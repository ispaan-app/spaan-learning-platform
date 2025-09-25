'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Upload,
  FileText,
  Calendar,
  TrendingUp,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  Key,
  Settings,
  Activity,
  Target,
  UserPlus,
  UserMinus,
  Archive,
  Lock,
  Unlock,
  X,
  Crown,
  Wifi,
  WifiOff,
  Zap,
  Star,
  Globe,
  Database,
  Server,
  Cpu,
  HardDrive,
  Network,
  Bell,
  Sparkles,
  Loader2,
  BookOpen,
  User
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc, deleteDoc, addDoc, onSnapshot } from 'firebase/firestore'
import { UserManagementTable } from '@/components/super-admin/UserManagementTable'
import { CompactUserForm } from '@/components/super-admin/CompactUserForm'
import { UserStats } from '@/components/super-admin/UserStats'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

interface User {
  id: string
  uid: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
  role: 'applicant' | 'learner' | 'admin' | 'super-admin'
  status?: 'active' | 'inactive' | 'pending' | 'suspended'
  createdAt?: string
  updatedAt?: string
  lastLoginAt?: string
  loginCount?: number
  activeProgram?: string
  assignedPrograms?: string[]
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
    department?: string
    position?: string
    location?: string
    bio?: string
    avatar?: string
  }
  permissions?: string[]
  metadata?: {
    source?: string
    referralCode?: string
    tags?: string[]
    notes?: string
  }
  isOnline?: boolean
  lastSeen?: string
}

export default function SuperAdminUsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'analytics'>('table')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [realTimeStats, setRealTimeStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    suspended: 0,
    newThisWeek: 0,
    newThisMonth: 0,
    lastLoginToday: 0,
    neverLoggedIn: 0,
    onlineUsers: 0,
    systemHealth: 'excellent'
  })
  const [roleStats, setRoleStats] = useState({
    'super-admin': 0,
    'admin': 0,
    'learner': 0,
    'applicant': 0
  })
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast()

  // Real-time data processing
  const processUsersData = (usersData: User[]) => {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      const total = usersData.length
      const active = usersData.filter(u => u.status === 'active').length
      const pending = usersData.filter(u => u.status === 'pending' || !u.status).length
      const inactive = usersData.filter(u => u.status === 'inactive').length
      const suspended = usersData.filter(u => u.status === 'suspended').length
      
      const newThisWeek = usersData.filter(u => {
        const createdAt = new Date(u.createdAt || '')
        return createdAt >= oneWeekAgo
      }).length
      
      const newThisMonth = usersData.filter(u => {
        const createdAt = new Date(u.createdAt || '')
        return createdAt >= oneMonthAgo
      }).length
      
      const lastLoginToday = usersData.filter(u => {
        if (!u.lastLoginAt) return false
        const lastLogin = new Date(u.lastLoginAt)
        return lastLogin >= todayStart
      }).length
      
      const neverLoggedIn = usersData.filter(u => !u.lastLoginAt).length
    const onlineUsers = usersData.filter(u => u.isOnline).length
      
      // Calculate role statistics
      const roleStatsData = {
        'super-admin': usersData.filter(u => u.role === 'super-admin').length,
        'admin': usersData.filter(u => u.role === 'admin').length,
        'learner': usersData.filter(u => u.role === 'learner').length,
        'applicant': usersData.filter(u => u.role === 'applicant').length
      }
      
    setRealTimeStats({ 
        total, 
        active, 
        pending, 
        inactive, 
        suspended,
        newThisWeek,
        newThisMonth,
        lastLoginToday,
      neverLoggedIn,
      onlineUsers,
      systemHealth: onlineUsers > total * 0.8 ? 'excellent' : onlineUsers > total * 0.5 ? 'good' : 'poor'
      })
    
      setRoleStats(roleStatsData)
    setLastUpdate(new Date())
  }

  // Load users from Firestore
  const loadUsers = async () => {
    try {
      setLoading(true)
      console.log('Loading users from Firestore...')
      
      // Try to get users with orderBy, fallback to basic collection if it fails
      let usersSnapshot
      try {
        console.log('Attempting to load users with orderBy...')
        usersSnapshot = await getDocs(
          query(collection(db, 'users'), orderBy('createdAt', 'desc'))
        )
        console.log('Users loaded with orderBy successfully:', usersSnapshot.size, 'documents')
      } catch (orderByError) {
        console.warn('OrderBy failed, falling back to basic collection query:', orderByError)
        usersSnapshot = await getDocs(collection(db, 'users'))
        console.log('Users loaded with basic query:', usersSnapshot.size, 'documents')
      }
      
      if (!usersSnapshot || usersSnapshot.empty) {
        console.log('No users found in database')
        setUsers([])
        processUsersData([])
        return
      }
      
      const usersData = usersSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          firstName: data.firstName || data.profile?.firstName || '',
          lastName: data.lastName || data.profile?.lastName || '',
          role: data.role || 'applicant',
          status: data.status || 'pending',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          lastLoginAt: data.lastLoginAt,
          activeProgram: data.activeProgram || '',
          assignedPrograms: data.assignedPrograms || [],
          profile: data.profile || {},
          permissions: data.permissions || [],
          isOnline: data.isOnline || false,
          lastSeen: data.lastSeen || data.lastLoginAt
        }
      }) as User[]

      console.log('Processed users data:', usersData.length, 'users')
      setUsers(usersData)
      processUsersData(usersData)
      
    } catch (error) {
      console.error('Error loading users:', error)
      toastError(`Failed to load users: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Real-time data subscription
  useEffect(() => {
    if (!currentUser) {
      console.log('No current user, skipping real-time setup')
      return
    }

    console.log('Setting up real-time subscription for user:', currentUser.uid)
    let unsubscribe: (() => void) | null = null

    const processSnapshot = (snapshot: any) => {
      console.log('Processing snapshot with', snapshot.docs.length, 'documents')
      
      const usersData = snapshot.docs.map((doc: any) => {
        const data = doc.data()
        return {
          id: doc.id,
          uid: doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          firstName: data.firstName || data.profile?.firstName || '',
          lastName: data.lastName || data.profile?.lastName || '',
          role: data.role || 'applicant',
          status: data.status || 'pending',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          lastLoginAt: data.lastLoginAt,
          activeProgram: data.activeProgram || '',
          assignedPrograms: data.assignedPrograms || [],
          profile: data.profile || {},
          permissions: data.permissions || [],
          isOnline: data.isOnline || false,
          lastSeen: data.lastSeen || data.lastLoginAt
        }
      }) as User[]

      // Sort by createdAt manually
      const sortedUsers = usersData.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return dateB - dateA // Descending order
      })

      console.log('Setting users:', sortedUsers.length)
      setUsers(sortedUsers)
      processUsersData(sortedUsers)
    }

    const setupSubscription = () => {
      try {
        // Try with orderBy first
        console.log('Attempting real-time subscription with orderBy...')
        unsubscribe = onSnapshot(
          query(collection(db, 'users'), orderBy('createdAt', 'desc')),
          processSnapshot,
          (error) => {
            console.error('OrderBy subscription failed, trying basic query:', error)
            // Fallback to basic collection
            try {
              unsubscribe = onSnapshot(
                collection(db, 'users'),
                processSnapshot,
                (fallbackError) => {
                  console.error('Basic subscription also failed:', fallbackError)
                  toastError('Failed to connect to database')
                }
              )
            } catch (fallbackError) {
              console.error('Error setting up fallback subscription:', fallbackError)
              toastError('Database connection failed')
            }
          }
        )
      } catch (error) {
        console.error('Error setting up orderBy subscription:', error)
        // Try basic collection
        try {
          unsubscribe = onSnapshot(
            collection(db, 'users'),
            processSnapshot,
            (basicError) => {
              console.error('Basic subscription failed:', basicError)
              toastError('Failed to connect to database')
            }
          )
        } catch (basicError) {
          console.error('Error setting up basic subscription:', basicError)
          toastError('Database connection failed')
        }
      }
    }

    // Initial load
    console.log('Starting initial load...')
    loadUsers()

    // Set up real-time subscription
    setupSubscription()

    // Network status monitoring
    const handleOnline = () => {
      console.log('Network came online')
      setIsOnline(true)
    }
    const handleOffline = () => {
      console.log('Network went offline')
      setIsOnline(false)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      console.log('Cleaning up real-time subscription...')
      if (unsubscribe) {
        unsubscribe()
      }
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [currentUser?.uid]) // Only depend on user ID, not the whole user object

  // Filter and sort users based on search and filters
  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profile?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profile?.position?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      
      let matchesDate = true
      if (dateFilter !== 'all') {
        const now = new Date()
        const userCreatedAt = new Date(user.createdAt || '')
        
        switch (dateFilter) {
          case 'today':
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            matchesDate = userCreatedAt >= todayStart
            break
          case 'week':
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDate = userCreatedAt >= oneWeekAgo
            break
          case 'month':
            const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            matchesDate = userCreatedAt >= oneMonthAgo
            break
          case 'year':
            const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            matchesDate = userCreatedAt >= oneYearAgo
            break
        }
      }
      
      return matchesSearch && matchesRole && matchesStatus && matchesDate
    })
    .sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.displayName || `${a.firstName} ${a.lastName}` || a.email
          bValue = b.displayName || `${b.firstName} ${b.lastName}` || b.email
          break
        case 'email':
          aValue = a.email
          bValue = b.email
          break
        case 'role':
          aValue = a.role
          bValue = b.role
          break
        case 'status':
          aValue = a.status || 'pending'
          bValue = b.status || 'pending'
          break
        case 'lastLogin':
          aValue = a.lastLoginAt ? new Date(a.lastLoginAt) : new Date(0)
          bValue = b.lastLoginAt ? new Date(b.lastLoginAt) : new Date(0)
          break
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || '')
          bValue = new Date(b.createdAt || '')
          break
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const filteredUsers = filteredAndSortedUsers

  // Handle user actions
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowUserForm(true)
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setShowUserForm(true)
  }

  const handleUserFormClose = () => {
    setShowUserForm(false)
    setEditingUser(null)
    loadUsers() // Refresh the list
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const safeCurrentStatus = currentStatus || 'pending'
      const newStatus = safeCurrentStatus === 'active' ? 'inactive' : 'active'
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      
      toastSuccess(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
      
      loadUsers() // Refresh the list
    } catch (error) {
      console.error('Error updating user status:', error)
      toastError("Failed to update user status")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'users', userId))
      
      toastSuccess("User deleted successfully")
      
      loadUsers() // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error)
      toastError("Failed to delete user")
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toastError("Please select users first")
      return
    }

    try {
      for (const userId of selectedUsers) {
        switch (action) {
          case 'activate':
            await updateDoc(doc(db, 'users', userId), {
              status: 'active',
              updatedAt: new Date().toISOString()
            })
            break
          case 'deactivate':
            await updateDoc(doc(db, 'users', userId), {
              status: 'inactive',
              updatedAt: new Date().toISOString()
            })
            break
          case 'suspend':
            await updateDoc(doc(db, 'users', userId), {
              status: 'suspended',
              updatedAt: new Date().toISOString()
            })
            break
          case 'delete':
            await deleteDoc(doc(db, 'users', userId))
            break
          case 'export':
            // Export functionality will be handled separately
            break
        }
      }
      
      if (action !== 'export') {
        toastSuccess(`Bulk ${action} completed for ${selectedUsers.length} users`)
        setSelectedUsers([])
        loadUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toastError("Failed to perform bulk action")
    }
  }

  const handleRefresh = async () => {
    if (refreshing) return // Prevent multiple simultaneous refreshes
    
    setRefreshing(true)
    try {
      console.log('Manual refresh triggered...')
      
      // Force reload by clearing users first
      setUsers([])
      
      // Wait a moment then reload
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Reload users
      await loadUsers()
      
      toastSuccess('Users data refreshed successfully')
    } catch (error) {
      console.error('Error refreshing users:', error)
      toastError('Failed to refresh users data')
    } finally {
      setRefreshing(false)
    }
  }

  const handleExportUsers = async () => {
    try {
      const usersToExport = selectedUsers.length > 0 
        ? filteredUsers.filter(user => selectedUsers.includes(user.id))
        : filteredUsers

      const exportData = usersToExport.map(user => ({
        'User ID': user.id,
        'Email': user.email,
        'Name': user.displayName || `${user.firstName} ${user.lastName}` || 'N/A',
        'Role': user.role,
        'Status': user.status || 'pending',
        'Department': user.profile?.department || 'N/A',
        'Position': user.profile?.position || 'N/A',
        'Phone': user.profile?.phone || 'N/A',
        'Active Program': user.activeProgram || 'N/A',
        'Assigned Programs': user.assignedPrograms?.join(', ') || 'N/A',
        'Created At': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
        'Last Login': user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never',
        'Login Count': user.loginCount || 0,
        'Online Status': user.isOnline ? 'Online' : 'Offline'
      }))

      const csvContent = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

      toastSuccess(`Exported ${usersToExport.length} users successfully`)
    } catch (error) {
      console.error('Error exporting users:', error)
      toastError("Failed to export users")
    }
  }

  return (
    <AdminLayout userRole="super-admin">
      <div className="space-y-6">
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
                    <h1 className="text-4xl font-bold" style={{ color: '#1E3D59' }}>User Management</h1>
                    <p className="text-lg" style={{ color: '#1E3D59' }}>Comprehensive user administration and real-time analytics</p>
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
                      <WifiOff className="w-4 h-4 text-gray-500" />
                    )}
                    <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                    <Clock className="w-4 h-4" style={{ color: '#FFC13B' }} />
                    <span className="text-sm font-medium" style={{ color: '#1E3D59' }}>
                      Updated {lastUpdate.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                    <Users className="w-4 h-4" style={{ color: '#FF6E40' }} />
                    <span className="text-sm font-medium" style={{ color: '#1E3D59' }}>
                      {realTimeStats.total} Total Users
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                    <SelectTrigger className="w-32 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Table</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="grid">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Grid</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="analytics">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Analytics</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
                
                <Button 
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                  className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: '#1E3D59' }}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="font-semibold">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </Button>
                
            <Button 
              variant="outline"
              onClick={handleExportUsers}
              disabled={filteredUsers.length === 0}
                  className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                  style={{ color: '#1E3D59' }}
            >
              <Download className="mr-2 h-4 w-4" />
                  <span className="font-semibold">Export</span>
            </Button>
                
            <Button 
              onClick={handleCreateUser}
                  className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#FF6E40' }}
            >
              <Plus className="mr-2 h-4 w-4" />
                  <span className="font-semibold">Add User</span>
            </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Real-time Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users Card */}
          <div className="relative group">
            <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-xs font-medium text-green-600">Live</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Total Users</p>
                  <p className="text-3xl font-bold mb-2" style={{ color: '#1E3D59' }}>{realTimeStats.total}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F5F0E1' }}>
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((realTimeStats.total / 1000) * 100, 100)}%`, backgroundColor: '#FF6E40' }}
                      ></div>
                    </div>
                    <span className="text-xs" style={{ color: '#1E3D59' }}>{Math.min(realTimeStats.total, 1000)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Users Card */}
          <div className="relative group">
            <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-xs font-medium text-green-600">Live</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Active Users</p>
                  <p className="text-3xl font-bold mb-2" style={{ color: '#1E3D59' }}>{realTimeStats.active}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F5F0E1' }}>
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${realTimeStats.total > 0 ? (realTimeStats.active / realTimeStats.total) * 100 : 0}%`, backgroundColor: '#FF6E40' }}
                      ></div>
                    </div>
                    <span className="text-xs" style={{ color: '#1E3D59' }}>
                      {realTimeStats.total > 0 ? Math.round((realTimeStats.active / realTimeStats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Online Users Card */}
          <div className="relative group">
            <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFC13B' }}>
                    <Wifi className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-xs font-medium text-green-600">Live</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Online Now</p>
                  <p className="text-3xl font-bold mb-2" style={{ color: '#1E3D59' }}>{realTimeStats.onlineUsers}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F5F0E1' }}>
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${realTimeStats.total > 0 ? (realTimeStats.onlineUsers / realTimeStats.total) * 100 : 0}%`, backgroundColor: '#FFC13B' }}
                      ></div>
                    </div>
                    <span className="text-xs" style={{ color: '#1E3D59' }}>
                      {realTimeStats.total > 0 ? Math.round((realTimeStats.onlineUsers / realTimeStats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health Card */}
          <div className="relative group">
            <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#8B5CF6' }}>
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-xs font-medium text-green-600">Live</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>System Health</p>
                  <p className="text-2xl font-bold mb-2 capitalize" style={{ 
                    color: realTimeStats.systemHealth === 'excellent' ? '#10B981' : 
                           realTimeStats.systemHealth === 'good' ? '#F59E0B' : '#EF4444'
                  }}>
                    {realTimeStats.systemHealth}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F5F0E1' }}>
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: realTimeStats.systemHealth === 'excellent' ? '100%' : 
                                 realTimeStats.systemHealth === 'good' ? '70%' : '40%',
                          backgroundColor: realTimeStats.systemHealth === 'excellent' ? '#10B981' : 
                                         realTimeStats.systemHealth === 'good' ? '#F59E0B' : '#EF4444'
                        }}
                      ></div>
                    </div>
                    <span className="text-xs" style={{ color: '#1E3D59' }}>
                      {realTimeStats.systemHealth === 'excellent' ? '100%' : 
                       realTimeStats.systemHealth === 'good' ? '70%' : '40%'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Debug Information with AppEver Design */}
        {process.env.NODE_ENV === 'development' && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #FFC13B, #FF6E40, #8B5CF6)' }}></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
              <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold" style={{ color: '#1E3D59' }}>Debug Information</h4>
                      <p className="text-sm" style={{ color: '#1E3D59' }}>Real-time system monitoring and diagnostics</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-sm font-medium text-green-600">Live Debug</span>
                  </div>
                </div>
                
                {/* Status Grid with AppEver Design */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="relative group">
                    <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: loading ? '#FF6E40' : '#10B981' }}>
                            {loading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <CheckCircle className="w-5 h-5 text-white" />}
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                            <span className="text-xs font-medium text-green-600">Live</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Loading State</p>
                          <p className="text-2xl font-bold mb-2" style={{ color: '#1E3D59' }}>
                            {loading ? 'Loading...' : 'Loaded'}
                          </p>
                          <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F5F0E1' }}>
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: loading ? '100%' : '0%', 
                                backgroundColor: loading ? '#FF6E40' : '#10B981' 
                              }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative group">
                    <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                            <span className="text-xs font-medium text-green-600">Live</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Total Users</p>
                          <p className="text-2xl font-bold mb-2" style={{ color: '#1E3D59' }}>{users.length}</p>
                          <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F5F0E1' }}>
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((users.length / 100) * 100, 100)}%`, backgroundColor: '#1E3D59' }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative group">
                    <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#8B5CF6' }}>
                            <Filter className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                            <span className="text-xs font-medium text-green-600">Live</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Filtered Users</p>
                          <p className="text-2xl font-bold mb-2" style={{ color: '#1E3D59' }}>{filteredUsers.length}</p>
                          <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F5F0E1' }}>
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ width: `${users.length > 0 ? (filteredUsers.length / users.length) * 100 : 0}%`, backgroundColor: '#8B5CF6' }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative group">
                    <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: isOnline ? '#10B981' : '#EF4444' }}>
                            {isOnline ? <Wifi className="w-5 h-5 text-white" /> : <WifiOff className="w-5 h-5 text-white" />}
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                            <span className="text-xs font-medium text-green-600">Live</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Connection</p>
                          <p className="text-2xl font-bold mb-2" style={{ color: isOnline ? '#10B981' : '#EF4444' }}>
                            {isOnline ? 'Online' : 'Offline'}
                          </p>
                          <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F5F0E1' }}>
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ width: isOnline ? '100%' : '0%', backgroundColor: isOnline ? '#10B981' : '#EF4444' }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Detailed Information with AppEver Design */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F5F0E1' }}>
                          <Activity className="w-4 h-4" style={{ color: '#1E3D59' }} />
                        </div>
                        <h5 className="text-lg font-semibold" style={{ color: '#1E3D59' }}>System Status</h5>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                          <span className="text-sm font-medium" style={{ color: '#1E3D59' }}>Current User</span>
                          <span className="text-sm font-semibold" style={{ color: '#1E3D59' }}>
                            {currentUser ? currentUser.email : 'Not logged in'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                          <span className="text-sm font-medium" style={{ color: '#1E3D59' }}>Refreshing</span>
                          <span className={`text-sm font-semibold ${refreshing ? 'text-blue-600' : 'text-gray-600'}`}>
                            {refreshing ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                          <span className="text-sm font-medium" style={{ color: '#1E3D59' }}>Last Update</span>
                          <span className="text-sm font-semibold" style={{ color: '#1E3D59' }}>
                            {lastUpdate.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F5F0E1' }}>
                          <Settings className="w-4 h-4" style={{ color: '#1E3D59' }} />
                        </div>
                        <h5 className="text-lg font-semibold" style={{ color: '#1E3D59' }}>UI Settings</h5>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                          <span className="text-sm font-medium" style={{ color: '#1E3D59' }}>View Mode</span>
                          <Badge variant="outline" className="capitalize">{viewMode}</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                          <span className="text-sm font-medium" style={{ color: '#1E3D59' }}>Search Term</span>
                          <span className="text-sm font-semibold" style={{ color: '#1E3D59' }}>
                            {searchTerm || 'None'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                          <span className="text-sm font-medium" style={{ color: '#1E3D59' }}>Role Filter</span>
                          <Badge variant="secondary">{roleFilter}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* User Data Preview with AppEver Design */}
                {users.length > 0 && (
                  <Card className="bg-white shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F5F0E1' }}>
                          <Users className="w-4 h-4" style={{ color: '#1E3D59' }} />
                        </div>
                        <h5 className="text-lg font-semibold" style={{ color: '#1E3D59' }}>User Data Preview</h5>
                        <div className="ml-auto">
                          <Badge variant="outline" style={{ color: '#1E3D59' }}>
                            {users.length} Total Users
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {users.slice(0, 5).map((user, index) => (
                          <div key={user.id} className="flex items-center space-x-4 p-4 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                              <span className="text-sm font-bold text-white">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate">
                                {user.displayName || user.firstName || user.email}
                              </div>
                              <div className="text-xs text-gray-600">
                                {user.email}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={user.role === 'super-admin' ? 'default' : user.role === 'admin' ? 'secondary' : 'outline'}>
                                {user.role}
                              </Badge>
                              <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                {user.status || 'pending'}
                              </Badge>
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: user.isOnline ? '#10B981' : '#6B7280' }}></div>
                            </div>
                          </div>
                        ))}
                        {users.length > 5 && (
                          <div className="text-center py-4">
                            <div className="text-sm font-medium" style={{ color: '#1E3D59' }}>
                              ... and {users.length - 5} more users
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons with AppEver Design */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    size="sm" 
                    onClick={async () => {
                      try {
                        console.log('🧪 Testing Firebase connection...')
                        const testSnapshot = await getDocs(collection(db, 'users'))
                        console.log('✅ Firebase test successful:', testSnapshot.size, 'users found')
                        console.log('📄 Sample user data:', testSnapshot.docs[0]?.data())
                        toastSuccess(`✅ Firebase connection successful: ${testSnapshot.size} users found`)
                      } catch (error) {
                        console.error('❌ Firebase test failed:', error)
                        toastError(`❌ Firebase test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
                      }
                    }}
                    className="h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    style={{ backgroundColor: '#1E3D59' }}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    <span className="font-semibold">Test Firebase</span>
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      console.log('📊 Current State Debug:')
                      console.log('👥 Users:', users)
                      console.log('⏳ Loading:', loading)
                      console.log('🔄 Refreshing:', refreshing)
                      console.log('👤 Current User:', currentUser)
                      console.log('🔍 Filtered Users:', filteredUsers)
                      console.log('🎯 Search Term:', searchTerm)
                      console.log('🏷️ Role Filter:', roleFilter)
                      console.log('📊 Status Filter:', statusFilter)
                    }}
                    className="h-12 rounded-xl border-2 transition-all duration-300 transform hover:scale-105"
                    style={{ color: '#1E3D59', borderColor: '#1E3D59' }}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    <span className="font-semibold">Log State</span>
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={async () => {
                      try {
                        console.log('🔍 Testing basic collection query...')
                        const basicSnapshot = await getDocs(collection(db, 'users'))
                        console.log('✅ Basic query result:', basicSnapshot.size, 'documents')
                        if (basicSnapshot.docs.length > 0) {
                          console.log('📄 First document:', basicSnapshot.docs[0].id, basicSnapshot.docs[0].data())
                        }
                        toastSuccess(`✅ Basic query successful: ${basicSnapshot.size} documents`)
                      } catch (error) {
                        console.error('❌ Basic query failed:', error)
                        toastError(`❌ Basic query failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
                      }
                    }}
                    className="h-12 rounded-xl border-2 transition-all duration-300 transform hover:scale-105"
                    style={{ color: '#8B5CF6', borderColor: '#8B5CF6' }}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    <span className="font-semibold">Test Query</span>
                  </Button>

                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      console.log('🎨 UI State Debug:')
                      console.log('📱 View Mode:', viewMode)
                      console.log('🔍 Search Term:', searchTerm)
                      console.log('🏷️ Role Filter:', roleFilter)
                      console.log('📊 Status Filter:', statusFilter)
                      console.log('📅 Date Filter:', dateFilter)
                      console.log('🔄 Sort By:', sortBy)
                      console.log('📈 Sort Order:', sortOrder)
                      console.log('👥 Selected Users:', selectedUsers)
                    }}
                    className="h-12 rounded-xl border-2 transition-all duration-300 transform hover:scale-105"
                    style={{ color: '#FF6E40', borderColor: '#FF6E40' }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    <span className="font-semibold">UI State</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Filters and Search */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search and Basic Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search users by name, email, role, department, or position..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="learner">Learner</SelectItem>
                      <SelectItem value="applicant">Applicant</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    onClick={loadUsers}
                    disabled={loading}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="text-coral hover:text-coral/80"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                </Button>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{filteredUsers.length} of {users.length} users</span>
                  {selectedUsers.length > 0 && (
                    <span className="text-coral">• {selectedUsers.length} selected</span>
                  )}
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Date Range</label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Created Date</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="role">Role</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="lastLogin">Last Login</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Sort Order</label>
                    <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Newest First</SelectItem>
                        <SelectItem value="asc">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('')
                        setRoleFilter('all')
                        setStatusFilter('all')
                        setDateFilter('all')
                        setSortBy('createdAt')
                        setSortOrder('desc')
                        setSelectedUsers([])
                      }}
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card className="shadow-lg border-coral/20 bg-coral/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-coral rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedUsers.length} user(s) selected
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUsers([])}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear Selection
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('activate')}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('deactivate')}
                    className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('suspend')}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Suspend
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
                        handleBulkAction('delete')
                      }
                    }}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="bg-white shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin"></div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold" style={{ color: '#1E3D59' }}>Loading Users</h3>
                  <p className="text-sm" style={{ color: '#1E3D59' }}>Fetching user data from database...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {!loading && users.length === 0 && (
          <Card className="bg-white shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5F0E1' }}>
                  <Users className="w-8 h-8" style={{ color: '#FF6E40' }} />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold" style={{ color: '#1E3D59' }}>No Users Found</h3>
                  <p className="text-sm" style={{ color: '#1E3D59' }}>No users are currently in the database. Try refreshing or check your connection.</p>
                  <Button 
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                    className="mt-4 px-6 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#FF6E40' }}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        {users.length > 0 && (
          <div className="space-y-4">
            {/* Table Header Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredUsers.length}</span> of <span className="font-semibold text-gray-900">{users.length}</span> users
                </div>
                {searchTerm && (
                  <div className="text-sm text-blue-600">
                    Filtered by: "{searchTerm}"
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
            
            {/* UserManagementTable */}
        <UserManagementTable
          users={filteredUsers}
          loading={loading}
          selectedUsers={selectedUsers}
          onSelectionChange={setSelectedUsers}
          onEditUser={handleEditUser}
          onToggleStatus={handleToggleUserStatus}
          onDeleteUser={handleDeleteUser}
        />
          </div>
        )}

        {/* Enhanced Raw User Data Debug with AppEver Design */}
        {!loading && users.length > 0 && process.env.NODE_ENV === 'development' && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #FF6E40, #8B5CF6, #1E3D59)' }}></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
                      <Database className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold" style={{ color: '#1E3D59' }}>Raw User Data</h4>
                      <p className="text-sm" style={{ color: '#1E3D59' }}>Debug information with AppEver design</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-sm font-medium text-green-600">Live Debug</span>
                  </div>
                </div>

                {/* User Data Cards */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {users.map((user, index) => (
                    <div key={user.id} className="group relative">
                      <Card className="relative bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* User Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                                  <span className="text-lg font-bold text-white">{index + 1}</span>
                                </div>
                                <div>
                                  <div className="text-lg font-semibold text-gray-900">
                                    User {index + 1}
                                  </div>
                                  <div className="text-sm text-gray-600">{user.email}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={user.role === 'super-admin' ? 'default' : user.role === 'admin' ? 'secondary' : 'outline'}
                                  className="px-3 py-1 rounded-full font-semibold"
                                >
                                  {user.role}
                                </Badge>
                                <Badge 
                                  variant={user.status === 'active' ? 'default' : 'secondary'}
                                  className="px-3 py-1 rounded-full font-semibold"
                                >
                                  {user.status || 'pending'}
                                </Badge>
                              </div>
                            </div>

                            {/* User Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <User className="w-4 h-4" style={{ color: '#1E3D59' }} />
                                    <span className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Name</span>
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.displayName || user.firstName || 'N/A'}
                                  </div>
                                </div>

                                <div className="p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Mail className="w-4 h-4" style={{ color: '#1E3D59' }} />
                                    <span className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Email</span>
                                  </div>
                                  <div className="text-sm font-medium text-gray-900 break-all">
                                    {user.email}
                                  </div>
                                </div>

                                <div className="p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Key className="w-4 h-4" style={{ color: '#1E3D59' }} />
                                    <span className="text-sm font-semibold" style={{ color: '#1E3D59' }}>User ID</span>
                                  </div>
                                  <div className="text-xs font-mono text-gray-600 break-all">
                                    {user.id}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Shield className="w-4 h-4" style={{ color: '#1E3D59' }} />
                                    <span className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Role</span>
                                  </div>
                                  <div className="text-sm font-medium text-gray-900 capitalize">
                                    {user.role}
                                  </div>
                                </div>

                                <div className="p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Activity className="w-4 h-4" style={{ color: '#1E3D59' }} />
                                    <span className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Status</span>
                                  </div>
                                  <div className="text-sm font-medium text-gray-900 capitalize">
                                    {user.status || 'pending'}
                                  </div>
                                </div>

                                <div className="p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Wifi className="w-4 h-4" style={{ color: '#1E3D59' }} />
                                    <span className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Online Status</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: user.isOnline ? '#10B981' : '#6B7280' }}></div>
                                    <span className="text-sm font-medium text-gray-900">
                                      {user.isOnline ? 'Online' : 'Offline'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Additional Information */}
                            {(user.activeProgram || user.assignedPrograms?.length || user.lastLoginAt) && (
                              <div className="border-t pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {user.activeProgram && (
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Target className="w-4 h-4" style={{ color: '#1E3D59' }} />
                                        <span className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Active Program</span>
                                      </div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {user.activeProgram}
                                      </div>
                                    </div>
                                  )}

                                  {user.assignedPrograms?.length && (
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                                      <div className="flex items-center space-x-2 mb-1">
                                        <BookOpen className="w-4 h-4" style={{ color: '#1E3D59' }} />
                                        <span className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Assigned Programs</span>
                                      </div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {user.assignedPrograms.length} programs
                                      </div>
                                    </div>
                                  )}

                                  {user.lastLoginAt && (
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Clock className="w-4 h-4" style={{ color: '#1E3D59' }} />
                                        <span className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Last Login</span>
                                      </div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {new Date(user.lastLoginAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Debug Actions */}
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="text-xs text-gray-500">
                                Debug ID: {user.id.substring(0, 8)}...
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    console.log('🔍 Full User Data:', user)
                                    toastSuccess('User data logged to console')
                                  }}
                                  className="h-7 px-3 rounded-lg text-xs"
                                  style={{ color: '#1E3D59', borderColor: '#1E3D59' }}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Log Data
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(user.id)
                                    toastSuccess('User ID copied to clipboard')
                                  }}
                                  className="h-7 px-3 rounded-lg text-xs"
                                  style={{ color: '#8B5CF6', borderColor: '#8B5CF6' }}
                                >
                                  <Key className="w-3 h-3 mr-1" />
                                  Copy ID
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>

                {/* Summary Footer */}
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}>
                  <div className="text-sm font-medium" style={{ color: '#1E3D59' }}>
                    Total Users: {users.length} | Last Updated: {lastUpdate.toLocaleTimeString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        console.log('📊 All Users Data:', users)
                        toastSuccess('All users data logged to console')
                      }}
                      className="h-8 px-4 rounded-lg text-xs"
                      style={{ color: '#1E3D59', borderColor: '#1E3D59' }}
                    >
                      <Database className="w-3 h-3 mr-1" />
                      Log All Data
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Fallback Table with AppEver Design */}
        {!loading && users.length > 0 && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1E3D59, #8B5CF6)' }}></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold" style={{ color: '#1E3D59' }}>User Management</h4>
                      <p className="text-sm" style={{ color: '#1E3D59' }}>Simple user list with AppEver design</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-sm font-medium text-green-600">Live Data</span>
                  </div>
                </div>

                {/* User List */}
                <div className="space-y-4">
                  {filteredUsers.map((user, index) => (
                    <div key={user.id} className="group relative">
                      <Card className="relative bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                                <span className="text-lg font-bold text-white">{index + 1}</span>
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-gray-900">
                                  {user.displayName || user.firstName || user.email}
                                </div>
                                <div className="text-sm text-gray-600">{user.email}</div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: user.isOnline ? '#10B981' : '#6B7280' }}></div>
                                    <span className="text-xs text-gray-500">
                                      {user.isOnline ? 'Online' : 'Offline'}
                                    </span>
                                  </div>
                                  {user.activeProgram && (
                                    <div className="text-xs text-gray-500">
                                      • {user.activeProgram}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={user.role === 'super-admin' ? 'default' : user.role === 'admin' ? 'secondary' : 'outline'}
                                  className="px-3 py-1 rounded-full font-semibold"
                                >
                                  {user.role}
                                </Badge>
                                <Badge 
                                  variant={user.status === 'active' ? 'default' : 'secondary'}
                                  className="px-3 py-1 rounded-full font-semibold"
                                >
                                  {user.status || 'pending'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditUser(user)}
                                  className="h-8 w-8 rounded-lg transition-all duration-300 hover:scale-110"
                                  style={{ color: '#1E3D59', borderColor: '#1E3D59' }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleUserStatus(user.id, user.status === 'active' ? 'inactive' : 'active')}
                                  className="h-8 w-8 rounded-lg transition-all duration-300 hover:scale-110"
                                  style={{ 
                                    color: user.status === 'active' ? '#EF4444' : '#10B981',
                                    borderColor: user.status === 'active' ? '#EF4444' : '#10B981'
                                  }}
                                >
                                  {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}>
                  <div className="text-sm font-medium" style={{ color: '#1E3D59' }}>
                    Showing {filteredUsers.length} of {users.length} users
                  </div>
                  <div className="text-xs text-gray-600">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Form Dialog */}
        <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Create New User'}
              </DialogTitle>
            </DialogHeader>
            <CompactUserForm
              user={editingUser}
              onClose={handleUserFormClose}
              onSave={loadUsers}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
