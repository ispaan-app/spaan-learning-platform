'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target
} from 'lucide-react'
import { LearnerProfile } from '@/app/learner/profile/actions'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ProfileCompletionCardProps {
  profile: LearnerProfile | null
  className?: string
}

export function ProfileCompletionCard({ profile, className }: ProfileCompletionCardProps) {
  const router = useRouter()

  // Check profile completion
  const getCompletionStatus = () => {
    if (!profile) {
      return {
        percentage: 0,
        completedFields: 0,
        totalFields: 8,
        missingFields: [
          'Profile Picture',
          'Personal Information',
          'Contact Details',
          'Address Information',
          'Emergency Contact',
          'Program Details',
          'Skills & Interests',
          'Work Experience'
        ]
      }
    }

    const fields = [
      { key: 'profileImage', label: 'Profile Picture', required: true },
      { key: 'firstName', label: 'First Name', required: true },
      { key: 'lastName', label: 'Last Name', required: true },
      { key: 'email', label: 'Email', required: true },
      { key: 'phone', label: 'Phone', required: true },
      { key: 'address', label: 'Address', required: true },
      { key: 'suburb', label: 'Suburb/Township', required: true },
      { key: 'city', label: 'City', required: true },
      { key: 'province', label: 'Province', required: true },
      { key: 'emergencyContact', label: 'Emergency Contact', required: true, nested: 'name' },
      { key: 'program', label: 'Program', required: true },
      { key: 'skills', label: 'Skills', required: false },
      { key: 'workExperience', label: 'Work Experience', required: false }
    ]

    let completedFields = 0
    const missingFields: string[] = []

    fields.forEach(field => {
      if (field.required) {
        if (field.nested) {
          const value = profile[field.key as keyof LearnerProfile] as any
          if (value && value[field.nested] && value[field.nested].trim()) {
            completedFields++
          } else {
            missingFields.push(field.label)
          }
        } else {
          const value = profile[field.key as keyof LearnerProfile]
          if (value && typeof value === 'string' && value.trim()) {
            completedFields++
          } else if (value && Array.isArray(value) && value.length > 0) {
            completedFields++
          } else {
            missingFields.push(field.label)
          }
        }
      } else {
        // Optional fields - check if they have some data
        const value = profile[field.key as keyof LearnerProfile]
        if (value && Array.isArray(value) && value.length > 0) {
          completedFields++
        }
      }
    })

    const totalRequiredFields = fields.filter(f => f.required).length
    const percentage = Math.round((completedFields / totalRequiredFields) * 100)

    return {
      percentage,
      completedFields,
      totalFields: totalRequiredFields,
      missingFields
    }
  }

  const completionStatus = getCompletionStatus()

  // Don't show the card if profile is 100% complete
  if (completionStatus.percentage >= 100) {
    return null
  }

  const getCompletionMessage = () => {
    if (completionStatus.percentage === 0) {
      return "Complete your profile to get started!"
    } else if (completionStatus.percentage < 50) {
      return "You're getting started! Keep going!"
    } else if (completionStatus.percentage < 80) {
      return "Great progress! Almost there!"
    } else {
      return "Almost complete! Just a few more details!"
    }
  }

  const getCompletionColor = () => {
    if (completionStatus.percentage < 30) return 'text-red-600'
    if (completionStatus.percentage < 60) return 'text-yellow-600'
    if (completionStatus.percentage < 80) return 'text-blue-600'
    return 'text-green-600'
  }

  const getProgressColor = () => {
    if (completionStatus.percentage < 30) return 'bg-red-500'
    if (completionStatus.percentage < 60) return 'bg-yellow-500'
    if (completionStatus.percentage < 80) return 'bg-blue-500'
    return 'bg-green-500'
  }

  return (
    <Card className={cn(
      "relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-2 border-orange-200 shadow-2xl",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-red-400 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-400 to-orange-400 rounded-full translate-y-12 -translate-x-12 opacity-10"></div>
      
      <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100 border-b border-orange-200">
        <CardTitle className="flex items-center space-x-3 text-xl">
          <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
            <Target className="h-6 w-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-orange-800 to-red-800 bg-clip-text text-transparent">
            Profile Completion
          </span>
          <Sparkles className="h-5 w-5 text-orange-500" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Progress Section */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {completionStatus.percentage}%
              </span>
            </div>
            
            <Progress 
              value={completionStatus.percentage} 
              className="h-4 mb-3"
            />
            
            <p className={cn("text-lg font-semibold", getCompletionColor())}>
              {getCompletionMessage()}
            </p>
            
            <p className="text-sm text-gray-600 mt-2">
              {completionStatus.completedFields} of {completionStatus.totalFields} required fields completed
            </p>
          </div>

          {/* Missing Fields */}
          {completionStatus.missingFields.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-orange-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-orange-600" />
                <span>Still needed:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {completionStatus.missingFields.slice(0, 6).map((field, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span className="text-gray-700">{field}</span>
                  </div>
                ))}
                {completionStatus.missingFields.length > 6 && (
                  <div className="text-sm text-gray-500 col-span-full">
                    +{completionStatus.missingFields.length - 6} more fields
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Benefits Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Complete your profile to unlock:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-green-700">
              <div className="flex items-center space-x-2">
                <User className="h-3 w-3" />
                <span>Better placement matching</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-3 w-3" />
                <span>Location-based opportunities</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-3 w-3" />
                <span>Direct employer contact</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3" />
                <span>Personalized recommendations</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push('/learner/profile')}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <User className="h-4 w-4 mr-2" />
              Complete Profile
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            {!profile?.profileImage && (
              <Button
                onClick={() => router.push('/learner/profile')}
                variant="outline"
                className="bg-white/80 hover:bg-white/90 text-orange-600 border-orange-300 hover:border-orange-400"
              >
                <Camera className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
