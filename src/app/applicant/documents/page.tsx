'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DocumentUpload } from '@/components/applicant/DocumentUpload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading'

const documentTypes = {
  certifiedId: {
    name: 'Certified ID Copy',
    description: 'Upload a certified copy of your ID document (passport, driver\'s license, or national ID)'
  },
  cv: {
    name: 'Curriculum Vitae',
    description: 'Upload your current CV or resume in PDF or Word format'
  },
  qualifications: {
    name: 'Educational Qualifications',
    description: 'Upload copies of your educational certificates, diplomas, or degrees'
  },
  references: {
    name: 'References',
    description: 'Upload reference letters or provide contact details of your references'
  }
}

export default function DocumentsPage() {
  const [user, setUser] = useState<{ id: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const documentType = searchParams?.get('type') || 'certifiedId'

  useEffect(() => {
    // Get user from localStorage (in a real app, use proper session management)
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push('/login/user')
    }
    setLoading(false)
  }, [router])

  const handleUploadSuccess = () => {
    setUploadSuccess(true)
    setTimeout(() => {
      setUploadSuccess(false)
    }, 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const currentDocument = documentTypes[documentType as keyof typeof documentTypes]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Document Upload</h1>
          <p className="text-gray-600">Upload your required documents to complete your application</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Document Types Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(documentTypes).map(([key, doc]) => (
                  <button
                    key={key}
                    onClick={() => router.push(`/applicant/documents?type=${key}`)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                      documentType === key
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {doc.name}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Document Upload Area */}
          <div className="lg:col-span-3">
            {uploadSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">
                  ✓ Document uploaded successfully! You can now upload another document or return to your dashboard.
                </p>
              </div>
            )}

            {user && (
              <DocumentUpload
                userId={user.id}
                documentType={documentType}
                documentName={currentDocument.name}
                description={currentDocument.description}
                onUploadSuccess={handleUploadSuccess}
              />
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => router.push('/applicant/dashboard')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={() => router.push('/applicant/dashboard')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                View All Documents
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
