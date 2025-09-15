'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function ApplicationStatusPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [applicationData, setApplicationData] = useState<any>(null)

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login/user')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return

    const fetchApplicationData = async () => {
      try {
        setLoading(true)
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setApplicationData(userDoc.data())
        }
      } catch (error) {
        console.error('Error fetching application data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplicationData()
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading application status...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'pending_review': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected': return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'under_review': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'pending_review': return <FileText className="h-5 w-5 text-blue-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getProgressPercentage = () => {
    if (!applicationData?.documents) return 0
    const requiredDocs = ['certifiedId', 'proofOfAddress', 'highestQualification', 'proofOfBanking', 'taxNumber']
    const uploadedDocs = requiredDocs.filter(
      key => applicationData.documents[key]?.status === 'uploaded'
    ).length
    return Math.round((uploadedDocs / requiredDocs.length) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
          <p className="text-gray-600 mt-2">
            Track the progress of your application
          </p>
        </div>

        <div className="grid gap-6">
          {/* Application Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getStatusIcon(applicationData?.status || 'pending')}
                <span>Application Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Status</span>
                <Badge className={getStatusColor(applicationData?.status || 'pending')}>
                  {applicationData?.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Applied Date</span>
                <span className="text-sm text-gray-900">
                  {applicationData?.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Program</span>
                <span className="text-sm text-gray-900">
                  {applicationData?.program || 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Document Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Document Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="font-semibold">{getProgressPercentage()}%</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-3" />
              </div>

              <div className="space-y-3">
                {applicationData?.documents && Object.entries(applicationData.documents).map(([key, doc]: [string, any]) => {
                  const documentNames = {
                    'certifiedId': 'Certified ID',
                    'proofOfAddress': 'Proof of Address',
                    'highestQualification': 'Highest Qualification Certificate',
                    'proofOfBanking': 'Proof of Banking',
                    'taxNumber': 'Tax Number'
                  }
                  
                  return (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {doc.status === 'uploaded' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {documentNames[key as keyof typeof documentNames] || key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.uploadedAt ? `Uploaded ${formatDate(doc.uploadedAt)}` : 'Not uploaded'}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={
                          doc.status === 'uploaded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {doc.status || 'pending'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              {applicationData?.status === 'pending_review' && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Complete Document Upload</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Please upload all required documents to proceed with your application review.
                  </p>
                  <Button onClick={() => router.push('/applicant/upload')}>
                    Upload Documents
                  </Button>
                </div>
              )}
              
              {applicationData?.status === 'under_review' && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">Under Review</h3>
                  <p className="text-sm text-yellow-700">
                    Your application is currently being reviewed by our team. You will be notified once the review is complete.
                  </p>
                </div>
              )}
              
              {applicationData?.status === 'approved' && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Application Approved!</h3>
                  <p className="text-sm text-green-700">
                    Congratulations! Your application has been approved. You will receive further instructions via email.
                  </p>
                </div>
              )}
              
              {applicationData?.status === 'rejected' && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">Application Rejected</h3>
                  <p className="text-sm text-red-700">
                    Unfortunately, your application was not successful this time. Please contact support for more information.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
