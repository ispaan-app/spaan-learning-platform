'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { uploadDocument } from '@/app/actions/documentActions'

export default function DocumentUploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const documentType = searchParams.get('type') || 'cv'
  
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const documentTypes = {
    certifiedid: 'Certified ID',
    proofofaddress: 'Proof of Address',
    highestqualification: 'Highest Qualification Certificate',
    proofofbanking: 'Proof of Banking',
    taxnumber: 'Tax Number'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF, Word document, or image file')
        return
      }
      
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      
      setFile(selectedFile)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!file || !user) return

    setUploading(true)
    setError('')

    try {
      // Map document type to the format expected by the server action
      const documentTypeMap = {
        'certifiedid': 'certifiedId',
        'proofofaddress': 'proofOfAddress',
        'highestqualification': 'highestQualification',
        'proofofbanking': 'proofOfBanking',
        'taxnumber': 'taxNumber'
      }
      
      const serverDocumentType = documentTypeMap[documentType as keyof typeof documentTypeMap] || 'cv'
      
      // Create FormData for the server action
      const formData = new FormData()
      formData.append('userId', user.uid)
      formData.append('documentType', serverDocumentType)
      formData.append('file', file)

      // Use the working server action
      const result = await uploadDocument(formData)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/applicant/dashboard')
        }, 2000)
      } else {
        setError(result.error || 'Failed to upload document. Please try again.')
      }
    } catch (err) {
      setError('Failed to upload document. Please try again.')
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Uploaded Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your {documentTypes[documentType as keyof typeof documentTypes]} has been uploaded and is being processed.
            </p>
            <Button onClick={() => router.push('/applicant/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Upload Document</h1>
          <p className="text-gray-600 mt-2">
            Upload your {documentTypes[documentType as keyof typeof documentTypes]} for review
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{documentTypes[documentType as keyof typeof documentTypes]}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500">
                Supported formats: PDF, Word documents, JPEG, PNG (Max 10MB)
              </p>
            </div>

            {file && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/applicant/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
