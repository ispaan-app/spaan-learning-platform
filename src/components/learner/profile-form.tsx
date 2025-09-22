'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Building, 
  Camera,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Shield,
  Sparkles,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react'
import { LearnerProfile, updateLearnerProfileAction, uploadProfileImageAction } from '@/app/learner/profile/actions'
import { uploadAvatar } from '@/lib/fileUpload'
import { AvatarUpload } from '@/components/ui/file-upload'
import { toast } from '@/lib/toast'
import { useAuth } from '@/hooks/useAuth'

interface ProfileFormProps {
  profile: LearnerProfile | null
  onSuccess?: () => void
  onCancel?: () => void
  isEditing?: boolean
  className?: string
}

const provinces = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape'
]

const genders = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
]

const relationships = [
  'Parent',
  'Guardian',
  'Spouse',
  'Sibling',
  'Relative',
  'Friend',
  'Other'
]

export function ProfileForm({ 
  profile, 
  onSuccess, 
  onCancel, 
  isEditing = false,
  className 
}: ProfileFormProps) {
  const [formData, setFormData] = useState<LearnerProfile>({
    userId: profile?.userId || '',
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    suburb: profile?.suburb || '',
    city: profile?.city || '',
    province: profile?.province || '',
    postalCode: profile?.postalCode || '',
    dateOfBirth: profile?.dateOfBirth || '',
    gender: profile?.gender || 'male',
    idNumber: profile?.idNumber || '',
    nationality: profile?.nationality || 'South African',
    program: profile?.program || '',
    programStartDate: profile?.programStartDate || '',
    programEndDate: profile?.programEndDate || '',
    studentNumber: profile?.studentNumber || '',
    profileImage: profile?.profileImage,
    emergencyContact: profile?.emergencyContact || {
      name: '',
      phone: '',
      relationship: '',
      email: ''
    },
    skills: profile?.skills || [],
    interests: profile?.interests || [],
    languages: profile?.languages || [],
    workExperience: profile?.workExperience || [],
    education: profile?.education || [],
    currentPlacement: profile?.currentPlacement,
    preferences: profile?.preferences || {
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      privacy: {
        showProfile: true,
        showContact: false,
        showSkills: true
      }
    },
    createdAt: profile?.createdAt || new Date(),
    updatedAt: new Date()
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const { refreshUserData } = useAuth()

  useEffect(() => {
    if (profile?.profileImage) {
      setProfileImage(profile.profileImage)
    }
  }, [profile])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof LearnerProfile] as any,
        [childField]: value
      }
    }))
  }

  const handleArrayAdd = (field: string, value: string) => {
    if (!value.trim()) return
    
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof LearnerProfile] as string[] || []), value.trim()]
    }))
  }

  const handleArrayRemove = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof LearnerProfile] as string[] || []).filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required'
    }
    if (!formData.suburb?.trim()) {
      newErrors.suburb = 'Suburb/Township is required'
    }
    if (!formData.city?.trim()) {
      newErrors.city = 'City is required'
    }
    if (!formData.province?.trim()) {
      newErrors.province = 'Province is required'
    }
    if (!formData.dateOfBirth?.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }
    if (!formData.emergencyContact?.name?.trim()) {
      newErrors.emergencyContactName = 'Emergency contact name is required'
    }
    if (!formData.emergencyContact?.phone?.trim()) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required'
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
      
      // Upload profile image if changed
      if (profileImage && profileImage !== profile?.profileImage) {
        const imageResult = await uploadProfileImageAction(profile?.userId || '', profileImage)
        if (!imageResult.success) {
          throw new Error(imageResult.error || 'Failed to upload image')
        }
        formData.profileImage = imageResult.imageUrl
      }

      const result = await updateLearnerProfileAction(formData.userId, formData)
      if (result.success) {
        toast.success('Profile updated successfully!')
        onSuccess?.()
      } else {
        throw new Error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-8">
          {/* Enhanced Profile Image */}
          <Card className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 border-b border-blue-200">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent">
                  Profile Photo
                </span>
                <Sparkles className="h-5 w-5 text-purple-500" />
              </CardTitle>
            </CardHeader>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={profileImage || undefined} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(formData.firstName || '', formData.lastName || '')}
                  </AvatarFallback>
                </Avatar>
              </div>
                
                <AvatarUpload
                  onUpload={async (file: File) => {
                    try {
                      const result = await uploadAvatar(file, profile?.userId || '')
                      if (result.success && result.url) {
                        setProfileImage(result.url)
                        // Update the profile data in the form
                        setFormData(prev => ({
                          ...prev,
                          profileImage: result.url
                        }))
                        // Refresh user data to update header avatar
                        await refreshUserData()
                        // Show success message
                        toast.success('Avatar updated successfully!')
                        return { success: true, url: result.url }
                      } else {
                        return { success: false, error: result.error || 'Failed to upload image' }
                      }
                    } catch (error) {
                      return { success: false, error: 'Failed to upload image' }
                    }
                  }}
                  currentAvatar={profileImage || undefined}
                  className="mb-4"
                />
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
              <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                  <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-600 mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <Label htmlFor="suburb">Suburb/Township *</Label>
              <Input
                id="suburb"
                value={formData.suburb || ''}
                onChange={(e) => handleInputChange('suburb', e.target.value)}
                className={errors.suburb ? 'border-red-500' : ''}
              />
              {errors.suburb && (
                <p className="text-sm text-red-600 mt-1">{errors.suburb}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <Label htmlFor="province">Province *</Label>
                <Select
                  value={formData.province || ''}
                  onValueChange={(value) => handleInputChange('province', value)}
                >
                  <SelectTrigger className={errors.province ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map(province => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.province && (
                  <p className="text-sm text-red-600 mt-1">{errors.province}</p>
                )}
              </div>

              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode || ''}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={errors.dateOfBirth ? 'border-red-500' : ''}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender || ''}
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map(gender => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.nationality || ''}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber || ''}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="studentNumber">Student Number</Label>
                <Input
                  id="studentNumber"
                  value={formData.studentNumber || ''}
                  onChange={(e) => handleInputChange('studentNumber', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyName">Contact Name *</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyContact?.name || ''}
                  onChange={(e) => handleNestedInputChange('emergencyContact', 'name', e.target.value)}
                  className={errors.emergencyContactName ? 'border-red-500' : ''}
                />
                {errors.emergencyContactName && (
                  <p className="text-sm text-red-600 mt-1">{errors.emergencyContactName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="emergencyPhone">Contact Phone *</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyContact?.phone || ''}
                  onChange={(e) => handleNestedInputChange('emergencyContact', 'phone', e.target.value)}
                  className={errors.emergencyContactPhone ? 'border-red-500' : ''}
                />
                {errors.emergencyContactPhone && (
                  <p className="text-sm text-red-600 mt-1">{errors.emergencyContactPhone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyRelationship">Relationship</Label>
                <Select
                  value={formData.emergencyContact?.relationship || ''}
                  onValueChange={(value) => handleNestedInputChange('emergencyContact', 'relationship', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationships.map(rel => (
                      <SelectItem key={rel} value={rel}>
                        {rel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="emergencyEmail">Contact Email</Label>
                <Input
                  id="emergencyEmail"
                  type="email"
                  value={formData.emergencyContact?.email || ''}
                  onChange={(e) => handleNestedInputChange('emergencyContact', 'email', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {(formData.skills || []).map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                  {skill}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('skills', index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex space-x-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleArrayAdd('skills', newSkill)
                      setNewSkill('')
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    handleArrayAdd('skills', newSkill)
                    setNewSkill('')
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Interests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {(formData.interests || []).map((interest, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                  {interest}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('interests', index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex space-x-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleArrayAdd('interests', newInterest)
                      setNewInterest('')
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    handleArrayAdd('interests', newInterest)
                    setNewInterest('')
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Notifications</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch
                    id="email-notifications"
                    checked={formData.preferences?.notifications?.email || false}
                    onCheckedChange={(checked) => 
                      handleNestedInputChange('preferences', 'notifications', {
                        ...formData.preferences?.notifications,
                        email: checked
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <Switch
                    id="sms-notifications"
                    checked={formData.preferences?.notifications?.sms || false}
                    onCheckedChange={(checked) => 
                      handleNestedInputChange('preferences', 'notifications', {
                        ...formData.preferences?.notifications,
                        sms: checked
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <Switch
                    id="push-notifications"
                    checked={formData.preferences?.notifications?.push || false}
                    onCheckedChange={(checked) => 
                      handleNestedInputChange('preferences', 'notifications', {
                        ...formData.preferences?.notifications,
                        push: checked
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Privacy</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-profile">Show Profile to Others</Label>
                  <Switch
                    id="show-profile"
                    checked={formData.preferences?.privacy?.showProfile || false}
                    onCheckedChange={(checked) => 
                      handleNestedInputChange('preferences', 'privacy', {
                        ...formData.preferences?.privacy,
                        showProfile: checked
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-contact">Show Contact Information</Label>
                  <Switch
                    id="show-contact"
                    checked={formData.preferences?.privacy?.showContact || false}
                    onCheckedChange={(checked) => 
                      handleNestedInputChange('preferences', 'privacy', {
                        ...formData.preferences?.privacy,
                        showContact: checked
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-skills">Show Skills & Interests</Label>
                  <Switch
                    id="show-skills"
                    checked={formData.preferences?.privacy?.showSkills || false}
                    onCheckedChange={(checked) => 
                      handleNestedInputChange('preferences', 'privacy', {
                        ...formData.preferences?.privacy,
                        showSkills: checked
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-4"
            >
              {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
              ) : (
                  <Save className="h-5 w-5 mr-2" />
              )}
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                {!isSubmitting && <Sparkles className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        )}
      </div>
    </form>
    </div>
  )
}
