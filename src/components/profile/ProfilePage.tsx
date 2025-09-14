'use client'

import { useState } from 'react'
import { ProfileHeader } from './ProfileHeader'
import { ProfileStats } from './ProfileStats'
import { ProfileActivities } from './ProfileActivities'
import { ProfileSettings } from './ProfileSettings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Activity, 
  Settings, 
  User,
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react'

interface ProfilePageProps {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: 'super-admin' | 'admin' | 'applicant' | 'learner'
    profileImage?: string
    location?: string
    joinDate?: string
    status?: string
    rating?: number
    achievements?: string[]
    preferences?: {
      notifications: boolean
      emailUpdates: boolean
      darkMode: boolean
      language: string
      timezone: string
    }
  }
  stats: {
    totalActions?: number
    completedTasks?: number
    pendingItems?: number
    successRate?: number
    experience?: string
    nextMilestone?: string
  }
  activities: Array<{
    id: string
    type: 'success' | 'warning' | 'info' | 'achievement'
    title: string
    description: string
    timestamp: string
    user?: {
      name: string
      avatar?: string
    }
    action?: {
      label: string
      href: string
    }
  }>
  onBack?: () => void
}

export function ProfilePage({ user, stats, activities, onBack }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const handleSaveSettings = (data: any) => {
    console.log('Saving settings:', data)
    // Implement save logic here
  }

  const handleEditProfile = () => {
    console.log('Editing profile')
    // Implement edit logic here
  }

  const handleExportData = () => {
    console.log('Exporting data')
    // Implement export logic here
  }

  const handleShareProfile = () => {
    console.log('Sharing profile')
    // Implement share logic here
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <ProfileHeader 
        user={user} 
        onEdit={handleEditProfile}
        onBack={onBack}
      />

      {/* Main Content */}
      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mb-6">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" onClick={handleShareProfile}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Profile
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Activity</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <ProfileStats userRole={user.role} stats={stats} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProfileActivities 
                  activities={activities} 
                  userRole={user.role}
                  showAll={false}
                />
                
                {/* Quick Actions Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Download Data
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <ProfileActivities 
                activities={activities} 
                userRole={user.role}
                showAll={true}
              />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <ProfileSettings 
                user={user} 
                onSave={handleSaveSettings}
              />
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Full Name</label>
                        <p className="text-lg font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-lg text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Role</label>
                        <p className="text-lg text-gray-900 capitalize">
                          {user.role.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {user.location && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Location</label>
                          <p className="text-lg text-gray-900">{user.location}</p>
                        </div>
                      )}
                      {user.joinDate && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Member Since</label>
                          <p className="text-lg text-gray-900">
                            {new Date(user.joinDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {user.rating && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Rating</label>
                          <p className="text-lg text-gray-900">{user.rating}/5.0</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {user.achievements && user.achievements.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Achievements</label>
                      <div className="flex flex-wrap gap-2">
                        {user.achievements.map((achievement, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-[#6D9773] text-white text-sm rounded-full"
                          >
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}




