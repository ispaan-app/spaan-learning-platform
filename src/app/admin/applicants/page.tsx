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

// Helper to transform applicant Firestore document data into DocumentViewer format
// import type { Document } from '@/components/admin/DocumentViewer';

async function getApplicantDocuments(applicant: any): Promise<any[]> {
  if (!applicant) return [];
  try {
    const result = await getApplicantDocumentsAction(applicant.id);
    if (result.success && Array.isArray(result.documents)) {
      const documents = result.documents.map((doc: any) => ({
        ...doc,
        size: formatFileSize(doc.fileSize || 0)
      }));
      return documents;
    } else {
      console.error('Error fetching documents:', result.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
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
  Info,
  BookOpen
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, updateDoc, doc, onSnapshot } from 'firebase/firestore'
import { adminDb } from '@/lib/firebase-admin'
import { toast as sonnerToast } from 'sonner'
import { getApplicantDocumentsAction } from '@/app/actions/documentActions'
import { ProgramService } from '@/lib/program-service'

interface Applicant {
  id: string
  friendlyId?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  program: string
  highestQualification?: string
  fieldOfStudy?: string
  yearsOfExperience?: number
  applicationDate: string
  status: 'pending-review' | 'document-review' | 'approved' | 'rejected' | 'waitlisted'
  role?: 'applicant' | 'learner' | 'admin' | 'super-admin'
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
  const [applicantDocuments, setApplicantDocuments] = useState<any[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [applicantReadyForPromotion, setApplicantReadyForPromotion] = useState<Applicant | null>(null)
  const [programNames, setProgramNames] = useState<{ [key: string]: string }>({})
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
    
    // Set up real-time listener for applicants
    const applicantsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'applicant'),
      orderBy('createdAt', 'desc')
    )
    
    const unsubscribe = onSnapshot(applicantsQuery, (snapshot) => {
      const applicantsData = snapshot.docs.map(doc => ({
        id: doc.id,
        friendlyId: `APP-${doc.id.slice(-6).toUpperCase()}`,
        role: 'applicant', // Explicitly set role
        ...doc.data()
      })) as Applicant[]
      
      setApplicants(applicantsData)
      calculateStats(applicantsData)
      
      // Fetch program names for all unique program IDs
      const uniqueProgramIds = Array.from(new Set(applicantsData.map(a => a.program).filter(Boolean)))
      if (uniqueProgramIds.length > 0) {
        ProgramService.getProgramNamesByIds(uniqueProgramIds)
          .then(setProgramNames)
          .catch(error => {
            console.error('Error fetching program names:', error)
            const fallbackMap: { [key: string]: string } = {}
            uniqueProgramIds.forEach(id => {
              fallbackMap[id] = id
            })
            setProgramNames(fallbackMap)
          })
      }
    }, (error) => {
      console.error('Error in real-time listener:', error)
      // Fallback to manual refresh
      loadApplicants()
    })
    
    return () => unsubscribe()
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
        role: 'applicant', // Explicitly set role
        ...doc.data()
      })) as Applicant[]

      setApplicants(applicantsData)
      calculateStats(applicantsData)

      // Fetch program names for all unique program IDs using ProgramService
      const uniqueProgramIds = Array.from(new Set(applicantsData.map(a => a.program).filter(Boolean)))
      if (uniqueProgramIds.length > 0) {
        try {
          const programNamesMap = await ProgramService.getProgramNamesByIds(uniqueProgramIds)
          setProgramNames(programNamesMap)
        } catch (error) {
          console.error('Error fetching program names:', error)
          // Set fallback mapping
          const fallbackMap: { [key: string]: string } = {}
          uniqueProgramIds.forEach(id => {
            fallbackMap[id] = id
          })
          setProgramNames(fallbackMap)
        }
      }
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

    // Debug logging
    console.log('Calculating stats for applicants:', applicantsData.length)
    console.log('Sample applicant statuses:', applicantsData.slice(0, 3).map(a => ({ 
      name: `${a.firstName} ${a.lastName}`, 
      status: a.status, 
      createdAt: a.createdAt 
    })))

    const newStats: ApplicationStats = {
      total: applicantsData.length,
      pendingReview: applicantsData.filter(a => a.status === 'pending-review').length,
      documentReview: applicantsData.filter(a => a.status === 'document-review').length,
      approved: applicantsData.filter(a => a.status === 'approved').length,
      rejected: applicantsData.filter(a => a.status === 'rejected').length,
      waitlisted: applicantsData.filter(a => a.status === 'waitlisted').length,
      newThisWeek: applicantsData.filter(a => {
        try {
          return new Date(a.createdAt || a.applicationDate) > oneWeekAgo
        } catch (error) {
          console.warn('Invalid date for applicant:', a.id, a.createdAt, a.applicationDate)
          return false
        }
      }).length,
      newThisMonth: applicantsData.filter(a => {
        try {
          return new Date(a.createdAt || a.applicationDate) > oneMonthAgo
        } catch (error) {
          console.warn('Invalid date for applicant:', a.id, a.createdAt, a.applicationDate)
          return false
        }
      }).length
    }

    console.log('Calculated stats:', newStats)
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
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
    }
  }

  const handleViewDocuments = async (applicant: Applicant) => {
    setSelectedApplicant(applicant)
    setLoadingDocuments(true)
    setShowDocumentViewer(true)
    
    try {
      const documents = await getApplicantDocuments(applicant)
      setApplicantDocuments(documents)
    } catch (error) {
      console.error('Error loading documents:', error)
      sonnerToast.error('Failed to load documents')
    } finally {
      setLoadingDocuments(false)
    }
  }

  const handleApproveDocument = async (documentType: string) => {
    if (!selectedApplicant) return;
    try {
      // Find the document to approve
      const document = applicantDocuments.find(doc => doc.type === documentType);
      if (!document) {
        sonnerToast.error('Document not found');
        return;
      }

      // Call the reviewDocument action
      const response = await fetch('/api/documents/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          status: 'approved',
          reviewedBy: 'admin', // In a real app, use current user ID
        }),
      });

      if (response.ok) {
        // Update applicant's documentStatus in Firestore
        const newDocumentStatus = {
          ...(selectedApplicant.documentStatus || {}),
          [documentType]: 'approved',
        };
        // If all documents are approved, set applicant status to 'approved'
        const allApproved = Object.values(newDocumentStatus).filter(Boolean).length === 5 &&
          Object.values(newDocumentStatus).every(status => status === 'approved');
        await updateDoc(doc(db, 'users', selectedApplicant.id), {
          documentStatus: newDocumentStatus,
          status: allApproved ? 'approved' : 'document-review',
          updatedAt: new Date().toISOString(),
        });
        
        // Update local state immediately
        const updatedApplicant = {
          ...selectedApplicant,
          documentStatus: newDocumentStatus,
          status: (allApproved ? 'approved' : 'document-review') as 'approved' | 'document-review'
        } as Applicant;
        setSelectedApplicant(updatedApplicant);
        
        // Update the applicants list immediately
        setApplicants(prevApplicants => 
          prevApplicants.map(applicant => 
            applicant.id === selectedApplicant.id 
              ? updatedApplicant 
              : applicant
          )
        );
        
        // Update documents list immediately
        setApplicantDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc.type === documentType 
              ? { ...doc, status: 'approved' }
              : doc
          )
        );
        
        sonnerToast.success('Document approved successfully');
        
        // Check if all documents are now approved
      const updatedDocumentStatus = {
          ...(selectedApplicant.documentStatus || {}),
          [documentType]: 'approved',
        };
        
        const requiredDocuments = ['certifiedId', 'proofOfAddress', 'highestQualification', 'proofOfBanking', 'taxNumber'] as const;
        const allDocumentsApproved = requiredDocuments.every(docType => 
          updatedDocumentStatus[docType as keyof typeof updatedDocumentStatus] === 'approved'
        );
        
        if (allDocumentsApproved) {
          // Show success popup for promotion
          setApplicantReadyForPromotion(updatedApplicant);
          setShowSuccessPopup(true);
        }
      } else {
        sonnerToast.error('Failed to approve document');
      }
    } catch (error) {
      console.error('Error approving document:', error);
      sonnerToast.error('Failed to approve document');
    }
  }

  const handlePromoteToLearner = async (applicantId: string) => {
    try {
      const response = await fetch('/api/promote-to-learner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: applicantId,
          approvedBy: 'admin', // In a real app, use current user ID
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Remove the promoted applicant from the applicants list
        setApplicants(prevApplicants => 
          prevApplicants.filter(applicant => applicant.id !== applicantId)
        );
        
        // Close the document viewer and success popup
        setShowDocumentViewer(false);
        setShowSuccessPopup(false);
        setSelectedApplicant(null);
        setApplicantReadyForPromotion(null);
        
        sonnerToast.success('Applicant successfully promoted to learner!');
      } else {
        sonnerToast.error(result.error || 'Failed to promote to learner');
        if (result.details) {
          console.log('Promotion details:', result.details);
        }
      }
    } catch (error) {
      console.error('Error promoting to learner:', error);
      sonnerToast.error('Failed to promote to learner');
    }
  }

  const handlePromoteFromPopup = async () => {
    if (applicantReadyForPromotion) {
      await handlePromoteToLearner(applicantReadyForPromotion.id);
    }
  }

  const checkCanPromote = (applicant: Applicant) => {
    if (applicant.role !== 'applicant' || applicant.status !== 'approved') {
      return false;
    }
    
    if (!applicant.documentStatus) {
      return false;
    }
    
    const { documentStatus } = applicant;
    const requiredDocuments = [
      'certifiedId', 
      'proofOfAddress', 
      'highestQualification', 
      'proofOfBanking', 
      'taxNumber'
    ] as const;
    
    return requiredDocuments.every(docType => 
      documentStatus[docType] === 'approved'
    );
  }

  const handleRejectDocument = async (documentType: string, reason: string) => {
    if (!selectedApplicant) return;
    try {
      // Find the document to reject
      const document = applicantDocuments.find(doc => doc.type === documentType);
      if (!document) {
        sonnerToast.error('Document not found');
        return;
      }

      // Call the reviewDocument action
      const response = await fetch('/api/documents/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          status: 'rejected',
          reviewedBy: 'admin', // In a real app, use current user ID
          rejectionReason: reason,
        }),
      });

      if (response.ok) {
        // Update applicant's documentStatus in Firestore
        const newDocumentStatus = {
          ...(selectedApplicant.documentStatus || {}),
          [documentType]: 'rejected',
        };
        await updateDoc(doc(db, 'users', selectedApplicant.id), {
          documentStatus: newDocumentStatus,
          status: 'rejected',
          updatedAt: new Date().toISOString(),
        });
        
        // Update local state immediately
        const updatedApplicant = {
          ...selectedApplicant,
          documentStatus: newDocumentStatus,
          status: 'rejected' as 'rejected'
        } as Applicant;
        setSelectedApplicant(updatedApplicant);
        
        // Update the applicants list immediately
        setApplicants(prevApplicants => 
          prevApplicants.map(applicant => 
            applicant.id === selectedApplicant.id 
              ? updatedApplicant 
              : applicant
          )
        );
        
        // Update documents list immediately
        setApplicantDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc.type === documentType 
              ? { ...doc, status: 'rejected' }
              : doc
          )
        );
        
        sonnerToast.success('Document rejected successfully');
      } else {
        sonnerToast.error('Failed to reject document');
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
      sonnerToast.error('Failed to reject document');
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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  }

  // Helper function to get program name
  const getProgramName = (programId: string) => {
    return programNames[programId] || programId || 'Unknown Program'
  }

  const uniquePrograms = Array.from(new Set(applicants.map(a => getProgramName(a.program))))

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
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Application Statistics</h2>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Data</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {loading ? (
                      <div className="animate-pulse bg-blue-200 h-8 w-12 rounded"></div>
                    ) : (
                      stats.total
                    )}
                  </p>
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
                  <p className="text-3xl font-bold text-yellow-600">
                    {loading ? (
                      <div className="animate-pulse bg-yellow-200 h-8 w-8 rounded"></div>
                    ) : (
                      stats.pendingReview
                    )}
                  </p>
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
                  <p className="text-3xl font-bold text-green-600">
                    {loading ? (
                      <div className="animate-pulse bg-green-200 h-8 w-8 rounded"></div>
                    ) : (
                      stats.approved
                    )}
                  </p>
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
                  <p className="text-3xl font-bold text-purple-600">
                    {loading ? (
                      <div className="animate-pulse bg-purple-200 h-8 w-8 rounded"></div>
                    ) : (
                      stats.newThisWeek
                    )}
                  </p>
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
                              <div className="ml-4">{getStatusBadge(applicant.status)}</div>
                          </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>
                              <span className="font-medium">Applied:</span> {
                                applicant.createdAt && !isNaN(new Date(applicant.createdAt).getTime())
                                  ? formatDate(applicant.createdAt)
                                  : applicant.applicationDate && !isNaN(new Date(applicant.applicationDate).getTime())
                                    ? formatDate(applicant.applicationDate)
                                    : 'N/A'
                              }
                            </span>
                        </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <User className="w-4 h-4 text-green-600" />
                              <span><span className="font-medium">Program:</span> {getProgramName(applicant.program)}</span>
                      </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Phone className="w-4 h-4 text-purple-600" />
                            <span><span className="font-medium">Phone:</span> {applicant.phone}</span>
                      </div>
                    </div>
                    
                        {/* Additional Program Information */}
                        {(applicant.highestQualification || applicant.fieldOfStudy || applicant.yearsOfExperience) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {applicant.highestQualification && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                                <Award className="w-4 h-4 text-blue-600" />
                                <span><span className="font-medium">Qualification:</span> {applicant.highestQualification}</span>
                              </div>
                            )}
                            {applicant.fieldOfStudy && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                                <BookOpen className="w-4 h-4 text-green-600" />
                                <span><span className="font-medium">Field:</span> {applicant.fieldOfStudy}</span>
                              </div>
                            )}
                            {applicant.yearsOfExperience !== undefined && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-orange-50 px-3 py-2 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-orange-600" />
                                <span><span className="font-medium">Experience:</span> {applicant.yearsOfExperience} years</span>
                              </div>
                            )}
                          </div>
                        )}
                    
                    {/* Document Status - Real Data */}
                        {applicant.documentStatus && (
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900">Document Status</h4>
                              {checkCanPromote(applicant) && (
                                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Ready for Promotion</span>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              {Object.entries(applicant.documentStatus).map(([docType, status]) => (
                                <div key={docType} className="flex items-center space-x-2">
                                  {status === 'approved' ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : status === 'rejected' ? (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-yellow-600" />
                                  )}
                                  <span className="text-sm text-gray-700 capitalize">
                                    {docType.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    status === 'approved' ? 'bg-green-100 text-green-800' :
                                    status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {status}
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
                              
                              {checkCanPromote(applicant) && (
                                <Button
                                  onClick={() => handlePromoteToLearner(applicant.id)}
                                  className="px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Promote to Learner
                                </Button>
                              )}
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
              setApplicantDocuments([])
            }}
            applicant={selectedApplicant}
            documents={applicantDocuments}
            onApprove={handleApproveDocument}
            onReject={handleRejectDocument}
            loading={loadingDocuments}
          />
        )}

        {/* Success Popup Modal */}
        {showSuccessPopup && applicantReadyForPromotion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                {/* Success Icon */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                
                {/* Success Message */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  🎉 All Documents Approved!
                </h3>
                
                <p className="text-gray-600 mb-6">
                  <span className="font-semibold">{applicantReadyForPromotion.firstName} {applicantReadyForPromotion.lastName}</span> has successfully submitted all required documents and is ready to be promoted to a learner.
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handlePromoteFromPopup}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Promote to Learner
                  </Button>
                  
                  <Button
                    onClick={() => setShowSuccessPopup(false)}
                    variant="outline"
                    className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                  >
                    Close
                  </Button>
                </div>
                
                {/* Additional Info */}
                <p className="text-xs text-gray-500 mt-4">
                  This action will move the applicant to learner management and remove them from the applicants list.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}