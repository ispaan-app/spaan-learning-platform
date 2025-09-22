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
  Minimize2,
  CreditCard,
  Home,
  GraduationCap,
  Building,
  Receipt
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
  fileType?: string
}

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  applicant: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  documents: Document[]
  onApprove: (documentType: string) => void
  onReject: (documentType: string, reason: string) => void
  loading?: boolean
}

// Document types configuration
const documentTypes: { [key: string]: { name: string; description: string; icon: any; color: string } } = {
  certifiedId: {
    name: 'Certified ID Copy',
    description: 'Government issued ID document',
    icon: CreditCard,
    color: 'bg-blue-100 text-blue-600'
  },
  proofOfAddress: {
    name: 'Proof of Address',
    description: 'Utility bill or bank statement',
    icon: Home,
    color: 'bg-green-100 text-green-600'
  },
  highestQualification: {
    name: 'Highest Qualification',
    description: 'Educational certificates or diplomas',
    icon: GraduationCap,
    color: 'bg-purple-100 text-purple-600'
  },
  proofOfBanking: {
    name: 'Proof of Banking',
    description: 'Bank account details or statement',
    icon: Building,
    color: 'bg-orange-100 text-orange-600'
  },
  taxNumber: {
    name: 'Tax Number',
    description: 'SARS tax number certificate',
    icon: Receipt,
    color: 'bg-red-100 text-red-600'
  }
};


export default function DocumentViewer(props: DocumentViewerProps) {
  const { isOpen, onClose, applicant, documents, onApprove, onReject, loading = false } = props;
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  const handleApprove = (documentType: string) => {
    onApprove(documentType);
    setShowRejectionForm(null);
  };

  const handleReject = (documentType: string) => {
    if (rejectionReason.trim()) {
      onReject(documentType, rejectionReason);
      setRejectionReason('');
      setShowRejectionForm(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  // Use real documents passed as prop (no useMemo needed)
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
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No documents uploaded</p>
                </div>
              ) : (
                documents.map((doc) => {
                const docType = documentTypes[doc.type] || {
                  name: doc.type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                  description: 'Document',
                  icon: FileText,
                  color: 'bg-gray-100 text-gray-600'
                }
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
              }))}
            </div>
          </div>

          {/* Document Viewer */}
          <div className="flex-1">
            {selectedDocument ? (
              <div className="h-full flex flex-col">
                {/* Document Header */}
                <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${(documentTypes[selectedDocument.type] || documentTypes.certifiedId).color}`}>
                      {React.createElement((documentTypes[selectedDocument.type] || documentTypes.certifiedId).icon, { className: "w-5 h-5" })}
                    </div>
                    <div>
                      <h3 className="font-semibold">{(documentTypes[selectedDocument.type] || documentTypes.certifiedId).name}</h3>
                      <p className="text-sm text-gray-600">{selectedDocument.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(selectedDocument.status)}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoom(Math.max(50, zoom - 25))}
                        disabled={zoom <= 50}
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600 px-2">{zoom}%</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setZoom(Math.min(200, zoom + 25))}
                        disabled={zoom >= 200}
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedDocument.url) {
                          const link = document.createElement('a')
                          link.href = selectedDocument.url
                          link.download = selectedDocument.name
                          link.target = '_blank'
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                {/* Document Preview */}
                <div className="flex-1 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {selectedDocument.url ? (
                    <div className="w-full h-full relative">
                      {selectedDocument?.fileType?.includes('image') ? (
                        <img
                          src={selectedDocument.url}
                          alt={selectedDocument.name}
                          className="w-full h-full object-contain"
                          style={{ transform: `scale(${zoom / 100})` }}
                        />
                      ) : selectedDocument?.fileType === 'application/pdf' ? (
                        <iframe
                          src={selectedDocument.url}
                          className="w-full h-full border-0"
                          title={selectedDocument.name}
                        />
                      ) : (
                        <div className="text-center">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Document Preview Not Available</p>
                          <p className="text-sm text-gray-500 mb-4">
                            This file type cannot be previewed in the browser
                          </p>
                          <Button
                            onClick={() => window.open(selectedDocument.url, '_blank')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open in New Tab
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No Document URL Available</p>
                      <p className="text-sm text-gray-500">
                        This document may not have been properly uploaded
                      </p>
                    </div>
                  )}
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
