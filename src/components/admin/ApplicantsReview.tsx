
'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { createEscalation } from '@/app/actions/escalationActions';

import React, { useState, useEffect } from 'react'
import { getAllApplicants, updateUserStatus } from '@/app/actions/userActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading'
import { Progress } from '@/components/ui/progress'
import { ProgramService } from '@/lib/program-service'

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
  const [programNames, setProgramNames] = useState<{ [key: string]: string }>({})
  
  const formatProgramName = (programId: string) => {
    return programNames[programId] || programId || 'Unknown Program'
  }

  // Export applicants to CSV
  const handleExportCSV = () => {
    if (!applicants.length) return;
    const header = ['First Name', 'Last Name', 'Email', 'Phone', 'ID Number', 'Program', 'Status', 'Application Status', 'Created At'];
    const rows = applicants.map(a => [a.firstName, a.lastName, a.email, a.phone, a.idNumber, a.program, a.status, a.applicationStatus, a.createdAt]);
    const csvContent = [header, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'all_applicants.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [escalateTarget, setEscalateTarget] = useState<Applicant | null>(null);
  const [escalateLoading, setEscalateLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const handleEscalate = (applicant: Applicant) => {
    setEscalateTarget(applicant);
    setEscalateReason('');
    setEscalateOpen(true);
  };

  const submitEscalation = async () => {
    if (!escalateTarget || !escalateReason.trim()) return;
    setEscalateLoading(true);
    try {
      await createEscalation({
        type: 'user',
        refId: escalateTarget.id,
        reason: escalateReason,
        createdBy: 'admin', // Optionally use admin user id if available
        status: 'open',
        assignedTo: undefined
      });
      setEscalateOpen(false);
    } catch (e) {
      setError('Failed to escalate');
    } finally {
      setEscalateLoading(false);
    }
  };
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchApplicants()
  }, [])

  // Load program names for applicants
  useEffect(() => {
    if (applicants.length > 0) {
      const uniqueProgramIds = Array.from(new Set(applicants.map(a => a.program).filter(Boolean)))
      if (uniqueProgramIds.length > 0) {
        ProgramService.getProgramNames(uniqueProgramIds)
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
    }
  }, [applicants])

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
        return 'bg-green-100 text-green-800 border-green-300'
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getDocumentStatus = (status: string) => {
    switch (status) {
      case 'approved':
        return { color: 'bg-green-100 text-green-800 border-green-300', icon: '✓', label: 'Approved' }
      case 'rejected':
        return { color: 'bg-red-100 text-red-800 border-red-300', icon: '✗', label: 'Rejected' }
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⏳', label: 'Pending' }
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: '○', label: 'Not Uploaded' }
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


  // Filter applicants by document status
  const filteredApplicants = applicants.filter(applicant => {
    if (filter === 'all') return true;
    // If any document matches the filter, include applicant
    return Object.values(applicant.documents).some(doc => doc.status === filter);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <Button size="sm" variant="secondary" onClick={handleExportCSV} disabled={!applicants.length}>
          Export CSV
        </Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Applicants Review</h2>
          <span className="text-sm text-gray-600">{filteredApplicants.length} shown</span>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-all duration-150 focus:outline-none ${filter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
              onClick={() => setFilter(f as any)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {filteredApplicants.map((applicant) => {
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
                  <Badge className={getStatusColor(applicant.applicationStatus) + ' border font-semibold px-2 py-1'}>
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
                      <span className="ml-2 font-medium">
                        {formatProgramName(applicant.program)}
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
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full border text-xs font-bold ${status.color}`}>{status.icon}</span>
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className={`ml-1 px-2 py-0.5 rounded-full border text-xs ${status.color}`}>{status.label}</span>
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
                      <Button
                        variant="outline"
                        onClick={() => handleEscalate(applicant)}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50 flex items-center"
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" /> Escalate
                      </Button>
                    </div>
                  )}
      {/* Escalation Dialog */}
      <Dialog open={escalateOpen} onOpenChange={setEscalateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate to Super Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Please provide a reason for escalation:</p>
            <Textarea value={escalateReason} onChange={e => setEscalateReason(e.target.value)} rows={4} placeholder="Describe the issue..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalateOpen(false)} disabled={escalateLoading}>Cancel</Button>
            <Button onClick={submitEscalation} disabled={!escalateReason.trim() || escalateLoading} className="bg-orange-600 text-white flex items-center">
              {escalateLoading && <Loader2 className="animate-spin w-4 h-4 mr-2" />}Submit Escalation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {filteredApplicants.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No applicants found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

