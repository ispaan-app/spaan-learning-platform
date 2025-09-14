'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
// import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Settings, 
  Edit, 
  Save, 
  X, 
  Camera, 
  Bell, 
  Lock, 
  Eye, 
  EyeOff,
  Key,
  Activity,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  LogOut
} from 'lucide-react'
import { toast as sonnerToast } from 'sonner'
import { db, storage } from '@/lib/firebase'
import { collection, getDocs, query, where, updateDoc, doc, addDoc, setDoc, getDoc, orderBy, limit } from 'firebase/firestore'
import { updateProfile, updatePassword } from 'firebase/auth'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { uploadAvatar } from '@/lib/fileUpload'
import { AvatarUpload } from '@/components/ui/file-upload'
import { useAuth } from '@/hooks/useAuth'

interface AdminProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  avatar?: string
  bio?: string
  location?: string
  department?: string
  joinDate: string
  lastLogin: string
  preferences: {
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
    privacy: {
      showEmail: boolean
      showPhone: boolean
      showLocation: boolean
    }
    theme: 'light' | 'dark' | 'auto'
    language: string
  }
  security: {
    twoFactorEnabled: boolean
    lastPasswordChange: string
    loginHistory: Array<{
      id: string
      timestamp: string
      ipAddress: string
      location: string
      device: string
    }>
  }
  activity: Array<{
    id: string
    type: 'success' | 'warning' | 'error' | 'info'
    title: string
    description: string
    timestamp: string
  }>
  stats: {
    totalActions: number
    applicationsReviewed: number
    learnersManaged: number
    placementsCreated: number
    announcementsSent: number
    successRate: number
  }
}

