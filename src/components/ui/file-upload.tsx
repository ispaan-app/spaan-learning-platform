'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  X, 
  Image, 
  File, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FileUploadProps {
  accept?: string
  maxSize?: number // in MB
  multiple?: boolean
  onUpload: (files: File[]) => Promise<{ success: boolean; url?: string; error?: string }[]>
  onRemove?: (index: number) => void
  uploadedFiles?: Array<{
    name: string
    url: string
    size?: number
    type?: string
  }>
  preview?: boolean
  className?: string
  disabled?: boolean
  label?: string
  description?: string
}

export function FileUpload({
  accept = '*/*',
  maxSize = 10,
  multiple = false,
  onUpload,
  onRemove,
  uploadedFiles = [],
  preview = true,
  className,
  disabled = false,
  label = 'Upload files',
  description
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFileUrls, setUploadedFileUrls] = useState<Array<{
    name: string
    url: string
    size?: number
    type?: string
  }>>(uploadedFiles)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File "${file.name}" exceeds ${maxSize}MB size limit`
    }
    return null
  }

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    setError(null)
    
    // Validate files
    for (const file of fileArray) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const results = await onUpload(fileArray)
      
      // Update progress
      setUploadProgress(100)
      
      // Process results
      const successfulUploads: Array<{
        name: string
        url: string
        size?: number
        type?: string
      }> = []

      results.forEach((result, index) => {
        if (result.success && result.url) {
          successfulUploads.push({
            name: fileArray[index].name,
            url: result.url,
            size: fileArray[index].size,
            type: fileArray[index].type
          })
        } else {
          setError(result.error || `Failed to upload ${fileArray[index].name}`)
        }
      })

      if (successfulUploads.length > 0) {
        setUploadedFileUrls(prev => [...prev, ...successfulUploads])
      }
    } catch (error: any) {
      setError(error.message || 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [onUpload, maxSize])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles, disabled])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleRemoveFile = (index: number) => {
    setUploadedFileUrls(prev => prev.filter((_, i) => i !== index))
    onRemove?.(index)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-4 h-4" />
    }
    return <File className="w-4 h-4" />
  }

  return (
    <div className={cn('space-y-4', className)}>
      {label && <Label>{label}</Label>}
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
            <div>
              <p className="text-sm font-medium">Uploading files...</p>
              <Progress value={uploadProgress} className="mt-2" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isDragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500">
                Max size: {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Uploaded Files Preview */}
      {preview && uploadedFileUrls.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Uploaded Files</Label>
          <div className="space-y-2">
            {uploadedFileUrls.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type || '')}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    {file.size && (
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    disabled={disabled}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Specialized components for different upload types
export function AvatarUpload({ onUpload, currentAvatar, ...props }: {
  onUpload: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>
  currentAvatar?: string
} & Omit<FileUploadProps, 'onUpload' | 'preview'>) {
  const handleAvatarUpload = async (files: File[]) => {
    if (files.length === 0) return [{ success: false, error: 'No file selected' }]
    return [await onUpload(files[0])]
  }

  return (
    <div className="space-y-4">
      {currentAvatar && (
        <div className="flex items-center space-x-4">
          <img
            src={currentAvatar}
            alt="Current avatar"
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          />
          <div>
            <p className="text-sm font-medium">Current Avatar</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(currentAvatar, '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          </div>
        </div>
      )}
      
      <FileUpload
        {...props}
        onUpload={handleAvatarUpload}
        accept="image/*"
        maxSize={5}
        multiple={false}
        label="Upload Avatar"
        description="Upload a profile picture (max 5MB)"
      />
    </div>
  )
}

export function DocumentUpload({ onUpload, uploadedDocuments, ...props }: {
  onUpload: (files: File[]) => Promise<{ success: boolean; url?: string; error?: string }[]>
  uploadedDocuments?: Array<{
    name: string
    url: string
    size?: number
    type?: string
  }>
} & Omit<FileUploadProps, 'onUpload' | 'uploadedFiles'>) {
  return (
    <FileUpload
      {...props}
      onUpload={onUpload}
      uploadedFiles={uploadedDocuments}
      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      maxSize={20}
      multiple={true}
      label="Upload Documents"
      description="Upload documents like CVs, certificates, etc. (max 20MB each)"
    />
  )
}


