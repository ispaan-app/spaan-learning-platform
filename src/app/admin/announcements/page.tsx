'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { 
  Megaphone, 
  Plus, 
  Send, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Bot,
  Sparkles
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { toast as sonnerToast } from 'sonner'

interface Announcement {
  id: string
  title: string
  content: string
  type: 'general' | 'urgent' | 'info' | 'warning'
  targetAudience: 'all' | 'learners' | 'applicants' | 'admins'
  sendEmail: boolean
  sendPush: boolean
  scheduledFor?: string
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  createdAt: string
  sentAt?: string
  recipients?: {
    total: number
    delivered: number
    failed: number
  }
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [aiGenerating, setAiGenerating] = useState(false)
  // Toast notifications using Sonner

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'general' as 'general' | 'urgent' | 'info' | 'warning',
    targetAudience: 'all' as 'all' | 'learners' | 'applicants' | 'admins',
    sendEmail: true,
    sendPush: true,
    scheduledFor: ''
  })

  useEffect(() => {
    loadAnnouncements()
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
    } catch (error) {
      console.error('Error loading announcements:', error)
      sonnerToast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  const generateWithAI = async () => {
    if (!newAnnouncement.title.trim()) {
      sonnerToast.error('Please enter a topic first')
      return
    }

    try {
      setAiGenerating(true)
      
      // Simulate AI generation (in real app, this would call an AI service)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const aiGeneratedContent = `We are pleased to announce that ${newAnnouncement.title.toLowerCase()}. 

This is an important update that affects all ${newAnnouncement.targetAudience === 'all' ? 'platform users' : newAnnouncement.targetAudience}. Please take note of the following details:

• The announcement is effective immediately
• All relevant parties will be notified accordingly
• Please contact support if you have any questions

Thank you for your attention to this matter.

Best regards,
The Administration Team`

      setNewAnnouncement(prev => ({
        ...prev,
        content: aiGeneratedContent
      }))

      sonnerToast.success('AI-generated content has been created')
    } catch (error) {
      console.error('Error generating AI content:', error)
      sonnerToast.error('Failed to generate AI content')
    } finally {
      setAiGenerating(false)
    }
  }

  const createAnnouncement = async () => {
    try {
      const announcementData = {
        ...newAnnouncement,
        status: newAnnouncement.scheduledFor ? 'scheduled' : 'draft',
        createdAt: new Date().toISOString(),
        recipients: {
          total: 0,
          delivered: 0,
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

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = !searchTerm || 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || announcement.type === typeFilter
    const matchesStatus = statusFilter === 'all' || announcement.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">General</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
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

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-600 mt-1">Communicate with all enrolled learners using AI assistance</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={loadAnnouncements} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Megaphone className="w-5 h-5" />
                    <span>Create New Announcement</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Announcement Topic *</Label>
                      <Input
                        id="title"
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                        placeholder="Enter announcement topic"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <select
                        id="type"
                        value={newAnnouncement.type}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="general">General</option>
                        <option value="info">Information</option>
                        <option value="warning">Warning</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <select
                      id="targetAudience"
                      value={newAnnouncement.targetAudience}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetAudience: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Users</option>
                      <option value="learners">Learners Only</option>
                      <option value="applicants">Applicants Only</option>
                      <option value="admins">Admins Only</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="content">Content</Label>
                        <p className="text-sm text-gray-500">Write your announcement content or use AI to generate it</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={generateWithAI}
                        disabled={aiGenerating || !newAnnouncement.title.trim()}
                      >
                        {aiGenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
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
                    <Textarea
                      id="content"
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                      placeholder="Enter announcement content or click 'Generate with AI' to create professional content"
                      rows={8}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="sendEmail"
                          checked={newAnnouncement.sendEmail}
                          onCheckedChange={(checked) => setNewAnnouncement({ ...newAnnouncement, sendEmail: checked })}
                        />
                        <Label htmlFor="sendEmail">Send Email Notification</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="sendPush"
                          checked={newAnnouncement.sendPush}
                          onCheckedChange={(checked) => setNewAnnouncement({ ...newAnnouncement, sendPush: checked })}
                        />
                        <Label htmlFor="sendPush">Send Push Notification</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduledFor">Schedule for (Optional)</Label>
                    <Input
                      id="scheduledFor"
                      type="datetime-local"
                      value={newAnnouncement.scheduledFor}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, scheduledFor: e.target.value })}
                    />
                    <p className="text-sm text-gray-500">Leave empty to save as draft or send immediately</p>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createAnnouncement}>
                      <Megaphone className="w-4 h-4 mr-2" />
                      Create Announcement
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Announcements</p>
                  <p className="text-2xl font-bold text-gray-900">{announcements.length}</p>
                </div>
                <Megaphone className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {announcements.filter(a => a.status === 'sent').length}
                  </p>
                </div>
                <Send className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {announcements.filter(a => a.status === 'scheduled').length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {announcements.filter(a => a.status === 'draft').length}
                  </p>
                </div>
                <Edit className="w-8 h-8 text-gray-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="general">General</option>
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Announcements List */}
        <Card>
          <CardHeader>
            <CardTitle>Announcements ({filteredAnnouncements.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading announcements...</p>
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-8">
                <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
                <p className="text-gray-600">Create your first announcement to communicate with users.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="border rounded-lg p-6 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                          {getTypeBadge(announcement.type)}
                          {getStatusBadge(announcement.status)}
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>Target: {announcement.targetAudience}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Created: {formatDate(announcement.createdAt)}</span>
                          </div>
                          {announcement.sentAt && (
                            <div className="flex items-center space-x-1">
                              <Send className="w-4 h-4" />
                              <span>Sent: {formatDate(announcement.sentAt)}</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-700 line-clamp-3">{announcement.content}</p>
                        
                        {announcement.recipients && (
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-3">
                            <span>Total Recipients: {announcement.recipients.total}</span>
                            <span className="text-green-600">Delivered: {announcement.recipients.delivered}</span>
                            <span className="text-red-600">Failed: {announcement.recipients.failed}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {announcement.status === 'draft' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => sendAnnouncement(announcement.id)}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
