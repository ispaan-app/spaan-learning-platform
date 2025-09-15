'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AiChatbot } from '@/components/ai-chatbot'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { WelcomeCard } from '@/components/ui/welcome-card'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  User,
  BookOpen,
  TrendingUp,
  Award,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react'

interface Document {
  name: string
  status: 'uploaded' | 'pending' | 'rejected' | 'approved'
  required: boolean
  uploadedAt?: string
  url?: string
  rejectionReason?: string
}

interface Activity {
  id: string
  action: string
  timestamp: string
  type: 'document' | 'status' | 'review' | 'notification'
}

interface TimelineStep {
  step: string
  date: string
  status: 'completed' | 'in-progress' | 'upcoming' | 'pending'
}

export default function ApplicantDashboardPage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userApplication, setUserApplication] = useState<any>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [timeline, setTimeline] = useState<TimelineStep[]>([])
  const [applicantStats, setApplicantStats] = useState({
    applicationProgress: 0,
    documentsUploaded: 0,
    totalDocuments: 0,
    daysSinceApplication: 0,
    nextStep: 'Application Submitted'
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login/user')
    }
  }, [user, authLoading, router])

  // Fetch user application data
  useEffect(() => {
    if (!user) return

    const fetchApplicationData = async () => {
      try {
        setLoading(true)
        
        // Fetch user application data
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUserApplication(userData)
          
          // Calculate application progress
          const requiredDocs = ['certifiedId', 'proofOfAddress', 'highestQualification', 'proofOfBanking', 'taxNumber']
          const uploadedDocs = Object.keys(userData.documents || {}).filter(
            key => userData.documents[key]?.status === 'uploaded'
          ).length
          
          const progress = Math.round((uploadedDocs / requiredDocs.length) * 100)
          
          // Calculate days since application
          const applicationDate = userData.createdAt?.toDate() || new Date()
          const daysSince = Math.floor((new Date().getTime() - applicationDate.getTime()) / (1000 * 60 * 60 * 24))
          
          setApplicantStats({
            applicationProgress: progress,
            documentsUploaded: uploadedDocs,
            totalDocuments: requiredDocs.length,
            daysSinceApplication: daysSince,
            nextStep: getNextStep(userData.status, progress)
          })
          
          // Set up documents
          const docs: Document[] = [
            { 
              name: 'Certified ID', 
              status: userData.documents?.certifiedId?.status || 'pending', 
              required: true,
              uploadedAt: userData.documents?.certifiedId?.uploadedAt,
              url: userData.documents?.certifiedId?.url,
              rejectionReason: userData.documents?.certifiedId?.rejectionReason
            },
            { 
              name: 'Proof of Address', 
              status: userData.documents?.proofOfAddress?.status || 'pending', 
              required: true,
              uploadedAt: userData.documents?.proofOfAddress?.uploadedAt,
              url: userData.documents?.proofOfAddress?.url,
              rejectionReason: userData.documents?.proofOfAddress?.rejectionReason
            },
            { 
              name: 'Highest Qualification Certificate', 
              status: userData.documents?.highestQualification?.status || 'pending', 
              required: true,
              uploadedAt: userData.documents?.highestQualification?.uploadedAt,
              url: userData.documents?.highestQualification?.url,
              rejectionReason: userData.documents?.highestQualification?.rejectionReason
            },
            { 
              name: 'Proof of Banking', 
              status: userData.documents?.proofOfBanking?.status || 'pending', 
              required: true,
              uploadedAt: userData.documents?.proofOfBanking?.uploadedAt,
              url: userData.documents?.proofOfBanking?.url,
              rejectionReason: userData.documents?.proofOfBanking?.rejectionReason
            },
            { 
              name: 'Tax Number', 
              status: userData.documents?.taxNumber?.status || 'pending', 
              required: true,
              uploadedAt: userData.documents?.taxNumber?.uploadedAt,
              url: userData.documents?.taxNumber?.url,
              rejectionReason: userData.documents?.taxNumber?.rejectionReason
            }
          ]
          setDocuments(docs)
          
          // Set up timeline
          const timelineSteps: TimelineStep[] = [
            { step: 'Application Submitted', date: applicationDate.toLocaleDateString(), status: 'completed' },
            { step: 'Documents Under Review', date: '', status: progress > 0 ? 'in-progress' : 'upcoming' },
            { step: 'Document Verification', date: '', status: 'upcoming' },
            { step: 'Final Decision', date: '', status: 'pending' }
          ]
          setTimeline(timelineSteps)
        }
      } catch (error) {
        console.error('Error fetching application data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplicationData()
  }, [user])

  // Set up real-time activity updates
  useEffect(() => {
    if (!user) return

    const activitiesQuery = query(
      collection(db, 'activities'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
      const activities: Activity[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[]
      setRecentActivity(activities)
    })

    return () => unsubscribe()
  }, [user])

  const getNextStep = (status: string, progress: number) => {
    if (progress < 100) return 'Complete Document Upload'
    if (status === 'pending_review') return 'Document Review'
    if (status === 'under_review') return 'Document Verification'
    if (status === 'approved') return 'Application Approved'
    if (status === 'rejected') return 'Application Rejected'
    return 'Document Review'
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    // Refresh logic will be handled by the useEffect
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleDocumentUpload = (documentType: string) => {
    // Navigate to document upload page
    router.push(`/applicant/upload?type=${documentType}`)
  }

  const handleViewApplication = () => {
    router.push('/applicant/application')
  }

  // Profile functionality removed

  // Helper function to safely convert dates
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'Not uploaded'
    
    try {
      // If it's a Firestore Timestamp, convert it
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate().toLocaleDateString()
      }
      // If it's already a Date object or valid date string
      return new Date(dateValue).toLocaleDateString()
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid Date'
    }
  }

  const handleDocumentStatusUpdate = async (documentType: string, status: string, rejectionReason?: string) => {
    if (!user) return

    try {
      const userRef = doc(db, 'users', user.uid)
      const updateData: any = {
        [`documents.${documentType}.status`]: status,
        [`documents.${documentType}.updatedAt`]: new Date().toISOString(),
        updatedAt: new Date()
      }

      if (rejectionReason) {
        updateData[`documents.${documentType}.rejectionReason`] = rejectionReason
      }

      await updateDoc(userRef, updateData)

      // Add activity log
      const activityRef = doc(collection(db, 'activities'))
      await updateDoc(activityRef, {
        userId: user.uid,
        action: `Document ${documentType} status updated to ${status}`,
        type: 'status',
        timestamp: new Date().toISOString(),
        createdAt: new Date()
      })

      // Refresh the page data
      handleRefresh()
    } catch (error) {
      console.error('Error updating document status:', error)
    }
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'text-green-600'
      case 'rejected': return 'text-red-600'
      case 'approved': return 'text-blue-600'
      case 'under_review': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected': return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'approved': return <CheckCircle className="h-5 w-5 text-blue-600" />
      case 'under_review': return <Clock className="h-5 w-5 text-yellow-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  if (authLoading || loading) {
    return (
      <AdminLayout userRole="applicant">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading your dashboard...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <AdminLayout userRole="applicant">
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center">
        <WelcomeCard 
          userName={user?.displayName || userData?.firstName || "Applicant"} 
          userRole="applicant" 
            className="animate-in slide-in-from-bottom duration-700 delay-300"
          />
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="animate-in slide-in-from-right duration-700 delay-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom duration-700 delay-300">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Application Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{applicantStats.applicationProgress}%</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Documents Uploaded</p>
                  <p className="text-2xl font-bold text-green-600">{applicantStats.documentsUploaded}/{applicantStats.totalDocuments}</p>
                  <p className="text-xs text-gray-500">Required docs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Days Since Application</p>
                  <p className="text-2xl font-bold text-purple-600">{applicantStats.daysSinceApplication}</p>
                  <p className="text-xs text-gray-500">Days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Next Step</p>
                  <p className="text-sm font-bold text-orange-600">Induction</p>
                  <p className="text-xs text-gray-500">Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-700 delay-500">
          {/* Left Column - Application Progress and Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Progress */}
            <Card className="animate-in slide-in-from-left duration-700 delay-600">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Application Progress</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-semibold">{applicantStats.applicationProgress}%</span>
                  </div>
                  <Progress value={applicantStats.applicationProgress} className="h-3" />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Next Step: {applicantStats.nextStep}</h3>
                  <p className="text-sm text-blue-700">Your documents are being reviewed by our team. You'll be notified once the review is complete.</p>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push('/applicant/upload')}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="animate-in slide-in-from-left duration-700 delay-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'document' ? 'bg-green-500' :
                          activity.type === 'status' ? 'bg-blue-500' :
                          activity.type === 'review' ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Documents and Quick Actions */}
          <div className="space-y-6">
            {/* Document Status */}
            <Card className="animate-in slide-in-from-right duration-700 delay-600">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span>Document Status</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {applicantStats.documentsUploaded}/{applicantStats.totalDocuments} uploaded
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Document Progress</span>
                    <span className="font-semibold">{Math.round((applicantStats.documentsUploaded / applicantStats.totalDocuments) * 100)}%</span>
                  </div>
                  <Progress value={(applicantStats.documentsUploaded / applicantStats.totalDocuments) * 100} className="h-2" />
                </div>

                {/* Documents List */}
                <div className="space-y-3">
                {documents.map((doc, index) => (
                    <div key={index} className={`p-4 border rounded-lg transition-all duration-200 ${
                      doc.status === 'uploaded' ? 'border-green-200 bg-green-50/30' :
                      doc.status === 'rejected' ? 'border-red-200 bg-red-50/30' :
                      'border-yellow-200 bg-yellow-50/30'
                    } hover:shadow-md`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            {getDocumentStatusIcon(doc.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              {doc.required && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5">
                                  Required
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 space-y-1">
                        <p className="text-xs text-gray-500">
                                {doc.uploadedAt ? `Uploaded ${formatDate(doc.uploadedAt)}` : 'Not uploaded'}
                              </p>
                              {doc.rejectionReason && (
                                <div className="p-2 bg-red-100 rounded text-xs text-red-700">
                                  <strong>Rejection reason:</strong> {doc.rejectionReason}
                                </div>
                              )}
                            </div>
                      </div>
                    </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                    <Badge 
                      variant="outline"
                      className={
                              doc.status === 'uploaded' ? 'bg-green-100 text-green-800 border-green-200' :
                              doc.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                              'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }
                    >
                            {doc.status === 'uploaded' ? 'Uploaded' : 
                             doc.status === 'rejected' ? 'Rejected' : 'Pending'}
                    </Badge>
                          
                          <div className="flex items-center space-x-1">
                            {doc.status === 'uploaded' && doc.url && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(doc.url, '_blank')}
                                  className="h-8 w-8 p-0"
                                  title="View document"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const link = document.createElement('a')
                                    link.href = doc.url!
                                    link.download = `${doc.name}.pdf`
                                    link.click()
                                  }}
                                  className="h-8 w-8 p-0"
                                  title="Download document"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            {doc.status !== 'uploaded' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const documentTypeMap = {
                                    'Certified ID': 'certifiedid',
                                    'Proof of Address': 'proofofaddress',
                                    'Highest Qualification Certificate': 'highestqualification',
                                    'Proof of Banking': 'proofofbanking',
                                    'Tax Number': 'taxnumber'
                                  }
                                  handleDocumentUpload(documentTypeMap[doc.name as keyof typeof documentTypeMap] || 'certifiedid')
                                }}
                                className="h-8 text-xs"
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                {doc.status === 'rejected' ? 'Re-upload' : 'Upload'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Document Statistics */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">Document Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Total Required:</span>
                      <span className="font-semibold text-blue-900">{applicantStats.totalDocuments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Uploaded:</span>
                      <span className="font-semibold text-green-600">{applicantStats.documentsUploaded}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Pending:</span>
                      <span className="font-semibold text-yellow-600">{applicantStats.totalDocuments - applicantStats.documentsUploaded}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Progress:</span>
                      <span className="font-semibold text-blue-900">{Math.round((applicantStats.documentsUploaded / applicantStats.totalDocuments) * 100)}%</span>
                    </div>
                  </div>
                  
                  {applicantStats.documentsUploaded < applicantStats.totalDocuments && (
                    <div className="mt-3 p-2 bg-amber-100 rounded text-xs text-amber-800">
                      <strong>⚠️ Action Required:</strong> Upload all required documents to complete your application and proceed to the next stage.
                    </div>
                  )}
                  
                  {applicantStats.documentsUploaded === applicantStats.totalDocuments && (
                    <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-800">
                      <strong>✅ Complete:</strong> All required documents have been uploaded. Your application is ready for review.
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push('/applicant/upload')}
                    className="text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload Documents
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push('/applicant/status')}
                    className="text-xs"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    View Status
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="animate-in slide-in-from-right duration-700 delay-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-purple-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleViewApplication}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Application
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/applicant/status')}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Application Status
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/applicant/support')}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Get Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Application Timeline */}
        <Card className="animate-in slide-in-from-bottom duration-700 delay-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Application Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.status === 'completed' ? 'bg-green-100 text-green-600' :
                    item.status === 'in-progress' ? 'bg-yellow-100 text-yellow-600' :
                    item.status === 'upcoming' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {item.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : item.status === 'in-progress' ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.step}</p>
                    <p className="text-sm text-gray-600">{item.date}</p>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {item.status === 'in-progress' ? 'In Progress' : item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* AI Support Chatbot */}
      <AiChatbot />
    </AdminLayout>
  )
}