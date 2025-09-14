'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Plus,
  Calendar,
  User,
  Building
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'

interface Document {
  id: string
  name: string
  type: 'cv' | 'certificate' | 'id' | 'contract' | 'other'
  status: 'uploaded' | 'pending' | 'approved' | 'rejected'
  uploadedDate: string
  reviewedDate?: string
  size: string
  url?: string
  reviewer?: string
  comments?: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'CV_Sarah_Johnson_2024.pdf',
      type: 'cv',
      status: 'approved',
      uploadedDate: '2024-01-15',
      reviewedDate: '2024-01-16',
      size: '2.3 MB',
      url: '#',
      reviewer: 'Dr. Sarah Johnson'
    },
    {
      id: '2',
      name: 'ID_Document_2024.pdf',
      type: 'id',
      status: 'approved',
      uploadedDate: '2024-01-10',
      reviewedDate: '2024-01-11',
      size: '1.8 MB',
      url: '#',
      reviewer: 'Dr. Sarah Johnson'
    },
    {
      id: '3',
      name: 'Placement_Contract_TechSolutions.pdf',
      type: 'contract',
      status: 'pending',
      uploadedDate: '2024-01-20',
      size: '3.1 MB',
      url: '#'
    },
    {
      id: '4',
      name: 'Certificate_Web_Development.pdf',
      type: 'certificate',
      status: 'rejected',
      uploadedDate: '2024-01-18',
      reviewedDate: '2024-01-19',
      size: '1.2 MB',
      url: '#',
      reviewer: 'Dr. Sarah Johnson',
      comments: 'Document quality is too low. Please rescan with higher resolution.'
    }
  ])

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const documentTypes = [
    { value: 'cv', label: 'CV/Resume', required: true, description: 'Your current curriculum vitae' },
    { value: 'id', label: 'ID Document', required: true, description: 'Copy of your ID or passport' },
    { value: 'certificate', label: 'Certificates', required: false, description: 'Academic or professional certificates' },
    { value: 'contract', label: 'Placement Contract', required: true, description: 'Signed placement agreement' },
    { value: 'other', label: 'Other', required: false, description: 'Other relevant documents' }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Badge className="bg-blue-100 text-blue-800">Uploaded</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    return documentTypes.find(t => t.value === type)?.label || type
  }

  const getTypeDescription = (type: string) => {
    return documentTypes.find(t => t.value === type)?.description || ''
  }

  const isTypeRequired = (type: string) => {
    return documentTypes.find(t => t.value === type)?.required || false
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newDocument: Document = {
      id: Date.now().toString(),
      name: selectedFile.name,
      type: 'other', // In a real app, this would be selected by the user
      status: 'uploaded',
      uploadedDate: new Date().toISOString().split('T')[0],
      size: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`
    }
    
    setDocuments(prev => [newDocument, ...prev])
    setSelectedFile(null)
    setShowUploadModal(false)
    setUploading(false)
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'cv':
        return <User className="h-5 w-5 text-blue-600" />
      case 'certificate':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'id':
        return <FileText className="h-5 w-5 text-purple-600" />
      case 'contract':
        return <Building className="h-5 w-5 text-orange-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const requiredDocuments = documentTypes.filter(doc => doc.required)
  const uploadedRequiredDocs = documents.filter(doc => 
    requiredDocuments.some(req => req.value === doc.type) && doc.status === 'approved'
  )
  const completionPercentage = (uploadedRequiredDocs.length / requiredDocuments.length) * 100

  return (
    <AdminLayout userRole="learner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
              <p className="text-gray-600">Upload and manage your important documents</p>
            </div>
          </div>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Document Completion Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Document Completion Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Required Documents</span>
                <span className="font-semibold">{uploadedRequiredDocs.length} / {requiredDocuments.length}</span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
              <div className="text-sm text-gray-600">
                {completionPercentage === 100 ? (
                  <span className="text-green-600 font-medium">All required documents uploaded and approved!</span>
                ) : (
                  <span>Upload the remaining required documents to complete your profile</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required Documents Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Required Documents Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requiredDocuments.map((docType) => {
                const doc = documents.find(d => d.type === docType.value)
                const isUploaded = doc && doc.status === 'approved'
                
                return (
                  <div key={docType.value} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {isUploaded ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                      <div>
                        <p className="font-medium">{docType.label}</p>
                        <p className="text-sm text-gray-600">{docType.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {isUploaded ? (
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">Required</Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Document List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>All Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((document) => (
                  <div key={document.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getDocumentIcon(document.type)}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{document.name}</h3>
                          <p className="text-sm text-gray-600">{getTypeLabel(document.type)}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>Uploaded: {document.uploadedDate}</span>
                            <span>Size: {document.size}</span>
                            {document.reviewedDate && (
                              <span>Reviewed: {document.reviewedDate}</span>
                            )}
                          </div>
                          {document.comments && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800">
                              <span className="font-medium">Reviewer Comments:</span> {document.comments}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {getStatusBadge(document.status)}
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No documents uploaded yet</p>
                <p className="text-sm text-gray-500">Upload your first document to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Document Type
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {documentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} {type.required && '(Required)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Click to upload or drag and drop</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-800">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUploadModal(false)
                      setSelectedFile(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}





