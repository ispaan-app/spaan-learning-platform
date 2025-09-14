'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Edit, 
  Trash2, 
  Eye, 
  UserCheck, 
  UserX,
  MoreHorizontal,
  Loader2,
  Key
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { resetUserPassword } from '../../app/super-admin/users/user-actions'
import { resetUserPasswordFallback } from '../../app/super-admin/users/user-actions-fallback'
import { PasswordDisplayModal } from './PasswordDisplayModal'
import { useToast } from '@/hooks/use-toast'

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
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
    department?: string
    position?: string
  }
  permissions?: string[]
}

interface UserManagementTableProps {
  users: User[]
  loading: boolean
  selectedUsers: string[]
  onSelectionChange?: (selected: string[]) => void
  onEditUser?: (user: User) => void
  onToggleStatus?: (userId: string, currentStatus: string) => void
  onDeleteUser?: (userId: string) => void
}

export function UserManagementTable({
  users,
  loading,
  selectedUsers,
  onSelectionChange,
  onEditUser,
  onToggleStatus,
  onDeleteUser
}: UserManagementTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [resetPassword, setResetPassword] = useState<{userId: string, email: string, password: string} | null>(null)
  const toast = useToast()

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'default'
      case 'admin':
        return 'secondary'
      case 'learner':
        return 'outline'
      case 'applicant':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusBadgeVariant = (status: string | undefined) => {
    const safeStatus = status || 'pending'
    switch (safeStatus) {
      case 'active':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'inactive':
        return 'destructive'
      case 'suspended':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(users.map(user => user.id))
    } else {
      onSelectionChange?.([])
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedUsers, userId])
    } else {
      onSelectionChange?.(selectedUsers.filter(id => id !== userId))
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: string | undefined) => {
    setActionLoading(userId)
    try {
      await onToggleStatus?.(userId, currentStatus || 'pending')
    } finally {
      setActionLoading(null)
    }
  }

  const handleResetPassword = async (userId: string, userEmail: string) => {
    setActionLoading(userId)
    try {
      // Use fallback method since Firebase Admin SDK is not configured
      console.log('Resetting password with fallback method...')
      const result = await resetUserPasswordFallback(userId)
      
      if (result.success && result.password) {
        setResetPassword({
          userId,
          email: userEmail,
          password: result.password
        })
        setShowPasswordModal(true)
        toast.success('Password reset successfully!')
      } else {
        toast.error(result.error || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error('An unexpected error occurred while resetting password')
    } finally {
      setActionLoading(null)
    }
  }

  const getUserDisplayName = (user: User) => {
    if (user.displayName) return user.displayName
    if (user.profile?.firstName && user.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.email
  }

  const getUserInitials = (user: User) => {
    const name = getUserDisplayName(user)
    if (name === user.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'N/A'
    }
  }

  const allSelected = users.length > 0 && selectedUsers.length === users.length
  const someSelected = selectedUsers.length > 0 && selectedUsers.length < users.length

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-900">All Users</CardTitle>
        <CardDescription>
          Manage user accounts, roles, and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => {
                      if (el && el instanceof HTMLInputElement) el.indeterminate = someSelected
                    }}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Last Login</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Join Date</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-medium">
                            {getUserInitials(user)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{getUserDisplayName(user)}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {(user.status || 'pending').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onEditUser && onEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditUser && onEditUser(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleResetPassword(user.id, user.email)}
                              disabled={actionLoading === user.id}
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Key className="mr-2 h-4 w-4" />
                              )}
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleStatus(user.id, user.status)}
                              disabled={actionLoading === user.id}
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (user.status || 'pending') === 'active' ? (
                                <UserX className="mr-2 h-4 w-4" />
                              ) : (
                                <UserCheck className="mr-2 h-4 w-4" />
                              )}
                              {(user.status || 'pending') === 'active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDeleteUser && onDeleteUser(user.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Password Reset Modal */}
      {showPasswordModal && resetPassword && (
        <PasswordDisplayModal
          password={resetPassword.password}
          userEmail={resetPassword.email}
          isCustomPassword={false}
          isPasswordReset={true}
          title="Password Reset Successfully!"
          description="The user password has been reset. Here are the new credentials:"
          onClose={() => {
            setShowPasswordModal(false)
            setResetPassword(null)
          }}
          onResetPassword={async () => {
            // Generate a new password for the user
            try {
              const result = await resetUserPasswordFallback(resetPassword.userId)
              if (result.success && result.password) {
                setResetPassword(prev => prev ? { ...prev, password: result.password! } : null)
                toast.success('New password generated successfully!')
              } else {
                toast.error(result.error || 'Failed to generate new password')
              }
            } catch (error) {
              console.error('Error generating new password:', error)
              toast.error('Failed to generate new password')
            }
          }}
        />
      )}
    </Card>
  )
}
