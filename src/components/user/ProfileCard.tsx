'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AvatarUpload } from '@/components/ui/file-upload'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  CheckCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { uploadAvatar } from '@/lib/fileUpload'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'

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

interface ProfileCardProps {
  userId?: string
  compact?: boolean
  showEditButton?: boolean
  onEditClick?: () => void
}

export function ProfileCard({ 
  userId, 
  compact = false, 
  showEditButton = true,
  onEditClick 
}: ProfileCardProps) {
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const toast = useToast()

  const targetUserId = userId || currentUser?.uid

  useEffect(() => {
    if (targetUserId) {
      loadUserProfile()
    }
  }, [targetUserId])

  const loadUserProfile = async () => {
    if (!targetUserId) return
    
    setLoading(true)
    try {
      const userDoc = await getDoc(doc(db, 'users', targetUserId))
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile
        setProfile(userData)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!targetUserId) return { success: false, error: 'User not authenticated' }
    
    setAvatarUploading(true)
    try {
      const result = await uploadAvatar(file, targetUserId)
      
      if (result.success && result.url) {
        await updateDoc(doc(db, 'users', targetUserId), { 
          avatar: result.url,
          updatedAt: new Date().toISOString()
        })
        
        setProfile(prev => prev ? {
          ...prev,
          avatar: result.url,
          updatedAt: new Date().toISOString()
        } : null)
        
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
        <CardContent className={`p-${compact ? '4' : '6'}`}>
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className={`p-${compact ? '4' : '6'}`}>
          <div className="text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Profile not found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className={compact ? 'pb-4' : ''}>
        <div className="flex items-center justify-between">
          <CardTitle className={compact ? 'text-lg' : 'text-xl'}>
            {compact ? 'Profile' : 'User Profile'}
          </CardTitle>
          {showEditButton && onEditClick && (
            <Button variant="outline" size="sm" onClick={onEditClick}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={compact ? 'pt-0' : ''}>
        <div className="space-y-4">
          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className={`${compact ? 'w-16 h-16' : 'w-20 h-20'} rounded-full overflow-hidden border-2 border-gray-200`}>
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <User className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} text-gray-400`} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 truncate`}>
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-gray-600 truncate">{profile.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getRoleBadgeColor(profile.role)}>
                  {profile.role.replace('-', ' ').toUpperCase()}
                </Badge>
                <Badge className={getStatusBadgeColor(profile.status)}>
                  {profile.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Avatar Upload (only for current user) */}
          {!userId && (
            <div className="border-t pt-4">
              <AvatarUpload
                onUpload={handleAvatarUpload}
                currentAvatar={profile.avatar}
                disabled={avatarUploading}
                label={compact ? "Update Avatar" : "Update Profile Picture"}
                description={compact ? "Upload a new profile picture" : "Upload a new profile picture (max 5MB)"}
              />
            </div>
          )}

          {/* Additional Info */}
          {!compact && (
            <div className="space-y-3 border-t pt-4">
              {profile.phone && (
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{profile.phone}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{profile.location}</span>
                </div>
              )}
              {profile.department && (
                <div className="flex items-center space-x-3 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{profile.department}</span>
                </div>
              )}
              {profile.position && (
                <div className="flex items-center space-x-3 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{profile.position}</span>
                </div>
              )}
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {/* Bio */}
          {profile.bio && !compact && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">{profile.bio}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


