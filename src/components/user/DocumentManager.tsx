'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DocumentUpload } from '@/components/ui/file-upload'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2,
  Plus,
  Calendar,
  User
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { uploadDocument, deleteFile } from '@/lib/fileUpload'
import { db } from '@/lib/firebase'
import { collection, doc, getDocs, addDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'

interface Document {
  id: string
  userId: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
  uploadedBy: string
  description?: string
  category: string
}

interface DocumentManagerProps {
  userId: string
  currentUserId: string
  canUpload?: boolean
  canDelete?: boolean
}

const DOCUMENT_CATEGORIES = [
  'CV/Resume',
  'Cover Letter',
  'Certificates',
  'Transcripts',
  'ID Document',
  'Passport',
  'Work Permit',
  'Other'
]

const DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
]

export function DocumentManager({ 
  userId, 
  currentUserId, 
  canUpload = true, 
  canDelete = false 
}: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const toast = useToast()

  useEffect(() => {
    loadDocuments()
  }, [userId])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const documentsQuery = query(
        collection(db, 'documents'),
        where('userId', '==', userId),
        orderBy('uploadedAt', 'desc')
      )
      
      const snapshot = await getDocs(documentsQuery)
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[]
      
      setDocuments(docs)
    } catch (error) {
      console.error('Error loading documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentUpload = async (files: File[]) => {
    setUploading(true)
    const results = []
    
    try {
      for (const file of files) {
        const documentType = getDocumentType(file.name)
        const result = await uploadDocument(file, userId, documentType)
        
        if (result.success && result.url) {
          // Save document metadata to Firestore
          const documentData: Omit<Document, 'id'> = {
            userId,
            name: file.name,
            url: result.url,
            type: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            uploadedBy: currentUserId,
            category: getDocumentCategory(file.name)
          }
          
          await addDoc(collection(db, 'documents'), documentData)
          results.push({ success: true, url: result.url })
        } else {
          results.push({ success: false, error: result.error })
        }
      }
      
      // Reload documents
      await loadDocuments()
      
      const successCount = results.filter(r => r.success).length
      if (successCount > 0) {
        toast.success(`${successCount} document(s) uploaded successfully`)
      }
      
    } catch (error: any) {
      console.error('Document upload error:', error)
      toast.error('Failed to upload documents')
      results.push({ success: false, error: error.message })
    } finally {
      setUploading(false)
    }
    
    return results
  }

  const handleDocumentDelete = async (document: Document) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete this document')
      return
    }

    try {
      // Delete from Firebase Storage
      await deleteFile(document.url)
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'documents', document.id))
      
      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== document.id))
      
      toast.success('Document deleted successfully')
    } catch (error) {
      console.error('Document deletion error:', error)
      toast.error('Failed to delete document')
    }
  }

  const getDocumentType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return 'PDF Document'
      case 'doc':
        return 'Word Document'
      case 'docx':
        return 'Word Document'
      case 'jpg':
      case 'jpeg':
        return 'JPEG Image'
      case 'png':
        return 'PNG Image'
      default:
        return 'Document'
    }
  }

  const getDocumentCategory = (fileName: string): string => {
    const name = fileName.toLowerCase()
    if (name.includes('cv') || name.includes('resume')) return 'CV/Resume'
    if (name.includes('cover')) return 'Cover Letter'
    if (name.includes('certificate') || name.includes('cert')) return 'Certificates'
    if (name.includes('transcript') || name.includes('academic')) return 'Transcripts'
    if (name.includes('id') || name.includes('identity')) return 'ID Document'
    if (name.includes('passport')) return 'Passport'
    if (name.includes('work') || name.includes('permit')) return 'Work Permit'
    return 'Other'
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'CV/Resume':
        return 'bg-blue-100 text-blue-800'
      case 'Cover Letter':
        return 'bg-green-100 text-green-800'
      case 'Certificates':
        return 'bg-purple-100 text-purple-800'
      case 'Transcripts':
        return 'bg-orange-100 text-orange-800'
      case 'ID Document':
        return 'bg-red-100 text-red-800'
      case 'Passport':
        return 'bg-indigo-100 text-indigo-800'
      case 'Work Permit':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredDocuments = filter === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === filter)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading documents...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Document Manager</span>
            </CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  {DOCUMENT_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {canUpload && (
            <div className="mb-6">
              <DocumentUpload
                onUpload={handleDocumentUpload}
                uploadedDocuments={filteredDocuments}
                disabled={uploading}
                label="Upload Documents"
                description="Upload CVs, certificates, transcripts, and other documents (max 20MB each)"
              />
            </div>
          )}

          {/* Documents List */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents</h3>
              <p className="text-gray-600">
                {canUpload ? 'Upload your first document to get started.' : 'No documents available.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {document.name}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getCategoryBadgeColor(document.category)}>
                          {document.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(document.size)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(document.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(document.url, '_blank')}
                      title="View document"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const link = (document as any).createElement('a')
                        link.href = document.url
                        link.download = document.name
                        link.click()
                      }}
                      title="Download document"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDocumentDelete(document)}
                        title="Delete document"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


