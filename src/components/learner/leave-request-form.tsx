'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  FileText, 
  Send, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  User,
  CalendarDays
} from 'lucide-react'
import { submitLeaveRequestAction } from '@/app/learner/actions'
import { toast } from '@/lib/toast'

interface LeaveRequestFormProps {
  userId: string
  userName: string
  userEmail: string
  placementInfo?: {
    id: string
    companyName: string
    position: string
  } | null
  onSuccess?: () => void
  className?: string
}

const leaveTypes = {
  'sick': {
    label: 'Sick Leave',
    description: 'Medical appointments, illness, or health-related issues',
    icon: '🏥',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    maxDays: 5
  },
  'personal': {
    label: 'Personal Leave',
    description: 'Personal matters, family events, or personal appointments',
    icon: '👤',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    maxDays: 3
  },
  'emergency': {
    label: 'Emergency Leave',
    description: 'Urgent family emergencies or critical situations',
    icon: '🚨',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    maxDays: 7
  },
  'other': {
    label: 'Other',
    description: 'Other reasons not covered above',
    icon: '📝',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    maxDays: 2
  }
}

export function LeaveRequestForm({ 
  userId, 
  userName, 
  userEmail, 
  placementInfo,
  onSuccess,
  className 
}: LeaveRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    days: 0,
    reason: '',
    emergencyContact: '',
    emergencyPhone: '',
    supportingDocuments: '',
    notes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Auto-calculate days when dates change
    if (field === 'startDate' || field === 'endDate') {
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate)
        const end = new Date(formData.endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        setFormData(prev => ({ ...prev, days: diffDays }))
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.type) {
      newErrors.type = 'Please select a leave type'
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Please select a start date'
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Please select an end date'
    }
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end < start) {
        newErrors.endDate = 'End date must be after start date'
      }
    }
    if (formData.days <= 0) {
      newErrors.days = 'Leave duration must be at least 1 day'
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for your leave request'
    }
    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Please provide an emergency contact'
    }
    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = 'Please provide an emergency contact phone number'
    }

    // Check if leave type has maximum days limit
    if (formData.type && formData.days > 0) {
      const leaveType = leaveTypes[formData.type as keyof typeof leaveTypes]
      if (leaveType && formData.days > leaveType.maxDays) {
        newErrors.days = `Maximum ${leaveType.maxDays} days allowed for ${leaveType.label}`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      
      const result = await submitLeaveRequestAction({
        userId,
        userName,
        userEmail,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: formData.days,
        reason: formData.reason,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        supportingDocuments: formData.supportingDocuments,
        notes: formData.notes,
        placementInfo: placementInfo || null
      })

      if (result.success) {
        setIsSubmitted(true)
        toast.success('Leave request submitted successfully! You will be notified of the decision.')
        setTimeout(() => {
          setIsSubmitted(false)
          setFormData({
            type: '',
            startDate: '',
            endDate: '',
            days: 0,
            reason: '',
            emergencyContact: '',
            emergencyPhone: '',
            supportingDocuments: '',
            notes: ''
          })
          onSuccess?.()
        }, 3000)
      } else {
        toast.error(result.error || 'Failed to submit leave request')
      }
    } catch (error) {
      console.error('Error submitting leave request:', error)
      toast.error('Failed to submit leave request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedLeaveType = formData.type ? leaveTypes[formData.type as keyof typeof leaveTypes] : null

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span>Submit Leave Request</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isSubmitted ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">Leave Request Submitted!</h3>
            <p className="text-gray-600 mb-4">
              Your leave request has been submitted for review. You will be notified of the decision within 24-48 hours.
            </p>
            <div className="text-sm text-gray-500">
              <p>Reference ID: {Date.now().toString(36).toUpperCase()}</p>
              <p>Expected response time: 24-48 hours</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Requesting as:</h4>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{userName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CalendarDays className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{placementInfo?.companyName || 'No placement assigned'}</span>
                </div>
              </div>
            </div>

            {/* Leave Type */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Leave Type *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(leaveTypes).map(([key, leaveType]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleInputChange('type', key)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.type === key
                        ? `${leaveType.borderColor} ${leaveType.bgColor}`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{leaveType.icon}</span>
                      <div>
                        <p className={`font-medium ${formData.type === key ? leaveType.color : 'text-gray-700'}`}>
                          {leaveType.label}
                        </p>
                        <p className="text-xs text-gray-500">{leaveType.description}</p>
                        <p className="text-xs text-gray-400">Max {leaveType.maxDays} days</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type}</p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-semibold">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-semibold">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="days" className="text-sm font-semibold">Duration (Days)</Label>
                <Input
                  id="days"
                  type="number"
                  min="1"
                  value={formData.days}
                  onChange={(e) => handleInputChange('days', e.target.value)}
                  className={errors.days ? 'border-red-500' : ''}
                  readOnly
                />
                {errors.days && (
                  <p className="text-sm text-red-600">{errors.days}</p>
                )}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-semibold">Reason for Leave *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="Please provide a detailed reason for your leave request..."
                rows={3}
                className={errors.reason ? 'border-red-500' : ''}
              />
              {errors.reason && (
                <p className="text-sm text-red-600">{errors.reason}</p>
              )}
            </div>

            {/* Emergency Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact" className="text-sm font-semibold">Emergency Contact *</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Full name"
                  className={errors.emergencyContact ? 'border-red-500' : ''}
                />
                {errors.emergencyContact && (
                  <p className="text-sm text-red-600">{errors.emergencyContact}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone" className="text-sm font-semibold">Emergency Phone *</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="+27 XX XXX XXXX"
                  className={errors.emergencyPhone ? 'border-red-500' : ''}
                />
                {errors.emergencyPhone && (
                  <p className="text-sm text-red-600">{errors.emergencyPhone}</p>
                )}
              </div>
            </div>

            {/* Supporting Documents */}
            <div className="space-y-2">
              <Label htmlFor="supportingDocuments" className="text-sm font-semibold">Supporting Documents (Optional)</Label>
              <Input
                id="supportingDocuments"
                value={formData.supportingDocuments}
                onChange={(e) => handleInputChange('supportingDocuments', e.target.value)}
                placeholder="List any supporting documents (medical certificates, etc.)"
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information or special requests..."
                rows={2}
              />
            </div>

            {/* Leave Policy Notice */}
            {selectedLeaveType && (
              <Alert className={`${selectedLeaveType.bgColor} ${selectedLeaveType.borderColor}`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{selectedLeaveType.label} Policy:</strong> Maximum {selectedLeaveType.maxDays} days allowed. 
                  Please ensure you have sufficient notice and provide supporting documentation if required.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Submit Leave Request</span>
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}





