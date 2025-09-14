'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, X } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore'
import { toast } from '@/lib/toast'
import { SUPER_ADMIN_PERMISSIONS, ADMIN_PERMISSIONS } from '@/lib/permissions'

const userSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['applicant', 'learner', 'admin', 'super-admin']),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  permissions: z.array(z.string()).optional()
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
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
    department?: string
    position?: string
  }
  permissions?: string[]
}

interface UserFormProps {
  user?: User | null
  onClose: () => void
  onSave: () => void
}

export function UserForm({ user, onClose, onSave }: UserFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

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
      permissions: user?.permissions || []
    }
  })

  const selectedRole = watch('role')

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
        position: user.profile?.position || ''
      })
      setSelectedPermissions(user.permissions || [])
    } else {
      reset({
        email: '',
        firstName: '',
        lastName: '',
        role: 'applicant',
        status: 'pending',
        phone: '',
        department: '',
        position: ''
      })
      setSelectedPermissions([])
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

      const userData = {
        email: data.email,
        displayName: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        status: data.status,
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

      if (user) {
        // Update existing user
        await updateDoc(doc(db, 'users', user.id), userData)
        toast.success("User updated successfully")
      } else {
        // Create new user
        (userData as any).createdAt = new Date().toISOString()
        await addDoc(collection(db, 'users'), userData)
        toast.success("User created successfully")
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error("Failed to save user")
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
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-3">
          <h3 className="text-base font-medium text-gray-900">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
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

            <div className="space-y-1">
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

          <div className="space-y-1">
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
        </div>

        {/* Role and Status */}
        <div className="space-y-3">
          <h3 className="text-base font-medium text-gray-900">Role & Status</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
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

            <div className="space-y-1">
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
        </div>

        {/* Profile Information */}
        <div className="space-y-3">
          <h3 className="text-base font-medium text-gray-900">Profile Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-sm">Phone Number</Label>
              <Input
                id="phone"
                {...register('phone')}
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="department" className="text-sm">Department</Label>
              <Input
                id="department"
                {...register('department')}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="position" className="text-sm">Position</Label>
            <Input
              id="position"
              {...register('position')}
              className="h-9"
            />
          </div>
        </div>

        {/* Permissions */}
        {(selectedRole === 'admin' || selectedRole === 'super-admin') && (
          <div className="space-y-3">
            <h3 className="text-base font-medium text-gray-900">Permissions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-3 bg-gray-50">
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
    </div>
  )
}