export default function AdminProfilePage() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  
  // Debug logging
  console.log('AdminProfilePage render:', { user: !!user, loading, profile: !!profile })
  
  // Form states
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    location: '',
    department: ''
  })
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      showEmail: true,
      showPhone: false,
      showLocation: true
    },
    theme: 'light' as 'light' | 'dark' | 'auto',
    language: 'en'
  })

  useEffect(() => {
    console.log('useEffect triggered:', { user: !!user, loading })
    if (user && !loading) {
      loadProfile()
    }
  }, [user, loading])
  
  // Additional effect to handle user loading
  useEffect(() => {
    if (user && !loading && !profile) {
      console.log('User loaded but no profile, attempting to load profile')
      loadProfile()
    }
  }, [user, loading, profile])

  const ensureProfileExists = async () => {
    if (!user) return false
    
    console.log('Ensuring profile exists for user:', user.uid)
    
    try {
      // Check if profile exists
      const profileDoc = await getDoc(doc(db, 'users', user.uid))
      if (profileDoc.exists()) {
        console.log('Profile already exists')
        return true
      }
      
      // Create profile if it doesn't exist
      console.log('Creating new profile for user')
      const newProfile = {
        uid: user.uid,
        id: user.uid,
        firstName: user.displayName?.split(' ')[0] || 'Admin',
        lastName: user.displayName?.split(' ')[1] || 'User',
        email: user.email || '',
        phone: '',
        role: 'admin',
        avatar: user.photoURL || '',
        bio: 'Admin user with platform management privileges.',
        location: 'Cape Town, South Africa',
        department: 'Administration',
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        preferences: {
          notifications: { email: true, push: true, sms: false },
          privacy: { showEmail: true, showPhone: false, showLocation: true },
          theme: 'light' as 'light' | 'dark' | 'auto',
          language: 'en'
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: new Date().toISOString(),
          loginHistory: [{
            id: '1',
            timestamp: new Date().toISOString(),
            ipAddress: '192.168.1.100',
            location: 'Cape Town, South Africa',
            device: 'Chrome on Windows'
          }]
        },
        activity: [],
        stats: {
          totalActions: 0,
          applicationsReviewed: 0,
          learnersManaged: 0,
          placementsCreated: 0,
          announcementsSent: 0,
          successRate: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await setDoc(doc(db, 'users', user.uid), newProfile)
      console.log('Profile created successfully')
      return true
    } catch (error) {
      console.error('Error ensuring profile exists:', error)
      return false
    }
  }

  const loadProfile = async () => {
    if (!user) {
      console.log('No user found, skipping profile load')
      return
    }
    
    console.log('Loading profile for user:', { uid: user.uid, email: user.email })
    
    try {
      setLoadingProfile(true)
      
      // First ensure profile exists
      const profileExists = await ensureProfileExists()
      if (!profileExists) {
        console.log('Failed to ensure profile exists, using fallback')
        throw new Error('Failed to create profile')
      }
      
      // Get the profile directly by UID (we know it exists now)
      console.log('Loading profile by UID:', user.uid)
      const profileDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data()
        console.log('Found existing profile:', profileData)
        
        // Load real-time stats from Firestore
        const [applicantsSnapshot, learnersSnapshot, placementsSnapshot, announcementsSnapshot, auditLogsSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'users'), where('role', '==', 'applicant'))),
          getDocs(query(collection(db, 'users'), where('role', '==', 'learner'))),
          getDocs(collection(db, 'placements')),
          getDocs(collection(db, 'announcements')),
          getDocs(query(collection(db, 'audit-logs'), where('adminId', '==', user.uid), orderBy('timestamp', 'desc'), limit(10)))
        ])

        // Calculate real statistics
        const totalApplicants = applicantsSnapshot.size
        const totalLearners = learnersSnapshot.size
        const totalPlacements = placementsSnapshot.size
        const totalAnnouncements = announcementsSnapshot.size
        
        // Get recent activity from audit logs
        const recentActivity = auditLogsSnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            type: data.type || 'info',
            title: data.action || 'System Action',
            description: data.details || 'Action performed',
            timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
          }
        })

        // Create comprehensive admin profile with real data
        const adminProfile: AdminProfile = {
          id: profileDoc.id,
          firstName: profileData.firstName || 'Admin',
          lastName: profileData.lastName || 'User',
          email: user.email || '',
          phone: profileData.phone || '',
          role: 'admin',
          avatar: user.photoURL || '',
          bio: profileData.bio || 'Experienced admin with expertise in user management and platform operations.',
          location: profileData.location || 'Cape Town, South Africa',
          department: profileData.department || 'Administration',
          joinDate: profileData.createdAt || new Date().toISOString(),
          lastLogin: profileData.lastLoginAt || new Date().toISOString(),
          preferences: profileData.preferences || {
            notifications: { email: true, push: true, sms: false },
            privacy: { showEmail: true, showPhone: false, showLocation: true },
            theme: 'light' as 'light' | 'dark' | 'auto',
            language: 'en'
          },
          security: {
            twoFactorEnabled: profileData.twoFactorEnabled || false,
            lastPasswordChange: profileData.lastPasswordChange || new Date().toISOString(),
            loginHistory: profileData.loginHistory || [
              {
                id: '1',
                timestamp: new Date().toISOString(),
                ipAddress: '192.168.1.100',
                location: 'Cape Town, South Africa',
                device: 'Chrome on Windows'
              }
            ]
          },
          activity: recentActivity,
          stats: {
            totalActions: auditLogsSnapshot.size,
            applicationsReviewed: totalApplicants,
            learnersManaged: totalLearners,
            placementsCreated: totalPlacements,
            announcementsSent: totalAnnouncements,
            successRate: totalApplicants > 0 ? Math.round((totalLearners / totalApplicants) * 100) : 0
          }
        }
        
        setProfile(adminProfile)
        setEditForm({
          firstName: adminProfile.firstName,
          lastName: adminProfile.lastName,
          phone: adminProfile.phone || '',
          bio: adminProfile.bio || '',
          location: adminProfile.location || '',
          department: adminProfile.department || ''
        })
        setPreferences(adminProfile.preferences)
      } else {
        // This should not happen since we ensure profile exists above
        console.error('Profile not found after ensuring it exists - this should not happen')
        throw new Error('Profile not found after creation')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      console.error('Error details:', error)
      
      // Only create fallback if we haven't already set a profile
      if (user && !profile) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.log('Creating fallback profile due to error:', errorMessage)
        const fallbackProfile: AdminProfile = {
          id: user.uid,
          firstName: user.displayName?.split(' ')[0] || 'Admin',
          lastName: user.displayName?.split(' ')[1] || 'User',
          email: user.email || '',
          phone: '',
          role: 'admin',
          avatar: user.photoURL || '',
          bio: 'Admin user with platform management privileges.',
          location: 'Cape Town, South Africa',
          department: 'Administration',
          joinDate: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          preferences: {
            notifications: { email: true, push: true, sms: false },
            privacy: { showEmail: true, showPhone: false, showLocation: true },
            theme: 'light' as 'light' | 'dark' | 'auto',
            language: 'en'
          },
          security: {
            twoFactorEnabled: false,
            lastPasswordChange: new Date().toISOString(),
            loginHistory: [
              {
                id: '1',
                timestamp: new Date().toISOString(),
                ipAddress: '192.168.1.100',
                location: 'Cape Town, South Africa',
                device: 'Chrome on Windows'
              }
            ]
          },
          activity: [],
          stats: {
            totalActions: 0,
            applicationsReviewed: 0,
            learnersManaged: 0,
            placementsCreated: 0,
            announcementsSent: 0,
            successRate: 0
          }
        }
        
        setProfile(fallbackProfile)
        setEditForm({
          firstName: fallbackProfile.firstName,
          lastName: fallbackProfile.lastName,
          phone: fallbackProfile.phone || '',
          bio: fallbackProfile.bio || '',
          location: fallbackProfile.location || '',
          department: fallbackProfile.department || ''
        })
        setPreferences(fallbackProfile.preferences)
        
        sonnerToast.success('Admin profile loaded successfully')
      } else {
        sonnerToast.error('Failed to load profile. Please try refreshing the page.')
      }
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user || !profile) return
    
    try {
      // Update Firestore profile
      await updateDoc(doc(db, 'users', user.uid), {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        bio: editForm.bio,
        location: editForm.location,
        department: editForm.department,
        preferences: preferences,
        updatedAt: new Date().toISOString()
      })

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: `${editForm.firstName} ${editForm.lastName}`
      })

      sonnerToast.success('Profile updated successfully')
      setIsEditing(false)
      loadProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      sonnerToast.error('Failed to update profile')
    }
  }

  const handleChangePassword = async () => {
    if (!user) return
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      sonnerToast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      sonnerToast.error('Password must be at least 6 characters long')
      return
    }

    try {
      await updatePassword(user, passwordForm.newPassword)
      sonnerToast.success('Password updated successfully')
      setIsChangingPassword(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      console.error('Error updating password:', error)
      if (error.code === 'auth/requires-recent-login') {
        sonnerToast.error('Please log out and log back in before changing your password')
      } else {
        sonnerToast.error('Failed to update password')
      }
    }
  }

  const handleSavePreferences = async () => {
    if (!user || !profile) return
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        preferences: preferences,
        updatedAt: new Date().toISOString()
      })

      sonnerToast.success('Preferences saved successfully')
      loadProfile()
    } catch (error) {
      console.error('Error saving preferences:', error)
      sonnerToast.error('Failed to save preferences')
    }
  }

  const handleAvatarUpload = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!user?.uid) return { success: false, error: 'User not authenticated' }
    
    setUploadingAvatar(true)
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
        
        setProfile(updatedProfile as AdminProfile)
        sonnerToast.success('Avatar updated successfully')
        return { success: true, url: result.url }
      } else {
        sonnerToast.error(result.error || 'Failed to upload avatar')
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      sonnerToast.error('Failed to upload avatar')
      return { success: false, error: error.message }
    } finally {
      setUploadingAvatar(false)
    }
  }



  const handleRemoveAvatar = async () => {
    if (!user || !profile || !profile.avatar) return

    try {
      setUploadingAvatar(true)
      
      // Delete from storage
      const avatarRef = ref(storage, profile.avatar)
      await deleteObject(avatarRef)

      // Update profile in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        avatar: '',
        updatedAt: new Date().toISOString()
      })

      // Update Firebase Auth profile
      await updateProfile(user, {
        photoURL: null
      })

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar: '' } : null)
      
      sonnerToast.success('Avatar removed successfully')
    } catch (error) {
      console.error('Error removing avatar:', error)
      sonnerToast.error('Failed to remove avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <FileText className="w-4 h-4 text-blue-600" />
    }
  }


  if (!user) {
    return (
      <AdminLayout userRole="admin">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your admin profile.</p>
          <Button onClick={() => window.location.href = '/login/admin'}>
            Go to Login
          </Button>
        </div>
      </AdminLayout>
    )
  }

  if (loadingProfile) {
    return (
      <AdminLayout userRole="admin">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading profile...</span>
            </div>
      </AdminLayout>
    )
  }

  if (!profile) {
    return (
      <AdminLayout userRole="admin">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load your admin profile.</p>
          <div className="space-x-4">
            <Button onClick={loadProfile}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button variant="outline" onClick={() => {
              console.log('Manual profile creation triggered')
              if (user) {
                loadProfile()
              }
            }}>
              Create Profile
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
            <p className="text-gray-600 mt-1">Manage your personal information, password, and account settings</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={loadProfile}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setIsEditing(!isEditing)}>
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          </div>
        </div>

        {/* Profile Overview Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-xl">
                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <Badge className="bg-blue-100 text-blue-800">
                    <Shield className="w-3 h-3 mr-1" />
                    {profile.role.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(profile.joinDate)}</span>
                  </div>
                </div>
                
                {profile.bio && (
                  <p className="mt-3 text-gray-700">{profile.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Applications Reviewed</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.stats.applicationsReviewed}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Learners Managed</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.stats.learnersManaged}</p>
                </div>
                <User className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.stats.successRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Actions</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.stats.totalActions}</p>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Avatar Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profile.avatar} />
                      <AvatarFallback className="text-lg">
                        {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                  </div>
                  
                  <div className="flex-1">
                    <AvatarUpload
                      onUpload={handleAvatarUpload}
                      currentAvatar={profile.avatar}
                      disabled={uploadingAvatar}
                      label="Profile Picture"
                      description="Upload a profile picture (max 5MB)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                        <p className="text-gray-900">{profile.firstName} {profile.lastName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Email</Label>
                        <p className="text-gray-900">{profile.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Phone</Label>
                        <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Department</Label>
                        <p className="text-gray-900">{profile.department}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Location</Label>
                        <p className="text-gray-900">{profile.location}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Role</Label>
                        <Badge className="bg-blue-100 text-blue-800">{profile.role}</Badge>
                      </div>
                    </div>
                  </div>
                )}
                
                {isEditing && (
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password Change */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Password</h3>
                      <p className="text-sm text-gray-500">Last changed: {formatDate(profile.security.lastPasswordChange)}</p>
                    </div>
                    <Button variant="outline" onClick={() => setIsChangingPassword(!isChangingPassword)}>
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                  
                  {isChangingPassword && (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-end space-x-4">
                        <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleChangePassword}>
                          <Save className="w-4 h-4 mr-2" />
                          Update Password
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t"></div>

                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={profile.security.twoFactorEnabled}
                    onCheckedChange={(checked) => {
                      // In a real app, this would trigger 2FA setup
                      sonnerToast.info('2FA setup would be implemented here')
                    }}
                  />
                </div>

                <div className="border-t"></div>

                {/* Login History */}
                <div>
                  <h3 className="font-medium mb-4">Recent Login History</h3>
                  <div className="space-y-3">
                    {profile.security.loginHistory.map((login) => (
                      <div key={login.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">{login.device}</p>
                            <p className="text-xs text-gray-500">{login.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">{formatDate(login.timestamp)}</p>
                          <p className="text-xs text-gray-500">{login.ipAddress}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) => setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, email: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.push}
                    onCheckedChange={(checked) => setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, push: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">SMS Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.sms}
                    onCheckedChange={(checked) => setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, sms: checked }
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Show Email</h3>
                    <p className="text-sm text-gray-500">Make email visible to other users</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.showEmail}
                    onCheckedChange={(checked) => setPreferences({
                      ...preferences,
                      privacy: { ...preferences.privacy, showEmail: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Show Phone</h3>
                    <p className="text-sm text-gray-500">Make phone number visible to other users</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.showPhone}
                    onCheckedChange={(checked) => setPreferences({
                      ...preferences,
                      privacy: { ...preferences.privacy, showPhone: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Show Location</h3>
                    <p className="text-sm text-gray-500">Make location visible to other users</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.showLocation}
                    onCheckedChange={(checked) => setPreferences({
                      ...preferences,
                      privacy: { ...preferences.privacy, showLocation: checked }
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSavePreferences}>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.activity && profile.activity.length > 0 ? (
                    profile.activity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
                      <p className="text-gray-600">Your recent actions will appear here.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}