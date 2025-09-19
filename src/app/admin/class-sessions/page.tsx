'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Users, 
  MapPin, 
  Video, 
  BookOpen, 
  GraduationCap, 
  Building2, 
  Activity, 
  BarChart3, 
  RefreshCw, 
  Download,
  UserCheck, 
  UserX, 
  Award, 
  MessageSquare, 
  Shield, 
  Zap, 
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
  Settings, 
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
  Info, 
  FileText, 
  Upload
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore'
import { toast as sonnerToast } from 'sonner'

interface ClassSession {
  id: string
  title: string
  description: string
  program: string
  instructor: string
  date: string
  startTime: string
  endTime: string
  location: string
  maxStudents: number
  enrolledStudents: number
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  type: 'lecture' | 'lab' | 'workshop' | 'seminar'
  createdAt: string
  updatedAt: string
}

interface Program {
  id: string
  name: string
  description: string
}

export default function AdminClassSessionsPage() {
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [programFilter, setProgramFilter] = useState('all')

  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    program: '',
    instructor: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    maxStudents: 30,
    type: 'lecture' as 'lecture' | 'lab' | 'workshop' | 'seminar'
  })

  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0
  })

  useEffect(() => {
    loadSessions()
    loadPrograms()
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadSessions()
    }, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const sessionsSnapshot = await getDocs(query(
        collection(db, 'classSessions'),
        orderBy('date', 'desc')
      ))

      const sessionsData = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ClassSession[]

      setSessions(sessionsData)
      calculateStats(sessionsData)
    } catch (error) {
      console.error('Error loading sessions:', error)
      sonnerToast.error('Failed to load class sessions')
    } finally {
      setLoading(false)
    }
  }

  const loadPrograms = async () => {
    try {
      const programsSnapshot = await getDocs(collection(db, 'programs'))
      const programsData = programsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Program[]

      setPrograms(programsData)
    } catch (error) {
      console.error('Error loading programs:', error)
      sonnerToast.error('Failed to load programs')
    }
  }

  const calculateStats = (sessionsData: ClassSession[]) => {
    const newStats = {
      total: sessionsData.length,
      scheduled: sessionsData.filter(s => s.status === 'scheduled').length,
      ongoing: sessionsData.filter(s => s.status === 'ongoing').length,
      completed: sessionsData.filter(s => s.status === 'completed').length,
      cancelled: sessionsData.filter(s => s.status === 'cancelled').length
    }

    setStats(newStats)
  }

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter
    const matchesProgram = programFilter === 'all' || session.program === programFilter

    return matchesSearch && matchesStatus && matchesProgram
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case 'ongoing':
        return <Badge className="bg-green-100 text-green-800">Ongoing</Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'lecture':
        return <Badge className="bg-purple-100 text-purple-800">Lecture</Badge>
      case 'lab':
        return <Badge className="bg-orange-100 text-orange-800">Lab</Badge>
      case 'workshop':
        return <Badge className="bg-green-100 text-green-800">Workshop</Badge>
      case 'seminar':
        return <Badge className="bg-blue-100 text-blue-800">Seminar</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const handleCreateSession = async () => {
    try {
      const sessionData = {
        ...newSession,
        status: 'scheduled',
        enrolledStudents: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await addDoc(collection(db, 'classSessions'), sessionData)
      
      sonnerToast.success('Class session created successfully')
      setShowCreateModal(false)
      setNewSession({
        title: '',
        description: '',
        program: '',
        instructor: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        maxStudents: 30,
        type: 'lecture'
      })
      loadSessions()
    } catch (error) {
      console.error('Error creating session:', error)
      sonnerToast.error('Failed to create class session')
    }
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
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: '#1E3D59' }}>
                      Class Sessions
                    </h1>
                    <p className="text-gray-600 text-lg">Manage and schedule class sessions</p>
                  </div>
                    </div>
                  </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={loadSessions} 
                  disabled={loading}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Refresh</span>
                    </Button>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#FF6E40' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Create Session</span>
                    </Button>
                  </div>
                </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-600">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Activity className="h-4 w-4 mr-1" />
                <span>All sessions</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-3xl font-bold text-green-600">{stats.scheduled}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-600">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Upcoming sessions</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Ongoing</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.ongoing}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-600">
                  <Play className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Activity className="h-4 w-4 mr-1" />
                <span>Currently active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.completed}</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-600">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Finished sessions</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59] to-[#2D5A87] opacity-5 rounded-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                <Filter className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold" style={{ color: '#1E3D59' }}>Filters & Search</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Search Sessions</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by title, instructor, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Program</label>
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger className="py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All programs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {programs.map(program => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59] to-[#2D5A87] opacity-5 rounded-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#1E3D59' }}>
                  Class Sessions ({filteredSessions.length})
                </h3>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading sessions...</h3>
                <p className="text-gray-600">Please wait while we fetch the latest data</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
                <p className="text-gray-600">No sessions match your current filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <Card key={session.id} className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {session.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {session.description.length > 100 
                                ? `${session.description.substring(0, 100)}...` 
                                : session.description
                              }
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                          {getStatusBadge(session.status)}
                              {getTypeBadge(session.type)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span><span className="font-medium">Instructor:</span> {session.instructor}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span><span className="font-medium">Date:</span> {formatDate(session.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span><span className="font-medium">Time:</span> {formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <MapPin className="w-4 h-4 text-orange-600" />
                            <span><span className="font-medium">Location:</span> {session.location}</span>
                          </div>
                        </div>

                        {/* Enrollment Info */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">Enrollment</h4>
                            <span className="text-sm text-gray-600">
                              {session.enrolledStudents} / {session.maxStudents} students
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(session.enrolledStudents / session.maxStudents) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button 
                          variant="outline" 
                          className="px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          className="px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="px-4 py-2 rounded-xl border-2 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Session Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Calendar className="w-6 h-6" style={{ color: '#FF6E40' }} />
                <span className="text-2xl font-bold" style={{ color: '#1E3D59' }}>
                  Create New Class Session
                </span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newSession.title}
                    onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter session title..."
                    className="mt-1 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newSession.description}
                    onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter session description..."
                    rows={3}
                    className="mt-1 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="program">Program</Label>
                    <Select value={newSession.program} onValueChange={(value) => setNewSession(prev => ({ ...prev, program: value }))}>
                      <SelectTrigger className="mt-1 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map(program => (
                          <SelectItem key={program.id} value={program.id}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="instructor">Instructor</Label>
                    <Input
                      id="instructor"
                      value={newSession.instructor}
                      onChange={(e) => setNewSession(prev => ({ ...prev, instructor: e.target.value }))}
                      placeholder="Enter instructor name..."
                      className="mt-1 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newSession.date}
                      onChange={(e) => setNewSession(prev => ({ ...prev, date: e.target.value }))}
                      className="mt-1 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newSession.startTime}
                      onChange={(e) => setNewSession(prev => ({ ...prev, startTime: e.target.value }))}
                      className="mt-1 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newSession.endTime}
                      onChange={(e) => setNewSession(prev => ({ ...prev, endTime: e.target.value }))}
                      className="mt-1 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newSession.location}
                      onChange={(e) => setNewSession(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter location..."
                      className="mt-1 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxStudents">Max Students</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      value={newSession.maxStudents}
                      onChange={(e) => setNewSession(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 30 }))}
                      className="mt-1 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="type">Session Type</Label>
                  <Select value={newSession.type} onValueChange={(value: any) => setNewSession(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="mt-1 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture">Lecture</SelectItem>
                      <SelectItem value="lab">Lab</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSession}
                  className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#FF6E40' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Session
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}