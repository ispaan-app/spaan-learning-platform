'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AiChatbot } from '@/components/ai-chatbot'
import { ProfileForm } from '@/components/learner/profile-form'
import { ProfileDisplay } from '@/components/learner/profile-display'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  getLearnerProfileAction, 
  getLearnerPlacementInfoAction, 
  LearnerProfile 
} from './actions'
import { toast } from '@/lib/toast'

export default function LearnerProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)
      
      const [profileData, placementInfo] = await Promise.all([
        getLearnerProfileAction(user.uid),
        getLearnerPlacementInfoAction(user.uid)
      ])

      if (profileData) {
        setProfile(profileData)
      } else {
        // Create a basic profile if none exists
        const basicProfile: LearnerProfile = {
          userId: user.uid,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          phone: '',
          address: '',
          city: '',
          province: '',
          postalCode: '',
          dateOfBirth: '',
          gender: 'prefer-not-to-say',
          idNumber: '',
          nationality: 'South African',
          program: '',
          programStartDate: '',
          programEndDate: '',
          studentNumber: '',
          profileImage: user.photoURL || undefined,
          emergencyContact: {
            name: '',
            phone: '',
            relationship: '',
            email: ''
          },
          skills: [],
          interests: [],
          languages: [],
          workExperience: [],
          education: [],
          currentPlacement: placementInfo ? {
            id: placementInfo.id,
            companyName: placementInfo.companyName,
            position: placementInfo.position,
            startDate: placementInfo.startDate,
            endDate: placementInfo.endDate,
            status: placementInfo.status as any,
            supervisor: {
              name: '',
              email: '',
              phone: ''
            }
          } : undefined,
          preferences: {
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
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setProfile(basicProfile)
        setIsEditing(true) // Auto-edit mode for new profiles
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [user])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    loadProfile() // Reload to reset any unsaved changes
  }

  const handleSuccess = () => {
    setIsEditing(false)
    loadProfile() // Reload to get updated data
  }

  if (isLoading) {
    return (
      <AdminLayout userRole="learner">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout userRole="learner">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
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
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600">Manage your personal information and preferences</p>
              </div>
            </div>
          </div>

          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>

          <div className="flex justify-center">
            <Button onClick={loadProfile} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="learner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">Manage your personal information and preferences</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        {isEditing ? (
          <ProfileForm
            profile={profile}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            isEditing={true}
          />
        ) : (
          <ProfileDisplay
            profile={profile!}
            onEdit={handleEdit}
          />
        )}

        {/* Profile Completion Status */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Profile Completion</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Profile Completeness</span>
                  <span className="text-sm text-gray-600">
                    {Math.round(calculateProfileCompleteness(profile))}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProfileCompleteness(profile)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Complete your profile to improve your learning experience and placement opportunities.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* AI Support Chatbot */}
      <AiChatbot />
    </AdminLayout>
  )
}

function calculateProfileCompleteness(profile: LearnerProfile): number {
  const fields = [
    profile.firstName,
    profile.lastName,
    profile.email,
    profile.phone,
    profile.address,
    profile.city,
    profile.province,
    profile.dateOfBirth,
    profile.gender,
    profile.nationality,
    profile.program,
    profile.emergencyContact.name,
    profile.emergencyContact.phone,
    profile.emergencyContact.relationship,
    profile.skills.length > 0,
    profile.interests.length > 0
  ]

  const completedFields = fields.filter(field => 
    typeof field === 'boolean' ? field : field && field.toString().trim() !== ''
  ).length

  return (completedFields / fields.length) * 100
}