'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Image,
  File,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2
} from 'lucide-react'

interface Document {
  id: string
  name: string
  type: 'certifiedId' | 'proofOfAddress' | 'highestQualification' | 'proofOfBanking' | 'taxNumber'
  status: 'pending' | 'approved' | 'rejected'
  url?: string
  uploadedAt: string
  size?: string
  description?: string
}

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  applicant: {
    id: string
    firstName: string
    lastName: string
    email: string
    documents?: {
      certifiedId: boolean
      proofOfAddress: boolean
      highestQualification: boolean
      proofOfBanking: boolean
      taxNumber: boolean
    }
  }
  onApprove: (documentType: string) => void
  onReject: (documentType: string, reason: string) => void
}

const documentTypes = {
  certifiedId: {
    name: 'Certified ID Copy',
    description: 'Government-issued identification document',
    icon: FileText,
    color: 'bg-blue-100 text-blue-800'
  },
  proofOfAddress: {
    name: 'Proof of Address',
    description: 'Utility bill or bank statement showing current address',
    icon: FileText,
    color: 'bg-green-100 text-green-800'
  },
  highestQualification: {
    name: 'Highest Qualification',
    description: 'Educational certificates or diplomas',
    icon: FileText,
    color: 'bg-purple-100 text-purple-800'
  },
  proofOfBanking: {
    name: 'Proof of Banking',
    description: 'Bank statement or account verification',
    icon: FileText,
    color: 'bg-orange-100 text-orange-800'
  },
  taxNumber: {
    name: 'Tax Number',
    description: 'Tax identification number document',
    icon: FileText,
    color: 'bg-red-100 text-red-800'
  }
}

export default function DocumentViewer({ 
  isOpen, 
  onClose, 
  applicant, 
  onApprove, 
  onReject 
}: DocumentViewerProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionForm, setShowRejectionForm] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)

  const handleApprove = (documentType: string) => {
    onApprove(documentType)
    setShowRejectionForm(null)
  }

  const handleReject = (documentType: string) => {
    if (rejectionReason.trim()) {
      onReject(documentType, rejectionReason)
      setRejectionReason('')
      setShowRejectionForm(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  const mockDocuments: Document[] = [
    {
      id: '1',
      name: 'ID_Copy_2024.pdf',
      type: 'certifiedId',
      status: 'pending',
      url: '/api/documents/sample-id.pdf',
      uploadedAt: '2024-01-15T10:30:00Z',
      size: '2.3 MB',
      description: 'Government-issued ID document'
    },
    {
      id: '2',
      name: 'Utility_Bill_Jan_2024.pdf',
      type: 'proofOfAddress',
      status: 'pending',
      url: '/api/documents/sample-address.pdf',
      uploadedAt: '2024-01-15T10:35:00Z',
      size: '1.8 MB',
      description: 'Electricity bill showing current address'
    },
    {
      id: '3',
      name: 'Degree_Certificate.pdf',
      type: 'highestQualification',
      status: 'pending',
      url: '/api/documents/sample-degree.pdf',
      uploadedAt: '2024-01-15T10:40:00Z',
      size: '3.1 MB',
      description: 'Bachelor of Science degree certificate'
    },
    {
      id: '4',
      name: 'Bank_Statement_Jan_2024.pdf',
      type: 'proofOfBanking',
      status: 'pending',
      url: '/api/documents/sample-bank.pdf',
      uploadedAt: '2024-01-15T10:45:00Z',
      size: '2.7 MB',
      description: 'Bank statement for account verification'
    },
    {
      id: '5',
      name: 'Tax_Number_Certificate.pdf',
      type: 'taxNumber',
      status: 'pending',
      url: '/api/documents/sample-tax.pdf',
      uploadedAt: '2024-01-15T10:50:00Z',
      size: '1.5 MB',
      description: 'Tax identification number certificate'
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <FileText className="w-6 h-6" style={{ color: '#FF6E40' }} />
            <div>
              <h2 className="text-2xl font-bold" style={{ color: '#1E3D59' }}>
                Document Review
              </h2>
              <p className="text-gray-600">
                {applicant.firstName} {applicant.lastName} - {applicant.email}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 h-[70vh]">
          {/* Document List */}
          <div className="w-1/3 border-r border-gray-200 pr-4">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E3D59' }}>
              Uploaded Documents
            </h3>
            <div className="space-y-3 overflow-y-auto max-h-[60vh]">
              {mockDocuments.map((doc) => {
                const docType = documentTypes[doc.type]
                const IconComponent = docType.icon
                
                return (
                  <Card 
                    key={doc.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedDocument?.id === doc.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${docType.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{docType.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{doc.name}</p>
                          <div className="flex items-center justify-between mt-2">
                            {getStatusIcon(doc.status)}
                            <span className="text-xs text-gray-400">{doc.size}</span>
                          </div>
                          <div className="mt-2">
                            {getStatusBadge(doc.status)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Document Viewer */}
          <div className="flex-1">
            {selectedDocument ? (
              <div className="h-full flex flex-col">
                {/* Document Header */}
                <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${documentTypes[selectedDocument.type].color}`}>
                      {React.createElement(documentTypes[selectedDocument.type].icon, { className: "w-5 h-5" })}
                    </div>
                    <div>
                      <h3 className="font-semibold">{documentTypes[selectedDocument.type].name}</h3>
                      <p className="text-sm text-gray-600">{selectedDocument.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(selectedDocument.status)}
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                {/* Document Preview */}
                <div className="flex-1 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Document Preview</p>
                    <p className="text-sm text-gray-500">
                      {selectedDocument.description || 'Click to view document details'}
                    </p>
                    <div className="mt-4 flex justify-center space-x-2">
                      <Button variant="outline" size="sm">
                        <ZoomIn className="w-4 h-4 mr-2" />
                        Zoom In
                      </Button>
                      <Button variant="outline" size="sm">
                        <ZoomOut className="w-4 h-4 mr-2" />
                        Zoom Out
                      </Button>
                      <Button variant="outline" size="sm">
                        <RotateCw className="w-4 h-4 mr-2" />
                        Rotate
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleApprove(selectedDocument.type)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={selectedDocument.status === 'approved'}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Document
                    </Button>
                    <Button
                      onClick={() => setShowRejectionForm(selectedDocument.type)}
                      variant="destructive"
                      disabled={selectedDocument.status === 'rejected'}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Document
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Uploaded: {new Date(selectedDocument.uploadedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Rejection Form */}
                {showRejectionForm === selectedDocument.type && (
                  <div className="mt-4 p-4 border border-red-200 rounded-lg bg-red-50">
                    <h4 className="font-semibold text-red-800 mb-2">Rejection Reason</h4>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      className="w-full p-2 border border-red-300 rounded-md mb-3"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleReject(selectedDocument.type)}
                        variant="destructive"
                        size="sm"
                        disabled={!rejectionReason.trim()}
                      >
                        Submit Rejection
                      </Button>
                      <Button
                        onClick={() => setShowRejectionForm(null)}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4" />
                  <p>Select a document to view</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
