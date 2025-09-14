'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Send, 
  Loader2, 
  CheckCircle, 
  X,
  Camera,
  FileText,
  MapPin,
  Clock,
  User
} from 'lucide-react'
import { reportIssueAction } from '@/app/learner/actions'
import { toast } from '@/lib/toast'

interface ReportIssueModalProps {
  userRole: 'learner' | 'admin' | 'super-admin' | 'applicant'
  userId: string
  userName: string
  userEmail: string
  placementInfo?: {
    id: string
    companyName: string
    position: string
  }
  className?: string
}

const issueCategories = {
  'technical': {
    label: 'Technical Issue',
    description: 'App bugs, login problems, or technical difficulties',
    icon: '🔧',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  'placement': {
    label: 'Placement Issue',
    description: 'Problems with work placement or company',
    icon: '🏢',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  'stipend': {
    label: 'Stipend Issue',
    description: 'Payment problems or stipend concerns',
    icon: '💰',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  'attendance': {
    label: 'Attendance Issue',
    description: 'Check-in/check-out problems or time tracking',
    icon: '⏰',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  'general': {
    label: 'General Support',
    description: 'Other questions or support needs',
    icon: '❓',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
}

const priorityLevels = {
  'low': { label: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' },
  'medium': { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  'high': { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  'urgent': { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-100' }
}

export function ReportIssueModal({ 
  userRole, 
  userId, 
  userName, 
  userEmail, 
  placementInfo,
  className 
}: ReportIssueModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    priority: 'medium',
    title: '',
    description: '',
    location: '',
    contactMethod: 'email',
    contactInfo: userEmail
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.category) {
      newErrors.category = 'Please select an issue category'
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Please provide a title for your issue'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Please describe your issue in detail'
    }
    if (formData.contactMethod === 'phone' && !formData.contactInfo.trim()) {
      newErrors.contactInfo = 'Please provide your phone number'
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
      
      const result = await reportIssueAction({
        userId,
        userName,
        userEmail,
        userRole,
        category: formData.category,
        priority: formData.priority as 'high' | 'medium' | 'low' | 'urgent',
        title: formData.title,
        description: formData.description,
        location: formData.location,
        contactMethod: formData.contactMethod as 'email' | 'phone',
        contactInfo: formData.contactInfo,
        placementInfo: placementInfo || null,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      })

      if (result.success) {
        setIsSubmitted(true)
        toast.success('Issue reported successfully! We will get back to you soon.')
        setTimeout(() => {
          setIsOpen(false)
          setIsSubmitted(false)
          setFormData({
            category: '',
            priority: 'medium',
            title: '',
            description: '',
            location: '',
            contactMethod: 'email',
            contactInfo: userEmail
          })
        }, 2000)
      } else {
        toast.error(result.error || 'Failed to report issue')
      }
    } catch (error) {
      console.error('Error reporting issue:', error)
      toast.error('Failed to report issue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategory = formData.category ? issueCategories[formData.category as keyof typeof issueCategories] : null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`w-full justify-start text-xs sm:text-sm ${className}`}
        >
          <AlertTriangle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span>Report an Issue</span>
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">Issue Reported Successfully!</h3>
            <p className="text-gray-600 mb-4">
              Thank you for reporting this issue. Our support team will review it and get back to you soon.
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
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Reporting as:</h4>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{userName}</span>
                </div>
                <Badge variant="outline">{userRole}</Badge>
                {placementInfo && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{placementInfo.companyName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Issue Category */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Issue Category *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(issueCategories).map(([key, category]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleInputChange('category', key)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.category === key
                        ? `${category.borderColor} ${category.bgColor}`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <p className={`font-medium ${formData.category === key ? category.color : 'text-gray-700'}`}>
                          {category.label}
                        </p>
                        <p className="text-xs text-gray-500">{category.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Priority Level */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Priority Level</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityLevels).map(([key, priority]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${priority.bgColor} ${priority.color}`}>
                          {priority.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Issue Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">Issue Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief description of the issue"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Issue Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">Detailed Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Please provide as much detail as possible about the issue..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Location (if applicable) */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold">Location (if applicable)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Where did this issue occur?"
              />
            </div>

            {/* Contact Method */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Preferred Contact Method</Label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="email"
                    checked={formData.contactMethod === 'email'}
                    onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Email</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="phone"
                    checked={formData.contactMethod === 'phone'}
                    onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Phone</span>
                </label>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <Label htmlFor="contactInfo" className="text-sm font-semibold">
                {formData.contactMethod === 'email' ? 'Email Address' : 'Phone Number'} *
              </Label>
              <Input
                id="contactInfo"
                type={formData.contactMethod === 'email' ? 'email' : 'tel'}
                value={formData.contactInfo}
                onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                placeholder={formData.contactMethod === 'email' ? 'your.email@example.com' : '+27 XX XXX XXXX'}
                className={errors.contactInfo ? 'border-red-500' : ''}
              />
              {errors.contactInfo && (
                <p className="text-sm text-red-600">{errors.contactInfo}</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
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
                <span>Submit Issue</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}



