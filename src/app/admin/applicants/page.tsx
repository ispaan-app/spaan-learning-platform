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
import DocumentViewer from '@/components/admin/DocumentViewer'
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  FileX,
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Zap,
  Award,
  Activity,
  BarChart3,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  MoreVertical,
  Trash2,
  Edit,
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
  Info
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore'
import { toast as sonnerToast } from 'sonner'

interface Applicant {
  id: string
  friendlyId?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  program: string
  applicationDate: string
  status: 'pending-review' | 'document-review' | 'approved' | 'rejected' | 'waitlisted'
  documents?: {
    certifiedId: boolean
    proofOfAddress: boolean
    highestQualification: boolean
    proofOfBanking: boolean
    taxNumber: boolean
  }
  documentStatus?: {
    certifiedId: 'pending' | 'approved' | 'rejected'
    proofOfAddress: 'pending' | 'approved' | 'rejected'
    highestQualification: 'pending' | 'approved' | 'rejected'
    proofOfBanking: 'pending' | 'approved' | 'rejected'
    taxNumber: 'pending' | 'approved' | 'rejected'
  }
  rejectionReasons?: string[]
  profile: {
    location?: string
    bio?: string
    experience?: string
    education?: string
  }
  createdAt: string
  updatedAt: string
}

interface ApplicationStats {
  total: number
  pendingReview: number
  documentReview: number
  approved: number
  rejected: number
  waitlisted: number
  newThisWeek: number
  newThisMonth: number
}

