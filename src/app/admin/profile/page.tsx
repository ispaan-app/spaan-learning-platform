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
import { Progress } from '@/components/ui/progress'
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
  LogOut,
  Users,
  Briefcase,
  MessageSquare,
  BarChart3,
  Zap,
  Star,
  Target,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react'
import { toast as sonnerToast } from 'sonner'
import { db, storage } from '@/lib/firebase'
import { collection, getDocs, query, where, updateDoc, doc, addDoc, setDoc, getDoc, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { updateProfile, updatePassword } from 'firebase/auth'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { uploadAvatar } from '@/lib/fileUpload'
import { AvatarUpload } from '@/components/ui/file-upload'
import { useAuth } from '@/contexts/AuthContext'

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
  
  // Real-time data states
  const [realTimeStats, setRealTimeStats] = useState({
    totalApplicants: 0,
    totalLearners: 0,
    totalPlacements: 0,
    totalAnnouncements: 0,
    recentActivity: 0,
    systemHealth: 'excellent'
  })
  const [isOnline, setIsOnline] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  
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
      setupRealTimeListeners()
    }
  }, [user, loading])
  
  // Additional effect to handle user loading
  useEffect(() => {
    if (user && !loading && !profile) {
      console.log('User loaded but no profile, attempting to load profile')
      loadProfile()
    }
  }, [user, loading, profile])

  // Real-time data listeners
  const setupRealTimeListeners = () => {
    if (!user) return

    console.log('🔴 Setting up real-time listeners for admin profile...')

    // Listen to applicants collection
    const applicantsUnsubscribe = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'applicant')),
      (snapshot) => {
        setRealTimeStats(prev => ({
          ...prev,
          totalApplicants: snapshot.size,
          lastUpdate: new Date()
        }))
        console.log('📊 Real-time applicants update:', snapshot.size)
      },
      (error) => {
        console.error('❌ Error listening to applicants:', error)
      }
    )

    // Listen to learners collection
    const learnersUnsubscribe = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'learner')),
      (snapshot) => {
        setRealTimeStats(prev => ({
          ...prev,
          totalLearners: snapshot.size,
          lastUpdate: new Date()
        }))
        console.log('👥 Real-time learners update:', snapshot.size)
      },
      (error) => {
        console.error('❌ Error listening to learners:', error)
      }
    )

    // Listen to placements collection
    const placementsUnsubscribe = onSnapshot(
      collection(db, 'placements'),
      (snapshot) => {
        setRealTimeStats(prev => ({
          ...prev,
          totalPlacements: snapshot.size,
          lastUpdate: new Date()
        }))
        console.log('💼 Real-time placements update:', snapshot.size)
      },
      (error) => {
        console.error('❌ Error listening to placements:', error)
      }
    )

    // Listen to announcements collection
    const announcementsUnsubscribe = onSnapshot(
      collection(db, 'announcements'),
      (snapshot) => {
        setRealTimeStats(prev => ({
          ...prev,
          totalAnnouncements: snapshot.size,
          lastUpdate: new Date()
        }))
        console.log('📢 Real-time announcements update:', snapshot.size)
      },
      (error) => {
        console.error('❌ Error listening to announcements:', error)
      }
    )

    // Listen to audit logs for recent activity
    const auditLogsUnsubscribe = onSnapshot(
      query(
        collection(db, 'audit-logs'),
        where('adminId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(10)
      ),
      (snapshot) => {
        setRealTimeStats(prev => ({
          ...prev,
          recentActivity: snapshot.size,
          lastUpdate: new Date()
        }))
        console.log('📈 Real-time activity update:', snapshot.size)
      },
      (error) => {
        console.error('❌ Error listening to audit logs:', error)
      }
    )

    // Online/offline detection
    const handleOnline = () => {
      setIsOnline(true)
      console.log('🌐 Admin is online')
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log('📴 Admin is offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up real-time listeners...')
      applicantsUnsubscribe()
      learnersUnsubscribe()
      placementsUnsubscribe()
      announcementsUnsubscribe()
      auditLogsUnsubscribe()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }

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
        {/* Enhanced Header with AppEver Design */}
        <div className="relative overflow-hidden">
          <div className="relative bg-white rounded-2xl p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300" style={{ backgroundColor: '#1E3D59' }}>
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold" style={{ color: '#1E3D59' }}>
                      Profile Management
                    </h1>
                    <p className="text-lg" style={{ color: '#1E3D59' }}>Manage your personal information, security, and account settings</p>
                  </div>
                </div>
                
                {/* Real-time Status Indicators */}
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-sm font-medium text-green-600">Live Data</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-gray-500" />
                    )}
                    <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                    <Clock className="w-4 h-4" style={{ color: '#FFC13B' }} />
                    <span className="text-sm font-medium" style={{ color: '#1E3D59' }}>
                      Updated {lastUpdate.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={loadProfile}
                  className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                  style={{ color: '#1E3D59' }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <span className="font-semibold">Refresh</span>
                </Button>
                <Button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#FF6E40' }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  <span className="font-semibold">{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Profile Overview Card */}
        <div className="relative overflow-hidden">
          <Card className="relative bg-white shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center space-x-8">
                <div className="relative group">
                  <Avatar className="relative w-32 h-32 shadow-xl">
                    <AvatarImage src={profile.avatar} className="object-cover" />
                    <AvatarFallback className="text-2xl font-bold text-white" style={{ backgroundColor: '#1E3D59' }}>
                      {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF6E40' }}>
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <h2 className="text-3xl font-bold" style={{ color: '#1E3D59' }}>
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <Badge className="px-4 py-2 text-sm font-semibold text-white shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                      <Shield className="w-4 h-4 mr-2" />
                      {profile.role.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3 p-3 rounded-xl backdrop-blur-sm" style={{ backgroundColor: '#F5F0E1' }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1E3D59' }}>
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#1E3D59' }}>Email</p>
                        <p className="font-semibold" style={{ color: '#1E3D59' }}>{profile.email}</p>
                      </div>
                    </div>
                    
                    {profile.phone && (
                      <div className="flex items-center space-x-3 p-3 rounded-xl backdrop-blur-sm" style={{ backgroundColor: '#F5F0E1' }}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FF6E40' }}>
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#1E3D59' }}>Phone</p>
                          <p className="font-semibold" style={{ color: '#1E3D59' }}>{profile.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3 p-3 rounded-xl backdrop-blur-sm" style={{ backgroundColor: '#F5F0E1' }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFC13B' }}>
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#1E3D59' }}>Joined</p>
                        <p className="font-semibold" style={{ color: '#1E3D59' }}>{formatDate(profile.joinDate)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {profile.bio && (
                    <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}>
                      <p className="leading-relaxed" style={{ color: '#1E3D59' }}>{profile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Real-time Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Applications Reviewed Card */}
          <div className="relative group">
            <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-xs font-medium text-green-600">Live</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Applications Reviewed</p>
                  <p className="text-3xl font-bold mb-2" style={{ color: '#1E3D59' }}>{realTimeStats.totalApplicants}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F5F0E1' }}>
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((realTimeStats.totalApplicants / 100) * 100, 100)}%`, backgroundColor: '#FF6E40' }}
                      ></div>
                    </div>
                    <span className="text-xs" style={{ color: '#1E3D59' }}>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Learners Managed Card */}
          <div className="relative group">
            <Card className="relative bg-white border shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105" style={{ borderColor: '#FFC13B' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFC13B' }}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-xs font-medium text-green-600">Live</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Learners Managed</p>
                  <p className="text-3xl font-bold mb-2" style={{ color: '#1E3D59' }}>{realTimeStats.totalLearners}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F5F0E1' }}>
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((realTimeStats.totalLearners / 50) * 100, 100)}%`, backgroundColor: '#FFC13B' }}
                      ></div>
                    </div>
                    <span className="text-xs" style={{ color: '#1E3D59' }}>50</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Placements Created Card */}
          <div className="relative group">
            <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-xs font-medium text-green-600">Live</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Placements Created</p>
                  <p className="text-3xl font-bold mb-2" style={{ color: '#1E3D59' }}>{realTimeStats.totalPlacements}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F5F0E1' }}>
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((realTimeStats.totalPlacements / 25) * 100, 100)}%`, backgroundColor: '#1E3D59' }}
                      ></div>
                    </div>
                    <span className="text-xs" style={{ color: '#1E3D59' }}>25</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Card */}
          <div className="relative group">
            <Card className="relative bg-white border shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105" style={{ borderColor: '#FF6E40' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-xs font-medium text-green-600">Live</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Recent Activity</p>
                  <p className="text-3xl font-bold mb-2" style={{ color: '#1E3D59' }}>{realTimeStats.recentActivity}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F5F0E1' }}>
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((realTimeStats.recentActivity / 10) * 100, 100)}%`, backgroundColor: '#FF6E40' }}
                      ></div>
                    </div>
                    <span className="text-xs" style={{ color: '#1E3D59' }}>10</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Tabs with AppEver Design */}
        <div className="relative">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="relative">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-xl rounded-2xl p-2">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                style={{ 
                  backgroundColor: activeTab === 'overview' ? '#1E3D59' : 'transparent',
                  color: activeTab === 'overview' ? 'white' : '#1E3D59'
                }}
              >
                <User className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                style={{ 
                  backgroundColor: activeTab === 'security' ? '#FF6E40' : 'transparent',
                  color: activeTab === 'security' ? 'white' : '#1E3D59'
                }}
              >
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                style={{ 
                  backgroundColor: activeTab === 'preferences' ? '#FFC13B' : 'transparent',
                  color: activeTab === 'preferences' ? 'white' : '#1E3D59'
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="data-[state=active]:text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                style={{ 
                  backgroundColor: activeTab === 'activity' ? '#1E3D59' : 'transparent',
                  color: activeTab === 'activity' ? 'white' : '#1E3D59'
                }}
              >
                <Activity className="w-4 h-4 mr-2" />
                Activity
              </TabsTrigger>
            </TabsList>

          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className="space-y-8 mt-8">
            {/* Enhanced Avatar Upload Section */}
            <div className="relative overflow-hidden">
              <Card className="relative bg-white shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center" style={{ color: '#1E3D59' }}>
                    <Camera className="w-6 h-6 mr-3" style={{ color: '#1E3D59' }} />
                    Profile Picture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-8">
                    <div className="relative group">
                      <Avatar className="relative w-24 h-24 shadow-xl">
                        <AvatarImage src={profile.avatar} className="object-cover" />
                        <AvatarFallback className="text-xl font-bold text-white" style={{ backgroundColor: '#1E3D59' }}>
                          {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF6E40' }}>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
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
            </div>

            {/* Enhanced Personal Information Section */}
            <div className="relative overflow-hidden">
              <Card className="relative bg-white shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center" style={{ color: '#1E3D59' }}>
                    <User className="w-6 h-6 mr-3" style={{ color: '#1E3D59' }} />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-semibold" style={{ color: '#1E3D59' }}>First Name</Label>
                        <Input
                          id="firstName"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          className="rounded-xl transition-colors duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Last Name</Label>
                        <Input
                          id="lastName"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          className="rounded-xl transition-colors duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Phone Number</Label>
                        <Input
                          id="phone"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="rounded-xl transition-colors duration-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Department</Label>
                        <Input
                          id="department"
                          value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          className="rounded-xl transition-colors duration-300"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="location" className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Location</Label>
                        <Input
                          id="location"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          className="rounded-xl transition-colors duration-300"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="bio" className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Bio</Label>
                        <Textarea
                          id="bio"
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          rows={3}
                          className="rounded-xl transition-colors duration-300"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="p-4 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}>
                          <Label className="text-sm font-semibold mb-2 block" style={{ color: '#1E3D59' }}>Full Name</Label>
                          <p className="text-lg font-semibold" style={{ color: '#1E3D59' }}>{profile.firstName} {profile.lastName}</p>
                        </div>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}>
                          <Label className="text-sm font-semibold mb-2 block" style={{ color: '#1E3D59' }}>Email</Label>
                          <p className="text-lg font-semibold" style={{ color: '#1E3D59' }}>{profile.email}</p>
                        </div>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}>
                          <Label className="text-sm font-semibold mb-2 block" style={{ color: '#1E3D59' }}>Phone</Label>
                          <p className="text-lg font-semibold" style={{ color: '#1E3D59' }}>{profile.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="p-4 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}>
                          <Label className="text-sm font-semibold mb-2 block" style={{ color: '#1E3D59' }}>Department</Label>
                          <p className="text-lg font-semibold" style={{ color: '#1E3D59' }}>{profile.department}</p>
                        </div>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}>
                          <Label className="text-sm font-semibold mb-2 block" style={{ color: '#1E3D59' }}>Location</Label>
                          <p className="text-lg font-semibold" style={{ color: '#1E3D59' }}>{profile.location}</p>
                        </div>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}>
                          <Label className="text-sm font-semibold mb-2 block" style={{ color: '#1E3D59' }}>Role</Label>
                          <Badge className="text-white px-4 py-2 text-sm font-semibold" style={{ backgroundColor: '#1E3D59' }}>
                            {profile.role.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {isEditing && (
                    <div className="flex justify-end space-x-4 pt-6" style={{ borderTopColor: '#F5F0E1' }}>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                        style={{ color: '#1E3D59' }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        <span className="font-semibold">Cancel</span>
                      </Button>
                      <Button 
                        onClick={handleSaveProfile}
                        className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        style={{ backgroundColor: '#FF6E40' }}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        <span className="font-semibold">Save Changes</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Security Tab */}
          <TabsContent value="security" className="space-y-8 mt-8">
            <div className="relative overflow-hidden">
              <Card className="relative bg-white shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center" style={{ color: '#1E3D59' }}>
                    <Shield className="w-6 h-6 mr-3" style={{ color: '#FF6E40' }} />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                {/* Enhanced Password Change */}
                <div className="p-6 rounded-2xl" style={{ backgroundColor: '#F5F0E1' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                        <Key className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: '#1E3D59' }}>Password Security</h3>
                        <p className="text-sm" style={{ color: '#1E3D59' }}>Last changed: {formatDate(profile.security.lastPasswordChange)}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsChangingPassword(!isChangingPassword)}
                      className="px-6 py-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105"
                      style={{ borderColor: '#1E3D59', color: '#1E3D59' }}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      <span className="font-semibold">Change Password</span>
                    </Button>
                  </div>
                  
                  {isChangingPassword && (
                    <div className="space-y-6 p-6 bg-white rounded-xl shadow-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Current Password</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showPassword ? 'text' : 'password'}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                              className="rounded-xl transition-colors duration-300 pr-12"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-lg"
                              style={{ backgroundColor: '#F5F0E1' }}
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-sm font-semibold" style={{ color: '#1E3D59' }}>New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              className="rounded-xl transition-colors duration-300"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold" style={{ color: '#1E3D59' }}>Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="rounded-xl transition-colors duration-300"
                        />
                      </div>
                      <div className="flex justify-end space-x-4 pt-4" style={{ borderTopColor: '#F5F0E1' }}>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsChangingPassword(false)}
                          className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                          style={{ color: '#1E3D59' }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          <span className="font-semibold">Cancel</span>
                        </Button>
                        <Button 
                          onClick={handleChangePassword}
                          className="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          style={{ backgroundColor: '#FF6E40' }}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          <span className="font-semibold">Update Password</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Two-Factor Authentication */}
                <div className="p-6 rounded-2xl" style={{ backgroundColor: '#F5F0E1' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFC13B' }}>
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: '#1E3D59' }}>Two-Factor Authentication</h3>
                        <p className="text-sm" style={{ color: '#1E3D59' }}>Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-semibold ${profile.security.twoFactorEnabled ? 'text-green-600' : ''}`} style={{ color: profile.security.twoFactorEnabled ? '#FF6E40' : '#1E3D59' }}>
                        {profile.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <Switch
                        checked={profile.security.twoFactorEnabled}
                        onCheckedChange={(checked) => {
                          // In a real app, this would trigger 2FA setup
                          sonnerToast.info('2FA setup would be implemented here')
                        }}
                        style={{ 
                          backgroundColor: profile.security.twoFactorEnabled ? '#FFC13B' : '#F5F0E1'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Enhanced Login History */}
                <div className="p-6 rounded-2xl" style={{ backgroundColor: '#F5F0E1' }}>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: '#1E3D59' }}>Recent Login History</h3>
                      <p className="text-sm" style={{ color: '#1E3D59' }}>Monitor your account access and security</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {profile.security.loginHistory.map((login, index) => (
                      <div key={login.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: '#1E3D59' }}>{login.device}</p>
                            <p className="text-xs flex items-center" style={{ color: '#1E3D59' }}>
                              <MapPin className="w-3 h-3 mr-1" />
                              {login.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold" style={{ color: '#1E3D59' }}>{formatDate(login.timestamp)}</p>
                          <p className="text-xs flex items-center" style={{ color: '#1E3D59' }}>
                            <Globe className="w-3 h-3 mr-1" />
                            {login.ipAddress}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* Enhanced Preferences Tab */}
          <TabsContent value="preferences" className="space-y-8 mt-8">
            {/* Notification Preferences */}
            <div className="relative overflow-hidden">
              <Card className="relative bg-white shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center" style={{ color: '#1E3D59' }}>
                    <Bell className="w-6 h-6 mr-3" style={{ color: '#FFC13B' }} />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                            <Mail className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold" style={{ color: '#1E3D59' }}>Email Notifications</h3>
                            <p className="text-sm" style={{ color: '#1E3D59' }}>Receive notifications via email</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.notifications.email}
                          onCheckedChange={(checked) => setPreferences({
                            ...preferences,
                            notifications: { ...preferences.notifications, email: checked }
                          })}
                          style={{ 
                            backgroundColor: preferences.notifications.email ? '#1E3D59' : '#F5F0E1'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
                            <Bell className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold" style={{ color: '#1E3D59' }}>Push Notifications</h3>
                            <p className="text-sm" style={{ color: '#1E3D59' }}>Receive push notifications in browser</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.notifications.push}
                          onCheckedChange={(checked) => setPreferences({
                            ...preferences,
                            notifications: { ...preferences.notifications, push: checked }
                          })}
                          style={{ 
                            backgroundColor: preferences.notifications.push ? '#FF6E40' : '#F5F0E1'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFC13B' }}>
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold" style={{ color: '#1E3D59' }}>SMS Notifications</h3>
                            <p className="text-sm" style={{ color: '#1E3D59' }}>Receive notifications via SMS</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.notifications.sms}
                          onCheckedChange={(checked) => setPreferences({
                            ...preferences,
                            notifications: { ...preferences.notifications, sms: checked }
                          })}
                          style={{ 
                            backgroundColor: preferences.notifications.sms ? '#FFC13B' : '#F5F0E1'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Privacy Settings */}
            <div className="relative overflow-hidden">
              <Card className="relative bg-white shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center" style={{ color: '#1E3D59' }}>
                    <Lock className="w-6 h-6 mr-3" style={{ color: '#1E3D59' }} />
                    Privacy Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                            <Mail className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold" style={{ color: '#1E3D59' }}>Show Email</h3>
                            <p className="text-sm" style={{ color: '#1E3D59' }}>Make email visible to other users</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.privacy.showEmail}
                          onCheckedChange={(checked) => setPreferences({
                            ...preferences,
                            privacy: { ...preferences.privacy, showEmail: checked }
                          })}
                          style={{ 
                            backgroundColor: preferences.privacy.showEmail ? '#1E3D59' : '#F5F0E1'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
                            <Phone className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold" style={{ color: '#1E3D59' }}>Show Phone</h3>
                            <p className="text-sm" style={{ color: '#1E3D59' }}>Make phone number visible to other users</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.privacy.showPhone}
                          onCheckedChange={(checked) => setPreferences({
                            ...preferences,
                            privacy: { ...preferences.privacy, showPhone: checked }
                          })}
                          style={{ 
                            backgroundColor: preferences.privacy.showPhone ? '#FF6E40' : '#F5F0E1'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl" style={{ backgroundColor: '#F5F0E1' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFC13B' }}>
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold" style={{ color: '#1E3D59' }}>Show Location</h3>
                            <p className="text-sm" style={{ color: '#1E3D59' }}>Make location visible to other users</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.privacy.showLocation}
                          onCheckedChange={(checked) => setPreferences({
                            ...preferences,
                            privacy: { ...preferences.privacy, showLocation: checked }
                          })}
                          style={{ 
                            backgroundColor: preferences.privacy.showLocation ? '#FFC13B' : '#F5F0E1'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSavePreferences}
                className="px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: '#1E3D59' }}
              >
                <Save className="w-5 h-5 mr-3" />
                <span className="font-semibold text-lg">Save Preferences</span>
              </Button>
            </div>
          </TabsContent>

          {/* Enhanced Activity Tab */}
          <TabsContent value="activity" className="space-y-8 mt-8">
            <div className="relative overflow-hidden">
              <Card className="relative bg-white shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center" style={{ color: '#1E3D59' }}>
                    <Activity className="w-6 h-6 mr-3" style={{ color: '#FF6E40' }} />
                    Recent Activity
                    <div className="ml-auto flex items-center space-x-2 px-3 py-1 rounded-full" style={{ backgroundColor: '#F5F0E1' }}>
                      <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                      <span className="text-sm font-medium text-green-600">Live Updates</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile.activity && profile.activity.length > 0 ? (
                      profile.activity.map((activity, index) => (
                        <div key={activity.id} className="group relative">
                          <div className="relative flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform group-hover:scale-[1.02]">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
                                {getActivityIcon(activity.type)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-lg font-semibold" style={{ color: '#1E3D59' }}>{activity.title}</p>
                                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#F5F0E1', color: '#1E3D59' }}>
                                  {formatDate(activity.timestamp)}
                                </span>
                              </div>
                              <p className="leading-relaxed" style={{ color: '#1E3D59' }}>{activity.description}</p>
                              <div className="mt-3 flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <div className={`w-2 h-2 rounded-full ${
                                    activity.type === 'success' ? 'bg-green-500' :
                                    activity.type === 'warning' ? 'bg-yellow-500' :
                                    activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                  }`}></div>
                                  <span className="text-xs font-medium capitalize" style={{ color: '#1E3D59' }}>{activity.type}</span>
                                </div>
                                <div className="flex items-center space-x-1" style={{ color: '#1E3D59' }}>
                                  <Clock className="w-3 h-3" />
                                  <span className="text-xs">{new Date(activity.timestamp).toLocaleTimeString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#F5F0E1' }}>
                          <Activity className="w-12 h-12" style={{ color: '#FF6E40' }} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3" style={{ color: '#1E3D59' }}>No Recent Activity</h3>
                        <p className="text-lg mb-6" style={{ color: '#1E3D59' }}>Your recent actions will appear here in real-time.</p>
                        <div className="flex items-center justify-center space-x-2 text-sm">
                          <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                          <span className="text-green-600">Live monitoring enabled</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </AdminLayout>
  )
}