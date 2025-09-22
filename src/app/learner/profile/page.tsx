'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AiChatbot } from '@/components/ai-chatbot'
import { ProfileForm } from '@/components/learner/profile-form'
import { ProfileDisplay } from '@/components/learner/profile-display'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageLoader } from '@/components/ui/loading'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Shield,
  User,
  Sparkles,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  getLearnerProfileAction, 
  getLearnerPlacementInfoAction, 
  LearnerProfile 
} from './actions'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

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
          suburb: '',
          city: '',
          province: '',
          postalCode: '',
          dateOfBirth: '',
          gender: 'male',
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
    return <PageLoader message="Loading your profile..." />
  }

  if (error) {
    return (
      <AdminLayout userRole="learner">
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F5F0E1 0%, #F5F0E1 50%, #F5F0E1 100%)' }}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-400 to-pink-600 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-400 to-yellow-600 rounded-full translate-y-40 -translate-x-40"></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto space-y-8 p-6">
            {/* Enhanced Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                  className="p-3 rounded-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                  <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    My Profile
                  </h1>
                <p className="text-gray-600">Manage your personal information and preferences</p>
              </div>
            </div>
          </div>

            {/* Enhanced Error Alert */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border-2 border-red-200 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-800 mb-1">Profile Loading Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>

          <div className="flex justify-center">
              <Button 
                onClick={loadProfile} 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-4"
              >
                <Activity className="h-5 w-5 mr-2" />
              Try Again
                <Sparkles className="h-4 w-4 ml-2" />
            </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="learner">
      <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F5F0E1 0%, #F5F0E1 50%, #F5F0E1 100%)' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-48 translate-x-48" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)' }}></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full translate-y-40 -translate-x-40" style={{ background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full -translate-x-32 -translate-y-32" style={{ background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.15) 0%, rgba(251, 146, 60, 0.15) 100%)' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto space-y-8 p-6">
          {/* Enhanced Header */}
          <div className="text-center space-y-6 mb-8">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg mb-4">
              <Shield className="h-5 w-5 mr-2" />
              <span className="font-semibold">Profile Management</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              My Profile
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Manage your personal information, preferences, and showcase your skills to potential employers.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Button
              variant="ghost"
                size="lg"
              onClick={() => router.back()}
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
                <ArrowLeft className="h-5 w-5" />
                <span>Go Back</span>
            </Button>
            {isEditing ? (
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleCancel}
                  className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-red-200 hover:border-red-400 hover:bg-red-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <X className="h-5 w-5" />
                  <span>Cancel</span>
                </Button>
              ) : (
                <Button 
                  onClick={handleEdit} 
                  size="lg"
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Edit className="h-5 w-5" />
                  <span>Edit Profile</span>
                  <Sparkles className="h-4 w-4" />
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

          {/* Enhanced Profile Completion Status */}
        {profile && (
            <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-800 to-green-800 bg-clip-text text-transparent">
                    Profile Completion
                  </span>
                  <TrendingUp className="h-5 w-5 text-green-600" />
              </CardTitle>
            </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-800">Profile Completeness</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-green-600">
                        {Math.round(calculateProfileCompleteness(profile))}%
                  </span>
                      <span className="text-sm text-gray-600">Complete</span>
                    </div>
                </div>
                  
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                  <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${calculateProfileCompleteness(profile)}%` }}
                  />
                </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold text-white drop-shadow-lg">
                        {Math.round(calculateProfileCompleteness(profile))}% Complete
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">
                      <Zap className="h-4 w-4 inline mr-2" />
                  Complete your profile to improve your learning experience and placement opportunities.
                </p>
                  </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
        {/* AI Floating Chatbot */}
        <div className="fixed bottom-6 right-6 z-50">
          <AiChatbot className="shadow-2xl" />
        </div>
      </div>
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