'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Plus,
  Minus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Zap,
  Star,
  Heart,
  Crown,
  Shield,
  Brain,
  Users,
  Award,
  Target,
  Activity,
  TrendingUp,
  RefreshCw,
  Settings,
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Folder,
  FolderOpen,
  File,
  FileImage,
  FilePdf,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  FileCode,
  Archive,
  Lock,
  Unlock,
  Share,
  Copy,
  Move,
  RotateCcw,
  Play,
  Pause
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Document {
  id: string
  name: string
  type: 'pdf' | 'image' | 'video' | 'audio' | 'spreadsheet' | 'code' | 'archive' | 'other'
  size: number
  uploadedAt: Date
  status: 'pending' | 'approved' | 'rejected' | 'under-review'
  category: 'id' | 'academic' | 'medical' | 'financial' | 'other'
  description?: string
  reviewer?: string
  comments?: string
}

interface DocumentCategory {
  name: string
  count: number
  required: number
  color: string
  icon: React.ElementType
}

export function EnhancedDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [categories, setCategories] = useState<DocumentCategory[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Mock data
    setDocuments([
      {
        id: '1',
        name: 'National ID Card',
        type: 'image',
        size: 2048000,
        uploadedAt: new Date('2024-01-15'),
        status: 'approved',
        category: 'id',
        description: 'Front and back of national ID card',
        reviewer: 'John Smith'
      },
      {
        id: '2',
        name: 'Academic Transcript',
        type: 'pdf',
        size: 1024000,
        uploadedAt: new Date('2024-01-10'),
        status: 'under-review',
        category: 'academic',
        description: 'Official academic transcript from university'
      },
      {
        id: '3',
        name: 'Medical Certificate',
        type: 'pdf',
        size: 512000,
        uploadedAt: new Date('2024-01-08'),
        status: 'approved',
        category: 'medical',
        description: 'Health clearance certificate',
        reviewer: 'Jane Doe'
      },
      {
        id: '4',
        name: 'Bank Statement',
        type: 'pdf',
        size: 1536000,
        uploadedAt: new Date('2024-01-05'),
        status: 'rejected',
        category: 'financial',
        description: 'Bank statement for stipend verification',
        reviewer: 'Mike Johnson',
        comments: 'Please provide a more recent statement (within 3 months)'
      }
    ])

    setCategories([
      {
        name: 'ID Documents',
        count: 1,
        required: 2,
        color: 'text-blue-600 bg-blue-100',
        icon: FileText
      },
      {
        name: 'Academic',
        count: 1,
        required: 3,
        color: 'text-green-600 bg-green-100',
        icon: FilePdf
      },
      {
        name: 'Medical',
        count: 1,
        required: 1,
        color: 'text-red-600 bg-red-100',
        icon: FileImage
      },
      {
        name: 'Financial',
        count: 0,
        required: 1,
        color: 'text-yellow-600 bg-yellow-100',
        icon: FileSpreadsheet
      }
    ])
  }, [])

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return FilePdf
      case 'image':
        return FileImage
      case 'video':
        return FileVideo
      case 'audio':
        return FileAudio
      case 'spreadsheet':
        return FileSpreadsheet
      case 'code':
        return FileCode
      case 'archive':
        return Archive
      default:
        return File
    }
  }

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'text-red-600 bg-red-100'
      case 'image':
        return 'text-green-600 bg-green-100'
      case 'video':
        return 'text-purple-600 bg-purple-100'
      case 'audio':
        return 'text-orange-600 bg-orange-100'
      case 'spreadsheet':
        return 'text-yellow-600 bg-yellow-100'
      case 'code':
        return 'text-gray-600 bg-gray-100'
      case 'archive':
        return 'text-indigo-600 bg-indigo-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'under-review':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredDocuments = documents
    .filter(doc => 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory === 'all' || doc.category === selectedCategory)
    )
    .sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'date':
          aValue = a.uploadedAt
          bValue = b.uploadedAt
          break
        case 'size':
          aValue = a.size
          bValue = b.size
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          aValue = a.uploadedAt
          bValue = b.uploadedAt
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // Handle file upload logic here
      console.log('Files to upload:', files)
    }
  }

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    )
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on documents:`, selectedDocuments)
    setSelectedDocuments([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Documents</h1>
              <p className="text-xl text-gray-600">Manage your required documents and files</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>
        </div>

        {/* Document Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {categories.map((category, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.color}`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <Badge className={category.count >= category.required ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {category.count}/{category.required}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">
                      {Math.round((category.count / category.required) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(category.count / category.required) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="id">ID Documents</option>
                  <option value="academic">Academic</option>
                  <option value="medical">Medical</option>
                  <option value="financial">Financial</option>
                  <option value="other">Other</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                  <option value="status">Sort by Status</option>
                </select>
                
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedDocuments.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('download')}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDocuments([])}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => {
            const FileIcon = getFileIcon(document.type)
            return (
              <Card key={document.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(document.id)}
                        onChange={() => handleDocumentSelect(document.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileTypeColor(document.type)}`}>
                        <FileIcon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {document.name}
                      </h3>
                      <p className="text-sm text-gray-600">{document.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{formatFileSize(document.size)}</span>
                      <Badge className={getStatusColor(document.status)}>
                        {document.status}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Uploaded: {document.uploadedAt.toLocaleDateString()}
                    </div>
                    
                    {document.reviewer && (
                      <div className="text-xs text-gray-500">
                        Reviewed by: {document.reviewer}
                      </div>
                    )}
                    
                    {document.comments && (
                      <div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
                        {document.comments}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Upload Documents</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUploadModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Files</h3>
                  <p className="text-gray-600 mb-4">Drag and drop files here, or click to select</p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="id">ID Documents</option>
                      <option value="academic">Academic</option>
                      <option value="medical">Medical</option>
                      <option value="financial">Financial</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <Input
                      placeholder="Brief description..."
                      className="p-3"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Upload Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
