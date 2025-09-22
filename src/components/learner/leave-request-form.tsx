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
  CalendarDays,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react'
import { submitLeaveRequestAction } from '@/app/learner/actions'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

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
    <Card className={cn(
      "relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-2xl",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
      
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <CardTitle className="flex items-center space-x-3 text-xl">
          <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
            Submit Leave Request
          </span>
          <Sparkles className="h-5 w-5 text-purple-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isSubmitted ? (
          <div className="text-center py-12">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-green-600 mb-3">Leave Request Submitted!</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
              Your leave request has been submitted for review. You will be notified of the decision within 24-48 hours.
            </p>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 max-w-sm mx-auto">
              <div className="text-sm text-green-700 space-y-1">
                <p className="font-semibold">Reference ID: {Date.now().toString(36).toUpperCase()}</p>
              <p>Expected response time: 24-48 hours</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enhanced User Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-blue-600" />
                <h4 className="font-bold text-lg text-blue-800">Requesting as:</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-blue-200">
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Learner Name</p>
                    <p className="font-semibold text-gray-800">{userName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-blue-200">
                  <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                    <CalendarDays className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Placement</p>
                    <p className="font-semibold text-gray-800">{placementInfo?.companyName || 'No placement assigned'}</p>
                </div>
                </div>
              </div>
            </div>

            {/* Enhanced Leave Type */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <Label className="text-lg font-bold text-gray-800">Leave Type *</Label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(leaveTypes).map(([key, leaveType]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleInputChange('type', key)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all duration-300 transform hover:scale-105 group",
                      formData.type === key
                        ? `${leaveType.borderColor} ${leaveType.bgColor} shadow-lg`
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "p-2 rounded-full transition-all duration-300",
                        formData.type === key 
                          ? 'bg-white shadow-md' 
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      )}>
                        <span className="text-xl">{leaveType.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "font-bold text-sm mb-1 transition-colors duration-300",
                          formData.type === key ? leaveType.color : 'text-gray-700'
                        )}>
                          {leaveType.label}
                        </p>
                        <p className="text-xs text-gray-500 mb-1">{leaveType.description}</p>
                        <div className="flex items-center space-x-2">
                          <Badge className={cn(
                            "text-xs px-2 py-1",
                            formData.type === key 
                              ? 'bg-white text-gray-600' 
                              : 'bg-gray-200 text-gray-600'
                          )}>
                            Max {leaveType.maxDays} days
                          </Badge>
                      </div>
                      </div>
                      {formData.type === key && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {errors.type && (
                <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{errors.type}</span>
                </div>
              )}
            </div>

            {/* Enhanced Date Range */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <Label className="text-lg font-bold text-gray-800">Date Range</Label>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                    className={cn(
                      "h-12 text-lg border-2 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      errors.startDate ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    )}
                />
                {errors.startDate && (
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{errors.startDate}</span>
                    </div>
                )}
              </div>

              <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className={cn(
                      "h-12 text-lg border-2 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      errors.endDate ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    )}
                />
                {errors.endDate && (
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{errors.endDate}</span>
                    </div>
                )}
              </div>

              <div className="space-y-2">
                  <Label htmlFor="days" className="text-sm font-semibold text-gray-700">Duration (Days)</Label>
                <Input
                  id="days"
                  type="number"
                  min="1"
                  value={formData.days}
                  onChange={(e) => handleInputChange('days', e.target.value)}
                    className={cn(
                      "h-12 text-lg border-2 rounded-xl transition-all duration-300 bg-gray-50",
                      errors.days ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    )}
                  readOnly
                />
                {errors.days && (
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{errors.days}</span>
                    </div>
                )}
                </div>
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

            {/* Enhanced Submit Button */}
            <div className="flex justify-center pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                <span>{isSubmitting ? 'Submitting...' : 'Submit Leave Request'}</span>
                {!isSubmitting && <Sparkles className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}



























