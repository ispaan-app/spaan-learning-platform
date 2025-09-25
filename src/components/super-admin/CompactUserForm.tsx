'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save, X, User, Settings, Shield, BookOpen } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, setDoc, updateDoc, collection, addDoc, getDocs } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { SUPER_ADMIN_PERMISSIONS, ADMIN_PERMISSIONS } from '@/lib/permissions'
import { createUserWithPassword, resetUserPassword } from '../../app/super-admin/users/user-actions'
import { createUserWithPasswordFallback, resetUserPasswordFallback } from '../../app/super-admin/users/user-actions-fallback'
import { PasswordDisplayModal } from './PasswordDisplayModal'

const userSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['applicant', 'learner', 'admin', 'super-admin']),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  activeProgram: z.string().optional(),
  assignedPrograms: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional()
})

type UserFormData = z.infer<typeof userSchema>

interface User {
  id: string
  uid: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
  role: 'applicant' | 'learner' | 'admin' | 'super-admin'
  status?: 'active' | 'inactive' | 'pending' | 'suspended'
  createdAt?: string
  updatedAt?: string
  lastLoginAt?: string
  activeProgram?: string
  assignedPrograms?: string[]
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
    department?: string
    position?: string
  }
  permissions?: string[]
}

interface CompactUserFormProps {
  user?: User | null | undefined
  onClose: () => void
  onSave: () => void
}