export default function AdminApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [programFilter, setProgramFilter] = useState('all')
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
  const [showDocumentViewer, setShowDocumentViewer] = useState(false)
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pendingReview: 0,
    documentReview: 0,
    approved: 0,
    rejected: 0,
    waitlisted: 0,
    newThisWeek: 0,
    newThisMonth: 0
  })

  useEffect(() => {
    loadApplicants()
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadApplicants()
    }, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const loadApplicants = async () => {
    try {
        setLoading(true)
      const applicantsSnapshot = await getDocs(query(
        collection(db, 'users'),
        where('role', '==', 'applicant'),
        orderBy('createdAt', 'desc')
      ))

      const applicantsData = applicantsSnapshot.docs.map(doc => ({
          id: doc.id,
        friendlyId: `APP-${doc.id.slice(-6).toUpperCase()}`,
        ...doc.data()
      })) as Applicant[]

      setApplicants(applicantsData)
      calculateStats(applicantsData)
    } catch (error) {
      console.error('Error loading applicants:', error)
      sonnerToast.error('Failed to load applicants')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (applicantsData: Applicant[]) => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const newStats: ApplicationStats = {
      total: applicantsData.length,
      pendingReview: applicantsData.filter(a => a.status === 'pending-review').length,
      documentReview: applicantsData.filter(a => a.status === 'document-review').length,
      approved: applicantsData.filter(a => a.status === 'approved').length,
      rejected: applicantsData.filter(a => a.status === 'rejected').length,
      waitlisted: applicantsData.filter(a => a.status === 'waitlisted').length,
      newThisWeek: applicantsData.filter(a => new Date(a.createdAt) > oneWeekAgo).length,
      newThisMonth: applicantsData.filter(a => new Date(a.createdAt) > oneMonthAgo).length
    }

    setStats(newStats)
  }

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.program.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter
    const matchesProgram = programFilter === 'all' || applicant.program === programFilter

    return matchesSearch && matchesStatus && matchesProgram
  })

  const formatProgramName = (program: string) => {
    return program.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending-review':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      case 'document-review':
        return <Badge className="bg-blue-100 text-blue-800">Document Review</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case 'waitlisted':
        return <Badge className="bg-purple-100 text-purple-800">Waitlisted</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const handleViewDocuments = (applicant: Applicant) => {
    setSelectedApplicant(applicant)
    setShowDocumentViewer(true)
  }

  const handleApproveDocument = (documentType: string) => {
    if (selectedApplicant) {
      // Update document status
      const updatedDocumentStatus = {
        ...selectedApplicant.documentStatus,
        [documentType]: 'approved'
      }

      // Check if all documents are approved
      const allApproved = Object.values(updatedDocumentStatus).every(status => status === 'approved')
      
      // Update applicant status
      const newStatus = allApproved ? 'approved' : 'document-review'
      
      updateApplicantStatus(selectedApplicant.id, newStatus, updatedDocumentStatus)
    }
  }

  const handleRejectDocument = (documentType: string, reason: string) => {
    if (selectedApplicant) {
      // Update document status
      const updatedDocumentStatus = {
        ...selectedApplicant.documentStatus,
        [documentType]: 'rejected'
      }

      // Update rejection reasons
      const updatedRejectionReasons = [
        ...(selectedApplicant.rejectionReasons || []),
        `${documentType}: ${reason}`
      ]
      
      // Update applicant status
      updateApplicantStatus(selectedApplicant.id, 'rejected', updatedDocumentStatus, updatedRejectionReasons)
    }
  }

  const updateApplicantStatus = async (applicantId: string, status: string, documentStatus?: any, rejectionReasons?: string[]) => {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      }
      
      if (documentStatus) {
        updateData.documentStatus = documentStatus
      }
      
      if (rejectionReasons) {
        updateData.rejectionReasons = rejectionReasons
      }
      
      await updateDoc(doc(db, 'users', applicantId), updateData)
      
      sonnerToast.success(`Applicant ${status === 'approved' ? 'approved' : 'rejected'} successfully`)
      loadApplicants()
    } catch (error) {
      console.error('Error updating applicant status:', error)
      sonnerToast.error('Failed to update applicant status')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid Date'
    }
  }

  const programMap: { [key: string]: string } = {
    'software-development': 'Software Development',
    'data-science': 'Data Science',
    'cybersecurity': 'Cybersecurity',
    'digital-marketing': 'Digital Marketing'
  }

  const uniquePrograms = Array.from(new Set(applicants.map(a => programMap[a.program] || a.program)))

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
                      Applicant Management
                    </h1>
                    <p className="text-gray-600 text-lg">Review and manage all applications</p>
          </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={loadApplicants} 
                  disabled={loading}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Refresh</span>
            </Button>
                <Button 
                  className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#FF6E40' }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Export</span>
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
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-600">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Activity className="h-4 w-4 mr-1" />
                <span>All applications</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingReview}</p>
                </div>
                <div className="p-3 rounded-xl bg-yellow-600">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span>Awaiting review</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-600">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Award className="h-4 w-4 mr-1" />
                <span>Successfully approved</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">New This Week</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.newThisWeek}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-600">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Recent applications</span>
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
                <label className="block text-sm font-medium text-gray-700">Search Applicants</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by name, email, or program..."
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
                    <SelectItem value="pending-review">Pending Review</SelectItem>
                    <SelectItem value="document-review">Document Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="waitlisted">Waitlisted</SelectItem>
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
                    {uniquePrograms.map(program => (
                      <SelectItem key={program} value={program}>
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Applicants List */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3D59] to-[#2D5A87] opacity-5 rounded-2xl"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: '#FF6E40' }}>
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: '#1E3D59' }}>
                  Applicants ({filteredApplicants.length})
                </h3>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading applicants...</h3>
                <p className="text-gray-600">Please wait while we fetch the latest data</p>
              </div>
            ) : filteredApplicants.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants found</h3>
                <p className="text-gray-600">No applicants match your current filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplicants.map((applicant) => (
                  <Card key={applicant.id} className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {applicant.firstName.charAt(0)}{applicant.lastName.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                            {applicant.firstName} {applicant.lastName}
                          </h3>
                            <p className="text-gray-600">{applicant.email}</p>
                            <p className="text-sm text-gray-500">ID: {applicant.friendlyId}</p>
                          </div>
                            {getStatusBadge(applicant.status)}
                          </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span><span className="font-medium">Applied:</span> {formatDate(applicant.applicationDate)}</span>
                        </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <User className="w-4 h-4 text-green-600" />
                            <span><span className="font-medium">Program:</span> {formatProgramName(applicant.program)}</span>
                      </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Phone className="w-4 h-4 text-purple-600" />
                            <span><span className="font-medium">Phone:</span> {applicant.phone}</span>
                      </div>
                    </div>
                    
                    {/* Document Status */}
                        {applicant.documents && (
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Document Status</h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              {Object.entries(applicant.documents).map(([docType, uploaded]) => (
                                <div key={docType} className="flex items-center space-x-2">
                                  {uploaded ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  )}
                                  <span className="text-sm text-gray-700 capitalize">
                                    {docType.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                  </div>
                ))}
                          </div>
                        </div>
                      )}
                  </div>
                  
                      <div className="flex flex-col space-y-2 ml-4">
                              <Button
                          onClick={() => handleViewDocuments(applicant)}
                          className="px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          style={{ backgroundColor: '#FF6E40' }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Documents
                              </Button>
                              <Button
                          variant="outline" 
                          className="px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                              </Button>
                            </div>
                        </div>
                  </Card>
                    ))}
                  </div>
            )}
                  </div>
                </div>

        {/* Document Viewer Modal */}
        {selectedApplicant && (
          <DocumentViewer
            isOpen={showDocumentViewer}
            onClose={() => {
              setShowDocumentViewer(false)
              setSelectedApplicant(null)
            }}
            applicant={selectedApplicant}
            onApprove={handleApproveDocument}
            onReject={handleRejectDocument}
          />
        )}
      </div>
    </AdminLayout>
  )
}