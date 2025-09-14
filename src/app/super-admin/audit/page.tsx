'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WelcomeCard } from '@/components/ui/welcome-card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  doc,
  addDoc,
  Timestamp
} from 'firebase/firestore'
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  User,
  Shield,
  Database,
  RefreshCw,
  Calendar,
  Users,
  Activity,
  Trash2,
  Edit,
  Settings,
  LogOut,
  Plus,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Loader2
} from 'lucide-react'

interface AuditLog {
  id: string
  timestamp: Timestamp
  userId: string
  userName: string
  userEmail: string
  action: string
  category: string
  target: string
  targetId?: string
  ipAddress: string
  userAgent: string
  status: 'success' | 'warning' | 'error' | 'info'
  details: string
  metadata?: Record<string, any>
  createdAt: Timestamp
  updatedAt: Timestamp
}

interface AuditStats {
  totalLogs: number
  successCount: number
  warningCount: number
  errorCount: number
  infoCount: number
  todayCount: number
  thisWeekCount: number
  topActions: Array<{ action: string; count: number }>
  topUsers: Array<{ userName: string; count: number }>
}

const AUDIT_CATEGORIES = [
  'User Management',
  'Authentication',
  'Security',
  'System Configuration',
  'Data Management',
  'Application',
  'API',
  'Other'
]

const AUDIT_ACTIONS = [
  'User Created',
  'User Updated',
  'User Deleted',
  'User Activated',
  'User Deactivated',
  'Login Success',
  'Login Failed',
  'Password Changed',
  'Password Reset',
  'Profile Updated',
  'Avatar Updated',
  'Document Uploaded',
  'Document Deleted',
  'Permission Granted',
  'Permission Revoked',
  'Role Changed',
  'System Backup',
  'Data Export',
  'Data Import',
  'Configuration Changed',
  'API Access',
  'Security Update',
  'System Maintenance',
  'Other'
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />
    default:
      return <Info className="h-4 w-4 text-gray-500" />
  }
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'success':
      return 'default'
    case 'warning':
      return 'secondary'
    case 'error':
      return 'destructive'
    case 'info':
      return 'outline'
    default:
      return 'secondary'
  }
}

