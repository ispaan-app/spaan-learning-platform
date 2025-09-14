'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AvatarUpload } from '@/components/ui/file-upload'
import { DocumentManager } from '@/components/user/DocumentManager'
import { WelcomeCard } from '@/components/ui/welcome-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { uploadAvatar } from '@/lib/fileUpload'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Key,
  Bell,
  Save,
  Edit,
  Camera,
  Settings,
  Users,
  Activity,
  Database,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react'

interface SuperAdminProfile {
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
  notifications?: {
    email: boolean
    sms: boolean
    push: boolean
    systemAlerts: boolean
    userActivity: boolean
    securityEvents: boolean
  }
  preferences?: {
    theme: 'light' | 'dark' | 'system'
    language: string
    timezone: string
    dashboardLayout: string
  }
}

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalApplications: number
  pendingApplications: number
  totalPlacements: number
  systemHealth: string
  lastBackup: string
  storageUsed: string
}

export default function SuperAdminProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<SuperAdminProfile | null>(null)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<SuperAdminProfile>>({})
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const toast = useToast()

  useEffect(() => {
    if (user) {
      loadProfileData()
    }
  }, [user])

  const loadProfileData = async () => {
    if (!user?.uid) return
    
    setLoading(true)
    try {
      // Load profile data
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data() as SuperAdminProfile
        setProfile(userData)
        setFormData(userData)
      } else {
        // Create default super admin profile
        const defaultProfile: SuperAdminProfile = {
          id: user.uid,
          firstName: user.displayName?.split(' ')[0] || 'Super',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || 'Admin',
          email: user.email || '',
          role: 'super-admin',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notifications: {
            email: true,
            sms: false,
            push: true,
            systemAlerts: true,
            userActivity: true,
            securityEvents: true
          },
          preferences: {
            theme: 'system',
            language: 'en',
            timezone: 'UTC',
            dashboardLayout: 'default'
          }
        }
        setProfile(defaultProfile)
        setFormData(defaultProfile)
      }

      // Load system statistics
      await loadSystemStats()
    } catch (error) {
      console.error('Error loading profile data:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const loadSystemStats = async () => {
    try {
      const [usersSnapshot, applicationsSnapshot, placementsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'applications')),
        getDocs(collection(db, 'placements'))
      ])

      const totalUsers = usersSnapshot.size
      const activeUsers = usersSnapshot.docs.filter(doc => doc.data().status === 'active').length
      const totalApplications = applicationsSnapshot.size
      const pendingApplications = applicationsSnapshot.docs.filter(doc => doc.data().status === 'pending').length
      const totalPlacements = placementsSnapshot.size

      setSystemStats({
        totalUsers,
        activeUsers,
        totalApplications,
        pendingApplications,
        totalPlacements,
        systemHealth: 'Good',
        lastBackup: new Date().toLocaleDateString(),
        storageUsed: '2.4 GB'
      })
    } catch (error) {
      console.error('Error loading system stats:', error)
      // Set default stats if error
      setSystemStats({
        totalUsers: 0,
        activeUsers: 0,
        totalApplications: 0,
        pendingApplications: 0,
        totalPlacements: 0,
        systemHealth: 'Unknown',
        lastBackup: 'N/A',
        storageUsed: 'N/A'
      })
    }
  }

  const handleSave = async () => {
    if (!user?.uid) return
    
    setSaving(true)
    try {
      const updatedProfile = {
        ...profile,
        ...formData,
        updatedAt: new Date().toISOString()
      }

      await updateDoc(doc(db, 'users', user.uid), updatedProfile)
      setProfile(updatedProfile as SuperAdminProfile)
      setEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!user?.uid) return { success: false, error: 'User not authenticated' }
    
    setAvatarUploading(true)
    try {
      const result = await uploadAvatar(file, user.uid)
      
      if (result.success && result.url) {
        const updatedProfile = {
          ...profile,
          avatar: result.url,
          updatedAt: new Date().toISOString()
        }
        
        await updateDoc(doc(db, 'users', user.uid), { 
          avatar: result.url,
          updatedAt: new Date().toISOString()
        })
        
        setProfile(updatedProfile as SuperAdminProfile)
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

  const handleInputChange = (field: keyof SuperAdminProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <AdminLayout userRole="super-admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!profile) {
    return (
      <AdminLayout userRole="super-admin">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Profile not found. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="super-admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark-blue">Super Admin Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your super admin profile and system settings
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date(profile.updatedAt).toLocaleString()}
          </div>
        </div>

        {/* Welcome Card */}
        <WelcomeCard 
          userName={`${profile.firstName} ${profile.lastName}`}
          userRole="super-admin" 
          className="mb-6"
        />

        {/* System Overview */}
        {systemStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Total Users</p>
                    <p className="text-2xl font-bold">{systemStats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Active Users</p>
                    <p className="text-2xl font-bold">{systemStats.activeUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Applications</p>
                    <p className="text-2xl font-bold">{systemStats.totalApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Placements</p>
                    <p className="text-2xl font-bold">{systemStats.totalPlacements}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Picture */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5 text-coral" />
                    <span>Profile Picture</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-coral flex items-center justify-center">
                        <User className="h-16 w-16 text-white" />
                      </div>
                    )}
                  </div>
                  {editing && (
                    <AvatarUpload
                      onUpload={handleAvatarUpload}
                      currentAvatar={profile.avatar}
                      disabled={avatarUploading}
                      label="Update Avatar"
                      description="Upload a new profile picture (max 5MB)"
                    />
                  )}
                </CardContent>
              </Card>

              {/* Personal Details */}
              <Card className="shadow-lg lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-coral" />
                      <span>Personal Information</span>
                    </CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => setEditing(!editing)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {editing ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={editing ? formData.email || '' : profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!editing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={editing ? formData.phone || '' : profile.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!editing}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        value={editing ? formData.location || '' : profile.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        disabled={!editing}
                        placeholder="Enter location"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editing ? formData.bio || '' : profile.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!editing}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>

                  {editing && (
                    <div className="flex justify-end">
                      <Button 
                        className="bg-coral hover:bg-coral/90"
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
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Role & Permissions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-coral" />
                  <span>Role & Permissions</span>
                </CardTitle>
                <CardDescription>
                  Your current role and system permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-coral rounded-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark-blue">Super Administrator</h3>
                      <p className="text-sm text-muted-foreground">
                        Full system access and administrative privileges
                      </p>
                    </div>
                  </div>
                  <Badge className={getRoleBadgeColor(profile.role)}>
                    {profile.role.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <DocumentManager
              userId={user?.uid || ''}
              currentUserId={user?.uid || ''}
              canUpload={true}
              canDelete={true}
            />
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-coral" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>
                  Configure how you want to be notified about system activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                    { key: 'push', label: 'Push Notifications', desc: 'Receive push notifications in browser' },
                    { key: 'sms', label: 'SMS Notifications', desc: 'Receive critical alerts via SMS' },
                    { key: 'systemAlerts', label: 'System Alerts', desc: 'Critical system notifications' },
                    { key: 'userActivity', label: 'User Activity', desc: 'Notifications about user actions' },
                    { key: 'securityEvents', label: 'Security Events', desc: 'Security-related notifications' }
                  ].map((notification) => (
                    <div key={notification.key} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-dark-blue">{notification.label}</h3>
                        <p className="text-sm text-muted-foreground">{notification.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.notifications?.[notification.key as keyof typeof profile.notifications] || false}
                        onChange={(e) => handleInputChange('notifications', {
                          ...profile.notifications,
                          [notification.key]: e.target.checked
                        })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button 
                    className="bg-coral hover:bg-coral/90"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-coral" />
                  <span>System Preferences</span>
                </CardTitle>
                <CardDescription>
                  Customize your dashboard and system preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select 
                      id="timezone"
                      value={profile.preferences?.timezone || 'UTC'}
                      onChange={(e) => handleInputChange('preferences', {
                        ...profile.preferences,
                        timezone: e.target.value
                      })}
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent"
                    >
                      <option value="UTC">UTC</option>
                      <option value="UTC-5">Eastern Time (UTC-5)</option>
                      <option value="UTC-6">Central Time (UTC-6)</option>
                      <option value="UTC-7">Mountain Time (UTC-7)</option>
                      <option value="UTC-8">Pacific Time (UTC-8)</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <select 
                      id="language"
                      value={profile.preferences?.language || 'en'}
                      onChange={(e) => handleInputChange('preferences', {
                        ...profile.preferences,
                        language: e.target.value
                      })}
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <select 
                      id="theme"
                      value={profile.preferences?.theme || 'system'}
                      onChange={(e) => handleInputChange('preferences', {
                        ...profile.preferences,
                        theme: e.target.value as 'light' | 'dark' | 'system'
                      })}
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    className="bg-coral hover:bg-coral/90"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Information */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-coral" />
                    <span>System Health</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      {systemStats?.systemHealth || 'Good'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Backup</span>
                    <span className="text-sm text-muted-foreground">
                      {systemStats?.lastBackup || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage Used</span>
                    <span className="text-sm text-muted-foreground">
                      {systemStats?.storageUsed || 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-coral" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="mr-2 h-4 w-4" />
                    System Backup
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    System Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}