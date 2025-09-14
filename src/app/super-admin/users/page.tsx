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
  X
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { UserManagementTable } from '@/components/super-admin/UserManagementTable'
import { CompactUserForm } from '@/components/super-admin/CompactUserForm'
import { UserStats } from '@/components/super-admin/UserStats'
import { useToast } from '@/hooks/use-toast'

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
}

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
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
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    suspended: 0,
    newThisWeek: 0,
    newThisMonth: 0,
    lastLoginToday: 0,
    neverLoggedIn: 0
  })
  const [roleStats, setRoleStats] = useState({
    'super-admin': 0,
    'admin': 0,
    'learner': 0,
    'applicant': 0
  })
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast()

  // Load users from Firestore
  const loadUsers = async () => {
    try {
      setLoading(true)
      // Try to get users with orderBy, fallback to basic collection if it fails
      let usersSnapshot
      try {
        usersSnapshot = await getDocs(
          query(collection(db, 'users'), orderBy('createdAt', 'desc'))
        )
      } catch (orderByError) {
        console.warn('OrderBy failed, falling back to basic collection query:', orderByError)
        usersSnapshot = await getDocs(collection(db, 'users'))
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
          profile: data.profile || {},
          permissions: data.permissions || []
        }
      }) as User[]

      setUsers(usersData)
      
      // Calculate comprehensive stats
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
      
      // Calculate role statistics
      const roleStatsData = {
        'super-admin': usersData.filter(u => u.role === 'super-admin').length,
        'admin': usersData.filter(u => u.role === 'admin').length,
        'learner': usersData.filter(u => u.role === 'learner').length,
        'applicant': usersData.filter(u => u.role === 'applicant').length
      }
      
      setStats({ 
        total, 
        active, 
        pending, 
        inactive, 
        suspended,
        newThisWeek,
        newThisMonth,
        lastLoginToday,
        neverLoggedIn
      })
      setRoleStats(roleStatsData)
    } catch (error) {
      console.error('Error loading users:', error)
      toastError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

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
        'Created At': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
        'Last Login': user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never',
        'Login Count': user.loginCount || 0
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-coral rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-dark-blue">User Management</h1>
              <p className="text-muted-foreground">Comprehensive user administration and analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32">
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
              onClick={handleExportUsers}
              disabled={filteredUsers.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button 
              onClick={handleCreateUser}
              className="bg-coral hover:bg-coral/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <UserStats stats={stats} />

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

        {/* Users Table */}
        <UserManagementTable
          users={filteredUsers}
          loading={loading}
          selectedUsers={selectedUsers}
          onSelectionChange={setSelectedUsers}
          onEditUser={handleEditUser}
          onToggleStatus={handleToggleUserStatus}
          onDeleteUser={handleDeleteUser}
        />

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
