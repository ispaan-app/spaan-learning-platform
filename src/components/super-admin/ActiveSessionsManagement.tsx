'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Users, 
  Clock, 
  MapPin, 
  Monitor, 
  Smartphone, 
  Tablet,
  LogOut,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Search,
  Loader2,
  Globe
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ActiveSession {
  id: string
  userId: string
  userEmail: string
  userName: string
  userRole: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  browser: string
  operatingSystem: string
  ipAddress: string
  location?: string
  lastActivity: string
  sessionStart: string
  isActive: boolean
}

export function ActiveSessionsManagement() {
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const toast = useToast()

  useEffect(() => {
    loadActiveSessions()
    // Refresh sessions every 30 seconds
    const interval = setInterval(loadActiveSessions, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadActiveSessions = async () => {
    try {
      setLoading(true)
      // Simulate loading active sessions
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - in real implementation, this would fetch from your session store
      const mockSessions: ActiveSession[] = [
        {
          id: '1',
          userId: 'user1',
          userEmail: 'john.doe@example.com',
          userName: 'John Doe',
          userRole: 'learner',
          deviceType: 'desktop',
          browser: 'Chrome 120.0',
          operatingSystem: 'Windows 11',
          ipAddress: '192.168.1.100',
          location: 'Johannesburg, South Africa',
          lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
          sessionStart: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          isActive: true
        },
        {
          id: '2',
          userId: 'user2',
          userEmail: 'jane.smith@example.com',
          userName: 'Jane Smith',
          userRole: 'admin',
          deviceType: 'mobile',
          browser: 'Safari 17.0',
          operatingSystem: 'iOS 17.1',
          ipAddress: '192.168.1.101',
          location: 'Cape Town, South Africa',
          lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
          sessionStart: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          isActive: true
        },
        {
          id: '3',
          userId: 'user3',
          userEmail: 'mike.wilson@example.com',
          userName: 'Mike Wilson',
          userRole: 'learner',
          deviceType: 'tablet',
          browser: 'Chrome 120.0',
          operatingSystem: 'Android 14',
          ipAddress: '192.168.1.102',
          location: 'Durban, South Africa',
          lastActivity: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
          sessionStart: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
          isActive: true
        }
      ]

      setSessions(mockSessions)
    } catch (error) {
      console.error('Error loading active sessions:', error)
      toast.error('Failed to load active sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleEndSession = async (sessionId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to end the session for ${userEmail}?`)) return

    setActionLoading(sessionId)
    try {
      // Simulate ending session
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSessions(prev => prev.filter(session => session.id !== sessionId))
      toast.success(`Session ended for ${userEmail}`)
    } catch (error) {
      console.error('Error ending session:', error)
      toast.error('Failed to end session')
    } finally {
      setActionLoading(null)
    }
  }

  const handleEndAllSessions = async () => {
    if (!confirm('Are you sure you want to end ALL active sessions? This will log out all users.')) return

    setActionLoading('end-all')
    try {
      // Simulate ending all sessions
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSessions([])
      toast.success('All active sessions have been ended')
    } catch (error) {
      console.error('Error ending all sessions:', error)
      toast.error('Failed to end all sessions')
    } finally {
      setActionLoading(null)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return <Monitor className="w-4 h-4" />
      case 'mobile':
        return <Smartphone className="w-4 h-4" />
      case 'tablet':
        return <Tablet className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super-admin':
        return <Badge className="bg-purple-600">Super Admin</Badge>
      case 'admin':
        return <Badge className="bg-blue-600">Admin</Badge>
      case 'learner':
        return <Badge variant="outline">Learner</Badge>
      case 'applicant':
        return <Badge variant="secondary">Applicant</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getActivityStatus = (lastActivity: string) => {
    const lastActivityDate = new Date(lastActivity)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60))

    if (diffMinutes < 5) {
      return { status: 'active', color: 'text-green-600', text: 'Active now' }
    } else if (diffMinutes < 30) {
      return { status: 'recent', color: 'text-yellow-600', text: `${diffMinutes}m ago` }
    } else {
      return { status: 'idle', color: 'text-red-600', text: `${diffMinutes}m ago` }
    }
  }

  const filteredSessions = sessions.filter(session =>
    session.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.ipAddress.includes(searchTerm) ||
    session.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-600">Loading active sessions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-blue-600">{sessions.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Now</p>
                <p className="text-2xl font-bold text-green-600">
                  {sessions.filter(s => getActivityStatus(s.lastActivity).status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {sessions.filter(s => getActivityStatus(s.lastActivity).status === 'recent').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Idle Sessions</p>
                <p className="text-2xl font-bold text-red-600">
                  {sessions.filter(s => getActivityStatus(s.lastActivity).status === 'idle').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Session Management</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" onClick={loadActiveSessions} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleEndAllSessions}
                disabled={actionLoading === 'end-all' || sessions.length === 0}
              >
                {actionLoading === 'end-all' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                End All Sessions
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Sessions</h3>
              <p className="text-gray-600">There are currently no active user sessions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => {
                const activityStatus = getActivityStatus(session.lastActivity)
                
                return (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getDeviceIcon(session.deviceType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <p className="font-medium">{session.userName}</p>
                          {getRoleBadge(session.userRole)}
                          <span className={`text-sm font-medium ${activityStatus.color}`}>
                            {activityStatus.text}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{session.userEmail}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Monitor className="w-3 h-3" />
                            <span>{session.browser} on {session.operatingSystem}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Globe className="w-3 h-3" />
                            <span>{session.ipAddress}</span>
                          </span>
                          {session.location && (
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{session.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right text-sm text-gray-500">
                        <p>Started: {new Date(session.sessionStart).toLocaleTimeString()}</p>
                        <p>Last seen: {new Date(session.lastActivity).toLocaleTimeString()}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEndSession(session.id, session.userEmail)}
                        disabled={actionLoading === session.id}
                      >
                        {actionLoading === session.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
              
              {filteredSessions.length === 0 && searchTerm && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Found</h3>
                  <p className="text-gray-600">No active sessions match your search criteria.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Alert */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> Monitor active sessions regularly and end suspicious or idle sessions. 
          Ending all sessions will log out all users and may disrupt their work.
        </AlertDescription>
      </Alert>
    </div>
  )
}


