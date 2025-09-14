'use client'

import React, { useState, useEffect } from 'react'
import { getAllApplicants, updateUserStatus } from '@/app/actions/userActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading'
import { Progress } from '@/components/ui/progress'

interface Applicant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  idNumber: string
  program: string
  status: string
  applicationStatus: string
  createdAt: string
  documents: {
    certifiedId: { status: string; uploadedAt: string | null }
    cv: { status: string; uploadedAt: string | null }
    qualifications: { status: string; uploadedAt: string | null }
    references: { status: string; uploadedAt: string | null }
  }
}

export function ApplicantsReview() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchApplicants()
  }, [])

  const fetchApplicants = async () => {
    try {
      const result = await getAllApplicants()
      if (result.success) {
        setApplicants(result.applicants || [])
      } else {
        setError(result.error || 'Failed to fetch applicants')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDocumentStatus = (status: string) => {
    switch (status) {
      case 'approved':
        return { color: 'text-green-600', icon: '✓' }
      case 'rejected':
        return { color: 'text-red-600', icon: '✗' }
      case 'pending':
        return { color: 'text-yellow-600', icon: '⏳' }
      default:
        return { color: 'text-gray-400', icon: '○' }
    }
  }

  const calculateDocumentProgress = (documents: any) => {
    const totalDocuments = 4
    const approvedDocuments = Object.values(documents).filter(
      (doc: any) => doc.status === 'approved'
    ).length
    return Math.round((approvedDocuments / totalDocuments) * 100)
  }

  const canApprove = (documents: any) => {
    return Object.values(documents).every((doc: any) => doc.status === 'approved')
  }

  const handleApprove = async (applicantId: string) => {
    setActionLoading(applicantId)
    try {
      const result = await updateUserStatus(applicantId, 'active', 'learner')
      if (result.success) {
        setApplicants(prev => 
          prev.map(app => 
            app.id === applicantId 
              ? { ...app, status: 'active', applicationStatus: 'active', role: 'learner' }
              : app
          )
        )
      } else {
        setError(result.error || 'Failed to approve applicant')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (applicantId: string) => {
    setActionLoading(applicantId)
    try {
      const result = await updateUserStatus(applicantId, 'rejected')
      if (result.success) {
        setApplicants(prev => 
          prev.map(app => 
            app.id === applicantId 
              ? { ...app, status: 'rejected', applicationStatus: 'rejected' }
              : app
          )
        )
      } else {
        setError(result.error || 'Failed to reject applicant')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Applicants Review</h2>
        <p className="text-sm text-gray-600">
          {applicants.length} total applicants
        </p>
      </div>

      <div className="grid gap-6">
        {applicants.map((applicant) => {
          const documentProgress = calculateDocumentProgress(applicant.documents)
          const canApproveApplicant = canApprove(applicant.documents)
          
          return (
            <Card key={applicant.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {applicant.firstName} {applicant.lastName}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{applicant.email}</p>
                    <p className="text-xs text-gray-500">ID: {applicant.idNumber}</p>
                  </div>
                  <Badge className={getStatusColor(applicant.applicationStatus)}>
                    {applicant.applicationStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Application Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Program:</span>
                      <span className="ml-2 font-medium capitalize">
                        {applicant.program.replace('-', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Applied:</span>
                      <span className="ml-2 font-medium">
                        {new Date(applicant.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-2 font-medium">{applicant.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Document Progress:</span>
                      <span className="ml-2 font-medium">{documentProgress}%</span>
                    </div>
                  </div>

                  {/* Document Status */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Document Status</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(applicant.documents).map(([key, doc]) => {
                        const status = getDocumentStatus(doc.status)
                        return (
                          <div key={key} className="flex items-center space-x-2">
                            <span className={status.color}>{status.icon}</span>
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-2">
                      <Progress value={documentProgress} className="h-2" />
                    </div>
                  </div>

                  {/* Actions */}
                  {applicant.applicationStatus === 'pending_review' && (
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => handleReject(applicant.id)}
                        disabled={actionLoading === applicant.id}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        {actionLoading === applicant.id ? 'Rejecting...' : 'Reject'}
                      </Button>
                      <Button
                        onClick={() => handleApprove(applicant.id)}
                        disabled={!canApproveApplicant || actionLoading === applicant.id}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === applicant.id ? 'Approving...' : 'Approve'}
                      </Button>
                    </div>
                  )}

                  {!canApproveApplicant && applicant.applicationStatus === 'pending_review' && (
                    <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                      ⚠️ Cannot approve until all documents are approved
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {applicants.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No applicants found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

