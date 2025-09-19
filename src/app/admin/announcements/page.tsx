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
import { Switch } from '@/components/ui/switch'
import { 
  Megaphone, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Send, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Users, 
  Mail, 
  Bell, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Bot, 
  Brain, 
  Activity, 
  BarChart3, 
  RefreshCw, 
  Download, 
  UserCheck, 
  UserX, 
  BookOpen, 
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
  FileText, 
  Upload
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore'
import { toast as sonnerToast } from 'sonner'

interface Announcement {
  id: string
  title: string
  content: string
  type: 'general' | 'urgent' | 'info' | 'warning'
  targetAudience: 'all' | 'learners' | 'applicants' | 'admins'
  status: 'draft' | 'sent' | 'scheduled' | 'failed'
  createdAt: string
  scheduledFor?: string
  sentAt?: string
  createdBy: string
  stats?: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    failed: number
  }
}

interface AnnouncementStats {
  total: number
  sent: number
  draft: number
  scheduled: number
  failed: number
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [aiGenerating, setAiGenerating] = useState(false)

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'general' as 'general' | 'urgent' | 'info' | 'warning',
    targetAudience: 'all' as 'all' | 'learners' | 'applicants' | 'admins',
    sendEmail: true,
    sendPush: true,
    scheduledFor: ''
  })

  const [stats, setStats] = useState<AnnouncementStats>({
    total: 0,
    sent: 0,
    draft: 0,
    scheduled: 0,
    failed: 0
  })

  useEffect(() => {
    loadAnnouncements()
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadAnnouncements()
    }, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      const announcementsSnapshot = await getDocs(query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc')
      ))

      const announcementsData = announcementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[]

      setAnnouncements(announcementsData)
      calculateStats(announcementsData)
    } catch (error) {
      console.error('Error loading announcements:', error)
      sonnerToast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (announcementsData: Announcement[]) => {
    const newStats = {
      total: announcementsData.length,
      sent: announcementsData.filter(a => a.status === 'sent').length,
      draft: announcementsData.filter(a => a.status === 'draft').length,
      scheduled: announcementsData.filter(a => a.status === 'scheduled').length,
      failed: announcementsData.filter(a => a.status === 'failed').length
    }

    setStats(newStats)
  }

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || announcement.type === typeFilter
    const matchesStatus = statusFilter === 'all' || announcement.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>
      case 'general':
        return <Badge className="bg-gray-100 text-gray-800">General</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCreateAnnouncement = async () => {
    try {
      const announcementData = {
        ...newAnnouncement,
        status: 'draft',
        createdAt: new Date().toISOString(),
        createdBy: 'admin', // This should come from auth context
        stats: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          failed: 0
        }
      }

      await addDoc(collection(db, 'announcements'), announcementData)
      
      sonnerToast.success('Announcement created successfully')
      setShowCreateModal(false)
      setNewAnnouncement({
        title: '',
        content: '',
        type: 'general',
        targetAudience: 'all',
        sendEmail: true,
        sendPush: true,
        scheduledFor: ''
      })
      loadAnnouncements()
    } catch (error) {
      console.error('Error creating announcement:', error)
      sonnerToast.error('Failed to create announcement')
    }
  }

  const sendAnnouncement = async (id: string) => {
    try {
      await updateDoc(doc(db, 'announcements', id), {
        status: 'sent',
        sentAt: new Date().toISOString()
      })
      
      sonnerToast.success('Announcement sent successfully')
      loadAnnouncements()
    } catch (error) {
      console.error('Error sending announcement:', error)
      sonnerToast.error('Failed to send announcement')
    }
  }

  const generateWithAI = async () => {
    setAiGenerating(true)
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setNewAnnouncement(prev => ({
        ...prev,
        title: 'Important Update: New Learning Modules Available',
        content: 'We are excited to announce the launch of new learning modules in our platform. These modules include advanced topics in software development, data science, and cybersecurity. All learners are encouraged to explore these new resources to enhance their learning experience.'
      }))
      
      sonnerToast.success('AI-generated content created successfully')
    } catch (error) {
      console.error('Error generating with AI:', error)
      sonnerToast.error('Failed to generate content with AI')
    } finally {
      setAiGenerating(false)
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
                    <Megaphone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: '#1E3D59' }}>
                      Announcements
                    </h1>
                    <p className="text-gray-600 text-lg">Manage and send announcements to users</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={loadAnnouncements} 
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
                  <span className="font-semibold">Create Announcement</span>
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
                  <p className="text-sm font-medium text-gray-600">Total Announcements</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-600">
                  <Megaphone className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Activity className="h-4 w-4 mr-1" />
                <span>All announcements</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Sent</p>
                  <p className="text-3xl font-bold text-green-600">{stats.sent}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-600">
                  <Send className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Successfully sent</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.draft}</p>
                </div>
                <div className="p-3 rounded-xl bg-yellow-600">
                  <Edit className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Pending review</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.scheduled}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-600">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Waiting to send</span>
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
                <label className="block text-sm font-medium text-gray-700">Search Announcements</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by title or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59] to-[#2D5A87] opacity-5 rounded-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                  <Megaphone className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#1E3D59' }}>
                  Announcements ({filteredAnnouncements.length})
                </h3>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading announcements...</h3>
                <p className="text-gray-600">Please wait while we fetch the latest data</p>
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Megaphone className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
                <p className="text-gray-600">No announcements match your current filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAnnouncements.map((announcement) => (
                  <Card key={announcement.id} className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                            <Megaphone className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {announcement.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {announcement.content.length > 100 
                                ? `${announcement.content.substring(0, 100)}...` 
                                : announcement.content
                              }
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              {getTypeBadge(announcement.type)}
                              {getStatusBadge(announcement.status)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span><span className="font-medium">Target:</span> {announcement.targetAudience}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span><span className="font-medium">Created:</span> {formatDate(announcement.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Mail className="w-4 h-4 text-purple-600" />
                            <span><span className="font-medium">Email:</span> {announcement.stats?.sent || 0} sent</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Bell className="w-4 h-4 text-orange-600" />
                            <span><span className="font-medium">Opened:</span> {announcement.stats?.opened || 0}</span>
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
                        {announcement.status === 'draft' && (
                          <Button 
                            size="sm"
                            onClick={() => sendAnnouncement(announcement.id)}
                            className="px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            style={{ backgroundColor: '#FF6E40' }}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send
                          </Button>
                        )}
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

        {/* Create Announcement Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Megaphone className="w-6 h-6" style={{ color: '#FF6E40' }} />
                <span className="text-2xl font-bold" style={{ color: '#1E3D59' }}>
                  Create New Announcement
                </span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Announcement Details</Label>
                <Button
                  onClick={generateWithAI}
                  disabled={aiGenerating}
                  variant="outline"
                  className="px-4 py-2 rounded-xl border-2 border-purple-200 text-purple-600 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
                >
                  {aiGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter announcement title..."
                    className="mt-1 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter announcement content..."
                    rows={6}
                    className="mt-1 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={newAnnouncement.type} onValueChange={(value: any) => setNewAnnouncement(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="mt-1 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Select value={newAnnouncement.targetAudience} onValueChange={(value: any) => setNewAnnouncement(prev => ({ ...prev, targetAudience: value }))}>
                      <SelectTrigger className="mt-1 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300">
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="learners">Learners Only</SelectItem>
                        <SelectItem value="applicants">Applicants Only</SelectItem>
                        <SelectItem value="admins">Admins Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sendEmail">Send Email Notification</Label>
                      <p className="text-sm text-gray-500">Send email to target audience</p>
                    </div>
                    <Switch
                      id="sendEmail"
                      checked={newAnnouncement.sendEmail}
                      onCheckedChange={(checked) => setNewAnnouncement(prev => ({ ...prev, sendEmail: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sendPush">Send Push Notification</Label>
                      <p className="text-sm text-gray-500">Send push notification to mobile users</p>
                    </div>
                    <Switch
                      id="sendPush"
                      checked={newAnnouncement.sendPush}
                      onCheckedChange={(checked) => setNewAnnouncement(prev => ({ ...prev, sendPush: checked }))}
                    />
                  </div>
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
                  onClick={handleCreateAnnouncement}
                  className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#FF6E40' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Announcement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}