'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Eye,
  Calendar,
  User,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Settings,
  Shield,
  Zap,
  Award,
  BarChart3,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  MoreVertical,
  Copy,
  Share,
  Play,
  Pause,
  Square,
  Database,
  Server,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Monitor,
  Smartphone,
  Tablet,
  Lock,
  Unlock,
  Key,
  Globe,
  Bell,
  Target,
  TrendingUp,
  TrendingDown,
  Mail,
  Phone,
  MapPin,
  Upload
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore'

interface AuditLog {
  id: string
  action: string
  adminId: string
  adminName: string
  targetUserId?: string
  targetUserEmail?: string
  details: any
  timestamp: string
  status: string
  ipAddress?: string
  userAgent?: string
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadAuditLogs()
  }, [])

  const loadAuditLogs = async () => {
    try {
      setLoading(true)
      const logsSnapshot = await getDocs(query(
        collection(db, 'audit-logs'),
        orderBy('timestamp', 'desc'),
        limit(50)
      ))

      const logsData = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[]

      setLogs(logsData)
    } catch (error) {
      console.error('Error loading audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetUserEmail && log.targetUserEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesAction = actionFilter === 'all' || log.action.toLowerCase().includes(actionFilter.toLowerCase())
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter

    return matchesSearch && matchesAction && matchesStatus
  })

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase()
    
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return <XCircle className="w-4 h-4 text-red-600" />
    }
    if (actionLower.includes('update') || actionLower.includes('modify')) {
      return <Settings className="w-4 h-4 text-blue-600" />
    }
    if (actionLower.includes('login') || actionLower.includes('auth')) {
      return <User className="w-4 h-4 text-purple-600" />
    }
    if (actionLower.includes('error') || actionLower.includes('fail')) {
      return <AlertCircle className="w-4 h-4 text-red-600" />
    }
    
    return <Activity className="w-4 h-4 text-gray-600" />
  }

  const getActionBadge = (action: string) => {
    const actionLower = action.toLowerCase()
    
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return <Badge className="bg-green-100 text-green-800">Created</Badge>
    }
    if (actionLower.includes('update') || actionLower.includes('modify')) {
      return <Badge className="bg-blue-100 text-blue-800">Updated</Badge>
    }
    if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return <Badge variant="destructive">Deleted</Badge>
    }
    if (actionLower.includes('login') || actionLower.includes('auth')) {
      return <Badge className="bg-purple-100 text-purple-800">Authentication</Badge>
    }
    if (actionLower.includes('error') || actionLower.includes('fail')) {
      return <Badge variant="destructive">Error</Badge>
    }
    
    return <Badge variant="outline">Action</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'Admin', 'Target User', 'Status', 'Details'],
      ...filteredLogs.map(log => [
        formatTimestamp(log.timestamp),
        log.action,
        log.adminName,
        log.targetUserEmail || '',
        log.status,
        JSON.stringify(log.details)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)))

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
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: '#1E3D59' }}>
                      Audit Logs
                    </h1>
                    <p className="text-gray-600 text-lg">Monitor all administrative actions and system events</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={loadAuditLogs}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Refresh</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={exportLogs}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Export CSV</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Logs</p>
                  <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Actions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {logs.filter(log => {
                      const logDate = new Date(log.timestamp)
                      const today = new Date()
                      return logDate.toDateString() === today.toDateString()
                    }).length}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {logs.filter(log => log.status === 'error').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Actions</p>
                  <p className="text-2xl font-bold text-gray-900">{uniqueActions.length}</p>
                </div>
                <Settings className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {uniqueActions.map(action => (
                      <SelectItem key={action} value={action.toLowerCase()}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Logs ({filteredLogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading audit logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No audit logs found</h3>
                <p className="text-gray-600">No logs match your current filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(log.action)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{log.action}</h3>
                          {getActionBadge(log.action)}
                          {getStatusBadge(log.status)}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimestamp(log.timestamp)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>by {log.adminName}</span>
                        </div>
                        {log.targetUserEmail && (
                          <div className="flex items-center space-x-1">
                            <span>→ {log.targetUserEmail}</span>
                          </div>
                        )}
                      </div>
                      
                      {log.details && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {hasMore && (
                  <div className="text-center pt-4">
                    <Button variant="outline" onClick={() => {}}>
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}











