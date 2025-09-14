'use client'

import React from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Upload, 
  FileText, 
  User, 
  GraduationCap,
  Award,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  status: 'not-submitted' | 'pending' | 'approved' | 'rejected'
  uploadedAt?: string
  reviewedAt?: string
  rejectionReason?: string
  required: boolean
}

interface ApplicantData {
  id: string
  firstName: string
  lastName: string
  email: string
  program: string
  status: 'pending-review' | 'ready-for-review' | 'rejected' | 'approved'
  documents: Document[]
  applicationDate: string
  lastUpdated: string
}

interface ApplicantDashboardProps {
  applicantData: ApplicantData
}

const requiredDocuments = [
  {
    id: 'certified-id',
    name: 'Certified ID Copy',
    description: 'Government-issued ID with certification stamp',
    required: true
  },
  {
    id: 'cv',
    name: 'Curriculum Vitae',
    description: 'Updated CV with relevant experience',
    required: true
  },
  {
    id: 'qualifications',
    name: 'Educational Qualifications',
    description: 'Certificates and transcripts',
    required: true
  },
  {
    id: 'references',
    name: 'Professional References',
    description: 'At least 2 professional references',
    required: true
  },
  {
    id: 'portfolio',
    name: 'Portfolio/Work Samples',
    description: 'Examples of your work (if applicable)',
    required: false
  }
]

export function ApplicantDashboard({ applicantData }: ApplicantDashboardProps) {
  const { firstName, lastName, program, status, documents } = applicantData

  // Calculate document completion status
  const totalRequired = requiredDocuments.filter(doc => doc.required).length
  const approvedRequired = documents.filter(doc => 
    doc.required && doc.status === 'approved'
  ).length
  const completionPercentage = (approvedRequired / totalRequired) * 100

  // Get document status for each required document
  const getDocumentStatus = (docId: string) => {
    const doc = documents.find(d => d.id === docId)
    return doc ? doc.status : 'not-submitted'
  }

  // Get document details for display
  const getDocumentDetails = (docId: string) => {
    const doc = documents.find(d => d.id === docId)
    return doc || { status: 'not-submitted' as const }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      case 'pending':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">Not Submitted</Badge>
    }
  }

  const getActionButton = (docId: string, docStatus: string) => {
    const doc = getDocumentDetails(docId)
    
    if (docStatus === 'approved') {
      return (
        <Button variant="outline" size="sm" disabled>
          <CheckCircle className="w-4 h-4 mr-2" />
          Approved
        </Button>
      )
    }

    if (docStatus === 'rejected') {
      return (
        <div className="space-y-2">
          <Button asChild size="sm">
            <Link href={`/applicant/documents?reupload=${docId}`}>
              <Upload className="w-4 h-4 mr-2" />
              Re-upload
            </Link>
          </Button>
          {'rejectionReason' in doc && doc.rejectionReason && (
            <p className="text-xs text-red-600 mt-1">
              Reason: {doc.rejectionReason}
            </p>
          )}
        </div>
      )
    }

    return (
      <Button asChild size="sm">
        <Link href={`/applicant/documents?upload=${docId}`}>
          <Upload className="w-4 h-4 mr-2" />
          {docStatus === 'pending' ? 'View Status' : 'Upload'}
        </Link>
      </Button>
    )
  }

  // Render different states based on application status
  if (status === 'rejected') {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <XCircle className="w-6 h-6 text-red-600" />
              <CardTitle className="text-red-900">Application Not Approved</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-800 mb-4">
              We regret to inform you that your application has not been approved at this time.
            </p>
            <p className="text-red-700 text-sm">
              If you have any questions about this decision, please contact our support team.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'ready-for-review') {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <CardTitle className="text-green-900">Application Complete!</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-green-800 mb-4">
              Congratulations! All your required documents have been approved. 
              Your application is now with our admin team for final review.
            </p>
            <p className="text-green-700 text-sm">
              You will be notified once a decision has been made on your application.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <AdminLayout userRole="applicant">
      <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <Card className="animate-in slide-in-from-top duration-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center space-x-2">
                <span>Welcome, {firstName} {lastName}!</span>
                <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
              </CardTitle>
              <p className="text-gray-600 mt-1">
                You're applying for the <strong className="text-blue-600">{program}</strong> program
              </p>
            </div>
            <Badge variant="outline" className="text-yellow-600 border-yellow-600 animate-pulse">
              Pending Review
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Action Required:</strong> Please upload all required documents below to complete your application. 
              Your application cannot be reviewed until all documents are submitted and approved.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <Card className="animate-in slide-in-from-left duration-700 delay-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>Application Progress</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Document Completion</span>
              <span className="text-sm text-gray-600 font-semibold">
                {approvedRequired} of {totalRequired} required documents approved
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3 bg-gray-200" />
            <p className="text-xs text-gray-500 animate-in fade-in duration-500 delay-300">
              {completionPercentage === 100 
                ? '🎉 All required documents approved! Your application is ready for review.'
                : `📋 ${totalRequired - approvedRequired} more documents need to be approved.`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Document Checklist */}
      <Card className="animate-in slide-in-from-right duration-700 delay-400">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <span>Required Documents</span>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requiredDocuments.map((doc, index) => {
              const docStatus = getDocumentStatus(doc.id)
              const docDetails = getDocumentDetails(doc.id)
              
              return (
                <div 
                  key={doc.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-in slide-in-from-bottom duration-500 ${
                    docStatus === 'approved' 
                      ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                      : docStatus === 'rejected'
                      ? 'border-red-200 bg-red-50 hover:bg-red-100'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="transition-transform duration-300 hover:scale-110">
                      {getStatusIcon(docStatus)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          {doc.name}
                        </h3>
                        {doc.required && (
                          <Badge variant="outline" className="text-xs animate-pulse">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {doc.description}
                      </p>
                      {'uploadedAt' in docDetails && docDetails.uploadedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          📅 Uploaded: {new Date(docDetails.uploadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(docStatus)}
                    {getActionButton(doc.id, docStatus)}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="animate-in slide-in-from-bottom duration-700 delay-600">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Quick Actions</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <Link href="/applicant/documents" className="flex items-center space-x-3">
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-left">
                  <div className="font-medium group-hover:text-blue-600 transition-colors">Manage Documents</div>
                  <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Upload and view all documents</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <Link href="/applicant/profile" className="flex items-center space-x-3">
                <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-left">
                  <div className="font-medium group-hover:text-blue-600 transition-colors">View Profile</div>
                  <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Review your application details</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  )
}