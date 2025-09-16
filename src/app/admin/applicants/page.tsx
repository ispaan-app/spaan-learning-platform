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
  Target
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit, updateDoc, doc } from 'firebase/firestore'
import { getProgramsAction } from '../placements/actions'
import { toast as sonnerToast } from 'sonner'
import { generateApplicantIdWithName, formatApplicantIdForDisplay } from '@/lib/applicant-id-generator'

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
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [programs, setPrograms] = useState<Array<{ id: string; name: string; description?: string }>>([])
  const [programMap, setProgramMap] = useState<Record<string, string>>({})
  const [refreshing, setRefreshing] = useState(false)
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
  // Toast notifications using Sonner

  useEffect(() => {
    loadApplicants()
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    try {
      const programsData = await getProgramsAction()
      setPrograms(programsData)
      
      // Create a mapping from program ID to program name
      const mapping: Record<string, string> = {}
      programsData.forEach(program => {
        mapping[program.id] = program.name
      })
      setProgramMap(mapping)
    } catch (error) {
      console.error('Error loading programs:', error)
    }
  }

  const loadApplicants = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      console.log('Loading applicants from Firestore...')
      
      const applicantsSnapshot = await getDocs(query(
        collection(db, 'users'),
        where('role', '==', 'applicant'),
        orderBy('createdAt', 'desc')
      ))

      console.log(`Found ${applicantsSnapshot.docs.length} applicants`)


// Centralized required documents config
const REQUIRED_DOCUMENTS = {
  certifiedId: true,
  proofOfAddress: true,
  highestQualification: true,
  proofOfBanking: true,
  taxNumber: true
};

const REQUIRED_DOCUMENTS_STATUS = {
  certifiedId: 'pending',
  proofOfAddress: 'pending',
  highestQualification: 'pending',
  proofOfBanking: 'pending',
  taxNumber: 'pending'
};

      const applicantsData = applicantsSnapshot.docs.map(doc => {
        const data = doc.data()
        console.log('Processing applicant:', doc.id, data.firstName, data.lastName)
        return {
          id: doc.id,
          // Basic information with fallbacks
          firstName: data.firstName || 'Unknown',
          lastName: data.lastName || 'User',
          email: data.email || 'No email',
          phone: data.phone || 'No phone',
          program: data.program || 'No program',
          // Generate friendly Applicant ID
          friendlyId: data.friendlyId || generateApplicantIdWithName(data.firstName || 'Unknown', data.lastName || 'User'),
          // Convert Firestore Timestamps to strings
          applicationDate: data.applicationDate?.toDate?.()?.toISOString() || data.applicationDate || new Date().toISOString(),
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
          // Ensure status is valid
          status: data.status || 'pending-review',
          // Use centralized required documents
          documentStatus: {
            ...REQUIRED_DOCUMENTS_STATUS,
            ...(data.documentStatus || {})
          },
          documents: {
            ...REQUIRED_DOCUMENTS,
            ...(data.documents || {})
          },
          // Profile information with fallbacks
          profile: data.profile || {
            location: data.location || 'No location',
            bio: data.bio || 'No bio available',
            experience: data.experience || 'No experience listed',
            education: data.education || 'No education listed'
          },
          // Rejection reasons
          rejectionReasons: data.rejectionReasons || []
        }
      }) as Applicant[]

      console.log('Processed applicants:', applicantsData.length)
      setApplicants(applicantsData)
      calculateStats(applicantsData)
      
      if (isRefresh) {
        sonnerToast.success('Applicants refreshed successfully')
      }
    } catch (error) {
      console.error('Error loading applicants:', error)
      sonnerToast.error('Failed to load applicants')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadApplicants(true)
  }

  const calculateStats = (applicantsData: Applicant[]) => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const newStats = {
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

  const approveApplication = async (applicantId: string) => {
    try {
      await updateDoc(doc(db, 'users', applicantId), {
        status: 'approved',
        updatedAt: new Date().toISOString()
      })

      sonnerToast.success('Application approved successfully')

      loadApplicants()
    } catch (error) {
      console.error('Error approving application:', error)
      sonnerToast.error('Failed to approve application')
    }
  }

  const rejectApplication = async (applicantId: string) => {
    if (!rejectionReason.trim()) {
      sonnerToast.error('Please provide a rejection reason')
      return
    }

    try {
      await updateDoc(doc(db, 'users', applicantId), {
        status: 'rejected',
        rejectionReasons: [rejectionReason],
        updatedAt: new Date().toISOString()
      })

      sonnerToast.success('Application rejected successfully')

      setShowRejectionModal(false)
      setRejectionReason('')
      loadApplicants()
    } catch (error) {
      console.error('Error rejecting application:', error)
      sonnerToast.error('Failed to reject application')
    }
  }

  const approveDocument = async (applicantId: string, documentType: string) => {
    try {
      const applicant = applicants.find(a => a.id === applicantId)
      if (!applicant) return

      const currentDocumentStatus = applicant.documentStatus || {
        certifiedId: 'pending',
        proofOfAddress: 'pending',
        highestQualification: 'pending',
        proofOfBanking: 'pending',
        taxNumber: 'pending'
      }

      const updatedDocumentStatus = {
        ...currentDocumentStatus,
        [documentType]: 'approved'
      }

      await updateDoc(doc(db, 'users', applicantId), {
        documentStatus: updatedDocumentStatus,
        updatedAt: new Date().toISOString()
      })

      sonnerToast.success(`${getDocumentDisplayName(documentType)} approved`)

      loadApplicants()
    } catch (error) {
      console.error('Error approving document:', error)
      sonnerToast.error('Failed to approve document')
    }
  }

  const rejectDocument = async (applicantId: string, documentType: string) => {
    try {
      const applicant = applicants.find(a => a.id === applicantId)
      if (!applicant) return

      const currentDocumentStatus = applicant.documentStatus || {
        certifiedId: 'pending',
        proofOfAddress: 'pending',
        highestQualification: 'pending',
        proofOfBanking: 'pending',
        taxNumber: 'pending'
      }

      const updatedDocumentStatus = {
        ...currentDocumentStatus,
        [documentType]: 'rejected'
      }

      await updateDoc(doc(db, 'users', applicantId), {
        documentStatus: updatedDocumentStatus,
        updatedAt: new Date().toISOString()
      })

      sonnerToast.success(`${getDocumentDisplayName(documentType)} rejected`)

      loadApplicants()
    } catch (error) {
      console.error('Error rejecting document:', error)
      sonnerToast.error('Failed to reject document')
    }
  }

  const promoteToLearner = async (applicantId: string) => {
    try {
      const applicant = applicants.find(a => a.id === applicantId)
      if (!applicant) return

      // Check if all documents are approved
      const documentStatus = applicant.documentStatus || {}
      const allDocumentsApproved = Object.values(documentStatus).every(status => status === 'approved')
      
      if (!allDocumentsApproved) {
        sonnerToast.error('All documents must be approved before promoting to learner')
        return
      }

      await updateDoc(doc(db, 'users', applicantId), {
        role: 'learner',
        status: 'approved',
        promotedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      sonnerToast.success(`${applicant.firstName} ${applicant.lastName} promoted to learner`)

      loadApplicants()
    } catch (error) {
      console.error('Error promoting to learner:', error)
      sonnerToast.error('Failed to promote to learner')
    }
  }

  const filteredApplicants = applicants.filter(applicant => {
    const programName = programMap[applicant.program] || applicant.program
    
    const matchesSearch = !searchTerm || 
      applicant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter
    const matchesProgram = programFilter === 'all' || programName === programFilter

    return matchesSearch && matchesStatus && matchesProgram
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending-review':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      case 'document-review':
        return <Badge className="bg-blue-100 text-blue-800">Document Review</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'waitlisted':
        return <Badge className="bg-purple-100 text-purple-800">Waitlisted</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getDocumentDisplayName = (docType: string) => {
    const displayNames: Record<string, string> = {
      certifiedId: 'Certified ID Document',
      proofOfAddress: 'Proof of Address',
      highestQualification: 'Highest Qualification Certificate',
      proofOfBanking: 'Bank Confirmation Letter',
      taxNumber: 'Tax Number'
    }
    return displayNames[docType] || docType
  }

  const isAllDocumentsApproved = (documentStatus: any) => {
    if (!documentStatus) return false
    return Object.values(documentStatus).every(status => status === 'approved')
  }

  const getDocumentProgress = (documentStatus: any) => {
    if (!documentStatus) return { approved: 0, total: 5, percentage: 0 }
    const statuses = Object.values(documentStatus)
    const approved = statuses.filter(status => status === 'approved').length
    const total = statuses.length
    const percentage = Math.round((approved / total) * 100)
    return { approved, total, percentage }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid Date'
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }
      return date.toLocaleString('en-US', {
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

  const uniquePrograms = Array.from(new Set(applicants.map(a => programMap[a.program] || a.program)))

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application Review</h1>
            <p className="text-gray-600 mt-1">Review new applications, approve/reject documents, and promote applicants to learners</p>
            {applicants.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Showing {filteredApplicants.length} of {applicants.length} applicants
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing || loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.newThisWeek}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
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
                    placeholder="Search applicants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger>
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
          </CardContent>
        </Card>

        {/* Applicants List */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredApplicants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading applications...</p>
              </div>
            ) : applicants.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants found</h3>
                <p className="text-gray-600">No applicants have submitted applications yet.</p>
                <Button onClick={handleRefresh} className="mt-4">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            ) : filteredApplicants.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-600">No applications match your current filters.</p>
                <Button onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setProgramFilter('all')
                }} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="border rounded-lg p-6 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {applicant.firstName.charAt(0)}{applicant.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {applicant.firstName} {applicant.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{applicant.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{programMap[applicant.program] || applicant.program}</Badge>
                            {getStatusBadge(applicant.status)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplicant(applicant)
                            setShowDetailModal(true)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        {applicant.status === 'pending-review' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => approveApplication(applicant.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedApplicant(applicant)
                                setShowRejectionModal(true)
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {applicant.status === 'document-review' && (() => {
                          const documentStatus = applicant.documentStatus || {}
                          const allDocumentsApproved = Object.values(documentStatus).every(status => status === 'approved')
                          return allDocumentsApproved && (
                            <Button
                              size="sm"
                              onClick={() => promoteToLearner(applicant.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Users className="w-4 h-4 mr-1" />
                              Promote to Learner
                            </Button>
                          )
                        })()}
                      </div>
                    </div>
                    
                    {/* Document Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {Object.entries(applicant.documents || {}).map(([docType, required]) => (
                        required && (
                          <div key={docType} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center space-x-2">
                              {getDocumentStatusIcon((applicant.documentStatus?.[docType as keyof typeof applicant.documentStatus]) || 'pending')}
                              <span className="text-sm font-medium">{getDocumentDisplayName(docType)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {(applicant.documentStatus?.[docType as keyof typeof applicant.documentStatus]) || 'pending'}
                              </span>
                              {(applicant.documentStatus?.[docType as keyof typeof applicant.documentStatus]) === 'pending' && (
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => approveDocument(applicant.id, docType)}
                                    className="hover:bg-green-100"
                                    title="Approve Document"
                                  >
                                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => rejectDocument(applicant.id, docType)}
                                    className="hover:bg-red-100"
                                    title="Reject Document"
                                  >
                                    <XCircle className="w-3 h-3 text-red-600" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Applied: {formatDate(applicant.applicationDate)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs font-mono text-blue-600">
                            ID: {applicant.friendlyId || formatApplicantIdForDisplay(applicant.id)}
                          </span>
                        </div>
                        {applicant.profile?.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{applicant.profile.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Updated: {formatDate(applicant.updatedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Details Modal */}
        {showDetailModal && selectedApplicant && (
          <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Application Details - {selectedApplicant.firstName} {selectedApplicant.lastName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Personal Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <User className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Full Name</span>
                          <p className="text-sm text-gray-900">{selectedApplicant.firstName} {selectedApplicant.lastName}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Email Address</span>
                          <p className="text-sm text-gray-900">{selectedApplicant.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Phone Number</span>
                          <p className="text-sm text-gray-900">{selectedApplicant.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Target className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Program Applied For</span>
                          <p className="text-sm text-gray-900">{programMap[selectedApplicant.program] || selectedApplicant.program}</p>
                        </div>
                      </div>
                      {selectedApplicant.profile?.location && (
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div>
                            <span className="text-sm font-medium text-gray-700">Location</span>
                            <p className="text-sm text-gray-900">{selectedApplicant.profile.location}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Application Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Current Status</span>
                        {getStatusBadge(selectedApplicant.status)}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Application Date</span>
                        <span className="text-sm text-gray-900">{formatDateTime(selectedApplicant.applicationDate)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Last Updated</span>
                        <span className="text-sm text-gray-900">{formatDateTime(selectedApplicant.updatedAt)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Applicant ID</span>
                        <span className="text-sm text-gray-900 font-mono">{selectedApplicant.friendlyId || formatApplicantIdForDisplay(selectedApplicant.id)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Document ID</span>
                        <span className="text-xs text-gray-500 font-mono">{selectedApplicant.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Document Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedApplicant.documents || {}).map(([docType, required]) => (
                      required && (
                        <div key={docType} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            {getDocumentStatusIcon((selectedApplicant.documentStatus?.[docType as keyof typeof selectedApplicant.documentStatus]) || 'pending')}
                            <div>
                              <span className="text-sm font-medium text-gray-900">{getDocumentDisplayName(docType)}</span>
                              <p className="text-xs text-gray-500">
                                Status: {(selectedApplicant.documentStatus?.[docType as keyof typeof selectedApplicant.documentStatus]) || 'pending'}
                              </p>
                            </div>
                          </div>
                          {(selectedApplicant.documentStatus?.[docType as keyof typeof selectedApplicant.documentStatus]) === 'pending' && (
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => approveDocument(selectedApplicant.id, docType)}
                                className="hover:bg-green-100"
                                title="Approve Document"
                              >
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => rejectDocument(selectedApplicant.id, docType)}
                                className="hover:bg-red-100"
                                title="Reject Document"
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                  
                  {/* Document Summary */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-blue-900">Document Summary</h4>
                      {isAllDocumentsApproved(selectedApplicant.documentStatus) && (
                        <Badge className="bg-green-100 text-green-800">
                          Ready for Promotion
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center mb-3">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {Object.entries(selectedApplicant.documentStatus || {}).filter(([_, status]) => status === 'approved').length}
                        </div>
                        <div className="text-xs text-gray-600">Approved</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {Object.entries(selectedApplicant.documentStatus || {}).filter(([_, status]) => status === 'pending').length}
                        </div>
                        <div className="text-xs text-gray-600">Pending</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {Object.entries(selectedApplicant.documentStatus || {}).filter(([_, status]) => status === 'rejected').length}
                        </div>
                        <div className="text-xs text-gray-600">Rejected</div>
                      </div>
                    </div>
                    {(() => {
                      const progress = getDocumentProgress(selectedApplicant.documentStatus)
                      return (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                      )
                    })()}
                    <div className="text-xs text-gray-600 mt-2 text-center">
                      {(() => {
                        const progress = getDocumentProgress(selectedApplicant.documentStatus)
                        return `${progress.approved} of ${progress.total} documents approved (${progress.percentage}%)`
                      })()}
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                {selectedApplicant.profile && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedApplicant.profile.bio && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Bio</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{selectedApplicant.profile.bio}</p>
                        </div>
                      )}
                      {selectedApplicant.profile.experience && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Experience</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{selectedApplicant.profile.experience}</p>
                        </div>
                      )}
                      {selectedApplicant.profile.education && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Education</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{selectedApplicant.profile.education}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rejection Reasons */}
                {selectedApplicant.rejectionReasons && selectedApplicant.rejectionReasons.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Rejection Reasons</h3>
                    <div className="space-y-2">
                      {selectedApplicant.rejectionReasons.map((reason, index) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">{reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                    Close
                  </Button>
                  {selectedApplicant.status === 'pending-review' && (
                    <>
                      <Button
                        onClick={() => approveApplication(selectedApplicant.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Application
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setShowDetailModal(false)
                          setShowRejectionModal(true)
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Application
                      </Button>
                    </>
                  )}
                  {selectedApplicant.status === 'document-review' && (() => {
                    const documentStatus = selectedApplicant.documentStatus || {}
                    const allDocumentsApproved = Object.values(documentStatus).every(status => status === 'approved')
                    return allDocumentsApproved && (
                      <Button
                        onClick={() => promoteToLearner(selectedApplicant.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Promote to Learner
                      </Button>
                    )
                  })()}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Rejection Modal */}
        {showRejectionModal && selectedApplicant && (
          <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Reject Application</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a clear reason for rejection..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setShowRejectionModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => rejectApplication(selectedApplicant.id)}
                    disabled={!rejectionReason.trim()}
                  >
                    Reject Application
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  )
}