const getActionIcon = (action: string) => {
  if (action.includes('User')) return <User className="h-4 w-4" />
  if (action.includes('Login') || action.includes('Password') || action.includes('Security')) return <Shield className="h-4 w-4" />
  if (action.includes('Data') || action.includes('System') || action.includes('Backup')) return <Database className="h-4 w-4" />
  if (action.includes('Failed') || action.includes('Error')) return <AlertTriangle className="h-4 w-4" />
  if (action.includes('Profile') || action.includes('Avatar')) return <Edit className="h-4 w-4" />
  if (action.includes('Document')) return <FileText className="h-4 w-4" />
  if (action.includes('Permission') || action.includes('Role')) return <Settings className="h-4 w-4" />
  return <Activity className="h-4 w-4" />
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'User Management':
      return <Users className="h-4 w-4" />
    case 'Authentication':
    case 'Security':
      return <Shield className="h-4 w-4" />
    case 'System Configuration':
    case 'Data Management':
      return <Database className="h-4 w-4" />
    case 'Application':
    case 'API':
      return <Activity className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

export default function SuperAdminAuditPage() {
  const { user, userData } = useAuth()
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newLog, setNewLog] = useState({
    action: '',
    category: '',
    target: '',
    status: 'info' as const,
    details: ''
  })
  const toast = useToast()

  useEffect(() => {
    loadAuditLogs()
    loadAuditStats()
  }, [])

  useEffect(() => {
    loadAuditLogs()
  }, [searchTerm, statusFilter, categoryFilter, dateFilter])

  const loadAuditLogs = async () => {
    setLoading(true)
    try {
      let q = query(
        collection(db, 'audit-logs'),
        orderBy('timestamp', 'desc'),
        limit(50)
      )

      // Apply filters
      if (statusFilter !== 'all') {
        q = query(q, where('status', '==', statusFilter))
      }
      if (categoryFilter !== 'all') {
        q = query(q, where('category', '==', categoryFilter))
      }

      const snapshot = await getDocs(q)
      let logs = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          timestamp: data.timestamp || Timestamp.now(),
          userId: data.userId || 'unknown',
          userName: data.userName || 'Unknown User',
          userEmail: data.userEmail || 'unknown@example.com',
          action: data.action || 'Unknown Action',
          category: data.category || 'Other',
          target: data.target || 'Unknown Target',
          targetId: data.targetId,
          ipAddress: data.ipAddress || '127.0.0.1',
          userAgent: data.userAgent || 'Unknown Browser',
          status: data.status || 'info',
          details: data.details || 'No details available',
          metadata: data.metadata || {},
          createdAt: data.createdAt || Timestamp.now(),
          updatedAt: data.updatedAt || Timestamp.now()
        }
      }) as AuditLog[]

      // Apply search filter
      if (searchTerm) {
        logs = logs.filter(log => 
          log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      // Apply date filter
      if (dateFilter) {
        const filterDate = new Date(dateFilter)
        logs = logs.filter(log => {
          const logDate = log.timestamp.toDate()
          return logDate.toDateString() === filterDate.toDateString()
        })
      }

      setAuditLogs(logs)
    } catch (error) {
      console.error('Error loading audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const loadAuditStats = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'audit-logs'))
      const logs = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          status: data.status || 'info',
          timestamp: data.timestamp || Timestamp.now(),
          userName: data.userName || 'Unknown User'
        }
      }) as AuditLog[]
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)

      const todayLogs = logs.filter(log => log.timestamp.toDate() >= today)
      const weekLogs = logs.filter(log => log.timestamp.toDate() >= weekAgo)

      const actionCounts = logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const userCounts = logs.reduce((acc, log) => {
        acc[log.userName] = (acc[log.userName] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const stats: AuditStats = {
        totalLogs: logs.length,
        successCount: logs.filter(log => log.status === 'success').length,
        warningCount: logs.filter(log => log.status === 'warning').length,
        errorCount: logs.filter(log => log.status === 'error').length,
        infoCount: logs.filter(log => log.status === 'info').length,
        todayCount: todayLogs.length,
        thisWeekCount: weekLogs.length,
        topActions: Object.entries(actionCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([action, count]) => ({ action, count })),
        topUsers: Object.entries(userCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([userName, count]) => ({ userName, count }))
      }

      setStats(stats)
    } catch (error) {
      console.error('Error loading audit stats:', error)
    }
  }

  const createAuditLog = async () => {
    try {
      const auditLogData = {
        timestamp: Timestamp.now(),
        userId: 'system',
        userName: 'System',
        userEmail: 'system@ispaan.com',
        action: newLog.action,
        category: newLog.category,
        target: newLog.target,
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent,
        status: newLog.status,
        details: newLog.details,
        metadata: {},
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      await addDoc(collection(db, 'audit-logs'), auditLogData)
      toast.success('Audit log created successfully')
      setShowCreateModal(false)
      setNewLog({ action: '', category: '', target: '', status: 'info', details: '' })
      loadAuditLogs()
      loadAuditStats()
    } catch (error) {
      console.error('Error creating audit log:', error)
      toast.error('Failed to create audit log')
    }
  }

  const exportAuditLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Category', 'Target', 'IP Address', 'Status', 'Details'],
      ...auditLogs.map(log => [
        log.timestamp.toDate().toISOString(),
        log.userName,
        log.action,
        log.category,
        log.target,
        log.ipAddress,
        log.status,
        log.details
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Audit logs exported successfully')
  }

  const formatTimestamp = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'Unknown'
    try {
      return timestamp.toDate().toLocaleString()
    } catch (error) {
      console.error('Error formatting timestamp:', error)
      return 'Invalid Date'
    }
  }

  return (
    <AdminLayout userRole="super-admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark-blue">Audit Logs</h1>
            <p className="text-muted-foreground mt-1">
              Monitor system activities and security events
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={loadAuditLogs} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportAuditLogs}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Log
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Audit Log</DialogTitle>
                  <DialogDescription>
                    Create a new audit log entry for system tracking
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Action</label>
                    <Select value={newLog.action} onValueChange={(value) => setNewLog(prev => ({ ...prev, action: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        {AUDIT_ACTIONS.map(action => (
                          <SelectItem key={action} value={action}>{action}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select value={newLog.category} onValueChange={(value) => setNewLog(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {AUDIT_CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Target</label>
                    <Input
                      value={newLog.target}
                      onChange={(e) => setNewLog(prev => ({ ...prev, target: e.target.value }))}
                      placeholder="Enter target"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={newLog.status} onValueChange={(value: any) => setNewLog(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Details</label>
                    <Input
                      value={newLog.details}
                      onChange={(e) => setNewLog(prev => ({ ...prev, details: e.target.value }))}
                      placeholder="Enter details"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createAuditLog}>
                      Create Log
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Welcome Card */}
        <WelcomeCard 
          userName={(user && user.displayName) || (userData && userData.firstName) || "Audit Admin"} 
          userRole="super-admin" 
          className="mb-6"
        />

        {/* Search and Filters */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search audit logs by user, action, or target..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {AUDIT_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input 
                  type="date" 
                  className="w-40"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark-blue">{stats.successCount}</p>
                    <p className="text-muted-foreground">Successful Actions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-yellow-500 rounded-xl shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark-blue">{stats.warningCount}</p>
                    <p className="text-muted-foreground">Warnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark-blue">{stats.errorCount}</p>
                    <p className="text-muted-foreground">Errors</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-coral rounded-xl shadow-coral">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark-blue">{stats.totalLogs}</p>
                    <p className="text-muted-foreground">Total Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Audit Logs Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-coral" />
              <span>Audit Logs</span>
            </CardTitle>
            <CardDescription>
              Complete log of all system activities and security events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading audit logs...</span>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Logs</h3>
                <p className="text-gray-600">No audit logs found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-dark-blue">Timestamp</th>
                      <th className="text-left py-3 px-4 font-medium text-dark-blue">User</th>
                      <th className="text-left py-3 px-4 font-medium text-dark-blue">Action</th>
                      <th className="text-left py-3 px-4 font-medium text-dark-blue">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-dark-blue">Target</th>
                      <th className="text-left py-3 px-4 font-medium text-dark-blue">IP Address</th>
                      <th className="text-left py-3 px-4 font-medium text-dark-blue">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-dark-blue">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{formatTimestamp(log.timestamp)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-dark-blue">{log.userName}</div>
                              <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {getActionIcon(log.action)}
                            <span className="text-sm">{log.action}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(log.category)}
                            <span className="text-sm">{log.category}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-muted-foreground">{log.target}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-mono text-muted-foreground">{log.ipAddress}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(log.status || 'info')}
                            <Badge variant={getStatusBadgeVariant(log.status || 'info')}>
                              {(log.status || 'info').toUpperCase()}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Log Details Modal */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Audit Log Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected audit log entry
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Timestamp</label>
                    <p className="text-sm">{formatTimestamp(selectedLog.timestamp)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">User</label>
                    <p className="text-sm">{selectedLog.userName} ({selectedLog.userEmail})</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Action</label>
                    <p className="text-sm">{selectedLog.action}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-sm">{selectedLog.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Target</label>
                    <p className="text-sm">{selectedLog.target}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">IP Address</label>
                    <p className="text-sm font-mono">{selectedLog.ipAddress}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedLog.status || 'info')}
                      <Badge variant={getStatusBadgeVariant(selectedLog.status || 'info')}>
                        {(selectedLog.status || 'info').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">User Agent</label>
                    <p className="text-sm text-xs break-all">{selectedLog.userAgent}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Details</label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">{selectedLog.details}</p>
                </div>
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Metadata</label>
                    <pre className="text-xs mt-1 p-3 bg-gray-50 rounded-lg overflow-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
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

