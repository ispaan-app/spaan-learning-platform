'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  ArrowLeft, 
  Send, 
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  FileText
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit, addDoc } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

interface IssueReport {
  id: string
  type: 'stipend' | 'placement' | 'technical' | 'other'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  submittedDate: string
  resolvedDate?: string
  adminResponse?: string
}

export default function ReportIssuePage() {
  const [formData, setFormData] = useState({
    type: '',
    priority: 'high',
    title: '',
    description: '',
    contactMethod: 'email'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const toast = useToast()

  // Real data for previous reports
  const [previousReports, setPreviousReports] = useState<IssueReport[]>([])
  const [loadingReports, setLoadingReports] = useState(true)

  useEffect(() => {
    if (user?.uid) {
      fetchPreviousReports()
    }
  }, [user])

  const fetchPreviousReports = async () => {
    try {
      setLoadingReports(true)
      const reportsSnapshot = await getDocs(query(
        collection(db, 'issueReports'),
        where('userId', '==', user?.uid),
        orderBy('submittedDate', 'desc'),
        limit(10)
      ))

      const reportsData = reportsSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          submittedDate: data.submittedDate?.toDate?.()?.toISOString() || data.submittedDate,
          resolvedDate: data.resolvedDate?.toDate?.()?.toISOString() || data.resolvedDate
        }
      }) as IssueReport[]

      setPreviousReports(reportsData)
    } catch (error) {
      console.error('Error fetching previous reports:', error)
    } finally {
      setLoadingReports(false)
    }
  }

  const issueTypes = [
    { value: 'stipend', label: 'Stipend Issue', description: 'Payment delays, incorrect amounts, missing payments', icon: DollarSign },
    { value: 'placement', label: 'Placement Issue', description: 'Work environment, supervisor, tasks, company concerns', icon: FileText },
    { value: 'technical', label: 'Technical Issue', description: 'App problems, login issues, system errors', icon: AlertTriangle },
    { value: 'other', label: 'Other Issue', description: 'General concerns, questions, other matters', icon: FileText }
  ]

  const priorityLevels = [
    { value: 'high', label: 'High Priority', description: 'Urgent issues requiring immediate attention', color: 'bg-red-100 text-red-800' },
    { value: 'medium', label: 'Medium Priority', description: 'Important issues that can be addressed within 24-48 hours', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'low', label: 'Low Priority', description: 'General questions or minor issues', color: 'bg-green-100 text-green-800' }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800">Open</Badge>
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    return issueTypes.find(t => t.value === type)?.label || type
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Submit issue to database
      await addDoc(collection(db, 'issueReports'), {
        userId: user?.uid,
        userEmail: user?.email,
        type: formData.type,
        priority: formData.priority,
        title: formData.title,
        description: formData.description,
        contactMethod: formData.contactMethod,
        status: 'open',
        submittedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      setIsSubmitting(false)
      setSubmitted(true)
      
      // Refresh the previous reports list
      await fetchPreviousReports()
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false)
        setFormData({ type: '', priority: 'high', title: '', description: '', contactMethod: 'email' })
      }, 3000)
    } catch (error) {
      console.error('Error submitting issue report:', error)
      setIsSubmitting(false)
      toast.error('Failed to submit issue report. Please try again.')
    }
  }

  if (submitted) {
    return (
      <AdminLayout userRole="learner">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardContent className="p-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Reported Successfully!</h2>
              <p className="text-gray-600 mb-4">
                Your issue has been submitted and will be reviewed by our support team.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You will receive a response within 24 hours for high priority issues.
              </p>
              <Button onClick={() => router.push('/learner/dashboard')} className="bg-blue-600 hover:bg-blue-700">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="learner">
      <div className="space-y-6">
        {/* Header */}
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
            <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
            <p className="text-gray-600">Get help with stipend, placement, or technical issues</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Submit New Issue</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Issue Type */}
                <div>
                  <Label htmlFor="type">Issue Type</Label>
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    {issueTypes.map((type) => {
                      const IconComponent = type.icon
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleInputChange('type', type.value)}
                          className={`p-4 text-left border rounded-lg transition-colors ${
                            formData.type === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <IconComponent className="h-5 w-5 text-gray-600" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-gray-600">{type.description}</div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Priority Level */}
                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorityLevels.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label} - {priority.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">Issue Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Please provide as much detail as possible about your issue..."
                    rows={6}
                    required
                  />
                </div>

                {/* Contact Method */}
                <div>
                  <Label htmlFor="contactMethod">Preferred Contact Method</Label>
                  <select
                    id="contactMethod"
                    value={formData.contactMethod}
                    onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone Call</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.type || !formData.title || !formData.description}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Issue Report
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Previous Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Previous Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previousReports.length > 0 ? (
                <div className="space-y-4">
                  {previousReports.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{report.title}</h3>
                        {getStatusBadge(report.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Type:</span> {getTypeLabel(report.type)}</p>
                        <p><span className="font-medium">Submitted:</span> {report.submittedDate}</p>
                        {report.resolvedDate && (
                          <p><span className="font-medium">Resolved:</span> {report.resolvedDate}</p>
                        )}
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                        {report.description}
                      </p>
                      
                      {report.adminResponse && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Admin Response:</span> {report.adminResponse}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No previous reports</p>
                  <p className="text-sm text-gray-500">Your issue reports will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Help Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-4">Need Immediate Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-1">Stipend Issues</p>
                <p>Contact: finance@ispaan.co.za</p>
                <p>Phone: +27 11 123 4567</p>
              </div>
              <div>
                <p className="font-medium mb-1">Placement Issues</p>
                <p>Contact: placements@ispaan.co.za</p>
                <p>Phone: +27 11 123 4568</p>
              </div>
              <div>
                <p className="font-medium mb-1">Technical Support</p>
                <p>Contact: support@ispaan.co.za</p>
                <p>Phone: +27 11 123 4569</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}



