'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AvatarUpload } from '@/components/ui/file-upload'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Save,
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { uploadAvatar } from '@/lib/fileUpload'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  bio?: string
  location?: string
  dateOfBirth?: string
  role: string
  status: string
  department?: string
  position?: string
  createdAt: string
  updatedAt: string
}

interface UserProfileProps {
  userId: string
  onSave?: (profile: UserProfile) => void
  editable?: boolean
}

export function UserProfile({ userId, onSave, editable = true }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [avatarUploading, setAvatarUploading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    loadUserProfile()
  }, [userId])

  const loadUserProfile = async () => {
    setLoading(true)
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile
        setProfile(userData)
        setFormData(userData)
      } else {
        toast.error('User profile not found')
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      toast.error('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updatedProfile = {
        ...profile,
        ...formData,
        updatedAt: new Date().toISOString()
      }

      await updateDoc(doc(db, 'users', userId), updatedProfile)
      setProfile(updatedProfile as UserProfile)
      setEditing(false)
      onSave?.(updatedProfile as UserProfile)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    setAvatarUploading(true)
    try {
      const result = await uploadAvatar(file, userId)
      
      if (result.success && result.url) {
        const updatedProfile = {
          ...profile,
          avatar: result.url,
          updatedAt: new Date().toISOString()
        }
        
        await updateDoc(doc(db, 'users', userId), { 
          avatar: result.url,
          updatedAt: new Date().toISOString()
        })
        
        setProfile(updatedProfile as UserProfile)
        setFormData(prev => ({ ...prev, avatar: result.url }))
        toast.success('Avatar updated successfully')
        return { success: true, url: result.url }
      } else {
        toast.error(result.error || 'Failed to upload avatar')
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      toast.error('Failed to upload avatar')
      return { success: false, error: error.message }
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'bg-red-100 text-red-800'
      case 'admin':
        return 'bg-blue-100 text-blue-800'
      case 'learner':
        return 'bg-green-100 text-green-800'
      case 'applicant':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              User profile not found or failed to load.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>User Profile</span>
            </CardTitle>
            {editable && (
              <div className="flex items-center space-x-2">
                {editing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(false)
                        setFormData(profile)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-gray-600 mb-2">{profile.email}</p>
              <div className="flex items-center space-x-2">
                <Badge className={getRoleBadgeColor(profile.role)}>
                  {profile.role.replace('-', ' ').toUpperCase()}
                </Badge>
                <Badge className={getStatusBadgeColor(profile.status)}>
                  {profile.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Avatar Upload */}
          {editable && editing && (
            <div className="border-t pt-6">
              <AvatarUpload
                onUpload={handleAvatarUpload}
                currentAvatar={profile.avatar}
                disabled={avatarUploading}
              />
            </div>
          )}

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={editing ? formData.firstName || '' : profile.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={editing ? formData.lastName || '' : profile.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editing ? formData.email || '' : profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={editing ? formData.phone || '' : profile.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!editing}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editing ? formData.location || '' : profile.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!editing}
                placeholder="Enter location"
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={editing ? formData.dateOfBirth || '' : profile.dateOfBirth || ''}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                disabled={!editing}
              />
            </div>
            {profile.role === 'learner' && (
              <>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={editing ? formData.department || '' : profile.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={!editing}
                    placeholder="Enter department"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={editing ? formData.position || '' : profile.position || ''}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    disabled={!editing}
                    placeholder="Enter position"
                  />
                </div>
              </>
            )}
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={editing ? formData.bio || '' : profile.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!editing}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          {/* Profile Metadata */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Created: {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Updated: {new Date(profile.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