export function CompactUserForm({ user, onClose, onSave }: CompactUserFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState<string>('')
  const [createdUserId, setCreatedUserId] = useState<string>('')
  const [programs, setPrograms] = useState<Array<{ id: string; name: string; description?: string }>>([])
  const [loadingPrograms, setLoadingPrograms] = useState(false)
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])
  const programsLoaded = useRef(false)
  const toast = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email || '',
      firstName: user?.firstName || user?.profile?.firstName || '',
      lastName: user?.lastName || user?.profile?.lastName || '',
      role: user?.role || 'applicant',
      status: user?.status || 'pending',
      phone: user?.profile?.phone || '',
      department: user?.profile?.department || '',
      position: user?.profile?.position || '',
      activeProgram: user?.activeProgram || '',
      assignedPrograms: user?.assignedPrograms || [],
      permissions: user?.permissions || [],
      password: ''
    }
  })

  const selectedRole = watch('role')

  // Load programs on component mount
  useEffect(() => {
    // Prevent multiple loads
    if (programsLoaded.current || loadingPrograms) return

    const loadPrograms = async () => {
      try {
        setLoadingPrograms(true)
        programsLoaded.current = true
        console.log('Loading programs from Firestore...')
        const programsSnapshot = await getDocs(collection(db, 'programs'))
        console.log('Programs snapshot:', programsSnapshot.size, 'documents')
        
        const programsData = programsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || '',
          description: doc.data().description || ''
        }))
        
        console.log('Programs data:', programsData)
        setPrograms(programsData)
        
        // If no programs exist, show empty state
        if (programsData.length === 0) {
          console.log('No programs found in database')
          setPrograms([])
        }
      } catch (error) {
        console.error('Error loading programs:', error)
        // No fallback programs - show empty state
        setPrograms([])
      } finally {
        setLoadingPrograms(false)
      }
    }

    loadPrograms()
  }, []) // Empty dependency array - only run once on mount

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        firstName: user.firstName || user.profile?.firstName || '',
        lastName: user.lastName || user.profile?.lastName || '',
        role: user.role,
        status: user.status,
        phone: user.profile?.phone || '',
        department: user.profile?.department || '',
        position: user.profile?.position || '',
        activeProgram: user.activeProgram || '',
        assignedPrograms: user.assignedPrograms || [],
        password: ''
      })
      setSelectedPermissions(user.permissions || [])
      setSelectedPrograms(user.assignedPrograms || [])
    } else {
      reset({
        email: '',
        firstName: '',
        lastName: '',
        role: 'applicant',
        status: 'pending',
        phone: '',
        department: '',
        position: '',
        activeProgram: '',
        assignedPrograms: [],
        password: ''
      })
      setSelectedPermissions([])
      setSelectedPrograms([])
    }
  }, [user, reset])

  // Auto-set permissions based on role
  useEffect(() => {
    if (selectedRole === 'super-admin') {
      setSelectedPermissions(SUPER_ADMIN_PERMISSIONS)
    } else if (selectedRole === 'admin') {
      setSelectedPermissions(ADMIN_PERMISSIONS)
    } else {
      setSelectedPermissions([])
    }
  }, [selectedRole])

  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true)

      if (user) {
        // Update existing user (no password change)
        const userData = {
          email: data.email,
          displayName: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          status: data.status,
          activeProgram: data.activeProgram || '',
          assignedPrograms: selectedPrograms,
          permissions: selectedPermissions,
          profile: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || '',
            department: data.department || '',
            position: data.position || ''
          },
          updatedAt: new Date().toISOString()
        }

        await updateDoc(doc(db, 'users', user.id), userData)
        toast.success("User updated successfully")
        onSave()
        onClose()
      } else {
        // Create new user with password using fallback method (client-side Firebase)
        // since Firebase Admin SDK is not configured in development
        console.log('Creating user with fallback method (client-side Firebase)...')
        const result = await createUserWithPasswordFallback({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          status: data.status,
          phone: data.phone,
          department: data.department,
          position: data.position,
          activeProgram: data.activeProgram,
          assignedPrograms: selectedPrograms,
          password: data.password || undefined
        })

        if (result.success) {
          setGeneratedPassword(result.password || '')
          setCreatedUserId(result.userId || '')
          setShowPasswordModal(true)
          onSave()
          // Don't close the form yet - user needs to see the password
        } else {
          toast.error(result.error || "Failed to create user")
        }
      }
    } catch (error) {
      console.error('Error saving user:', error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save user"
      toast.error(`Failed to save user: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permission])
    } else {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permission))
    }
  }

  const handleProgramToggle = (programId: string) => {
    if (selectedPrograms.includes(programId)) {
      setSelectedPrograms(selectedPrograms.filter(id => id !== programId))
    } else {
      setSelectedPrograms([...selectedPrograms, programId])
    }
  }

  const handleSelectAllPrograms = () => {
    setSelectedPrograms(programs.map(p => p.id))
  }

  const handleClearAllPrograms = () => {
    setSelectedPrograms([])
  }

  const getAvailablePermissions = () => {
    if (selectedRole === 'super-admin') {
      return SUPER_ADMIN_PERMISSIONS
    } else if (selectedRole === 'admin') {
      return ADMIN_PERMISSIONS
    }
    return []
  }

  const availablePermissions = getAvailablePermissions()

  return (
    <div className="max-h-[75vh] overflow-hidden">
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Basic</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Profile</span>
          </TabsTrigger>
          {(selectedRole === 'admin' || selectedRole === 'super-admin') && (
            <TabsTrigger value="permissions" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Permissions</span>
            </TabsTrigger>
          )}
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TabsContent value="basic" className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm">First Name *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  className={`h-9 ${errors.firstName ? 'border-red-500' : ''}`}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  className={`h-9 ${errors.lastName ? 'border-red-500' : ''}`}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={`h-9 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {!user && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">
                  Password (Optional - Leave blank for auto-generation)
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Leave blank to auto-generate secure password"
                  className={`h-9 ${errors.password ? 'border-red-500' : ''}`}
                />
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  If left blank, a secure password will be automatically generated and displayed after user creation.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm">Role *</Label>
                <Select value={selectedRole} onValueChange={(value) => setValue('role', value as any)}>
                  <SelectTrigger className={`h-9 ${errors.role ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applicant">Applicant</SelectItem>
                    <SelectItem value="learner">Learner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super-admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-xs text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm">Status *</Label>
                <Select onValueChange={(value) => setValue('status', value as any)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm">Department</Label>
                <Input
                  id="department"
                  {...register('department')}
                  className="h-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm">Position</Label>
              <Input
                id="position"
                {...register('position')}
                className="h-9"
              />
            </div>

            {/* Program Assignments - Only for Admin and Super Admin */}
            {(selectedRole === 'admin' || selectedRole === 'super-admin') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Assigned Programs</span>
                  </Label>
                  {!loadingPrograms && programs.length > 0 && (
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllPrograms}
                        disabled={selectedPrograms.length === programs.length}
                        className="h-7 text-xs"
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearAllPrograms}
                        disabled={selectedPrograms.length === 0}
                        className="h-7 text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto border rounded-md p-3 bg-gray-50">
                  {loadingPrograms ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Loading programs...</span>
                    </div>
                  ) : programs.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-2">No programs available</p>
                      <p className="text-xs text-gray-400">Debug: loadingPrograms={loadingPrograms.toString()}, programs.length={programs.length}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs text-gray-400 mb-2">Debug: Found {programs.length} programs</div>
                      {programs.map((program) => (
                        <div key={program.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100">
                          <Checkbox
                            id={`program-${program.id}`}
                            checked={selectedPrograms.includes(program.id)}
                            onCheckedChange={() => handleProgramToggle(program.id)}
                            className="h-4 w-4"
                          />
                          <div className="flex-1 min-w-0">
                            <label 
                              htmlFor={`program-${program.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {program.name}
                            </label>
                            {program.description && (
                              <p className="text-xs text-gray-500 mt-1">{program.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedPrograms.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedPrograms.map((programId) => {
                      const program = programs.find(p => p.id === programId)
                      return program ? (
                        <div key={programId} className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          <span>{program.name}</span>
                          <button
                            type="button"
                            onClick={() => handleProgramToggle(programId)}
                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : null
                    })}
                  </div>
                )}
                
                {!loadingPrograms && programs.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Select one or more programs that this admin/super admin user can manage. Leave empty for access to all programs.
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {(selectedRole === 'admin' || selectedRole === 'super-admin') && (
            <TabsContent value="permissions" className="space-y-4">
              <div className="max-h-48 overflow-y-auto border rounded-md p-3 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={selectedPermissions.includes(permission)}
                        onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={permission} className="text-xs">
                        {permission.replace(':', ' ').replace('-', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="h-9"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 h-9"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {user ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Tabs>

      {/* Password Display Modal */}
      {showPasswordModal && (
        <PasswordDisplayModal
          password={generatedPassword}
          userEmail={watch('email')}
          isCustomPassword={!!watch('password')}
          onClose={() => {
            setShowPasswordModal(false)
            onClose()
          }}
          onResetPassword={() => {
            setShowPasswordModal(false)
            // Could implement password reset here
          }}
        />
      )}
    </div>
  )
}
