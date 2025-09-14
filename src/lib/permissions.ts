// Permission management utilities for role-based access control

export interface UserPermissions {
  [key: string]: boolean
}

export interface User {
  uid: string
  email: string
  role: 'applicant' | 'learner' | 'admin' | 'super-admin'
  permissions?: string[]
  displayName?: string
  profile?: {
    firstName?: string
    lastName?: string
  }
}

// Define permission categories
export const PERMISSION_CATEGORIES = {
  USERS: 'users',
  APPLICATIONS: 'applications',
  PLACEMENTS: 'placements',
  ATTENDANCE: 'attendance',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',
  STIPEND: 'stipend',
  ISSUES: 'issues',
  LEAVE: 'leave',
  SYSTEM: 'system'
} as const

// Define permission actions
export const PERMISSION_ACTIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  MANAGE: 'manage'
} as const

// Super admin permissions (full access)
export const SUPER_ADMIN_PERMISSIONS = [
  'users:read',
  'users:write',
  'users:delete',
  'applications:read',
  'applications:write',
  'applications:delete',
  'placements:read',
  'placements:write',
  'placements:delete',
  'attendance:read',
  'attendance:write',
  'reports:read',
  'reports:write',
  'settings:read',
  'settings:write',
  'notifications:read',
  'notifications:write',
  'stipend:read',
  'stipend:write',
  'issues:read',
  'issues:write',
  'leave:read',
  'leave:write',
  'system:manage'
]

// Admin permissions (limited access)
export const ADMIN_PERMISSIONS = [
  'users:read',
  'applications:read',
  'applications:write',
  'placements:read',
  'placements:write',
  'attendance:read',
  'attendance:write',
  'reports:read',
  'notifications:read',
  'issues:read',
  'issues:write',
  'leave:read',
  'leave:write'
]

// Get user permissions from localStorage or user object
export function getUserPermissions(user?: User): string[] {
  try {
    // First check localStorage
    const storedPermissions = localStorage.getItem('userPermissions')
    if (storedPermissions) {
      return JSON.parse(storedPermissions)
    }

    // Then check user object
    if (user?.permissions) {
      return user.permissions
    }

    // Fallback to role-based permissions
    const userRole = user?.role || localStorage.getItem('userRole')
    return getRolePermissions(userRole as string)
  } catch (error) {
    console.error('Error getting user permissions:', error)
    return []
  }
}

// Get permissions based on role
export function getRolePermissions(role: string): string[] {
  switch (role) {
    case 'super-admin':
      return SUPER_ADMIN_PERMISSIONS
    case 'admin':
      return ADMIN_PERMISSIONS
    case 'learner':
      return ['attendance:read', 'reports:read']
    case 'applicant':
      return ['applications:read']
    default:
      return []
  }
}

// Check if user has specific permission
export function hasPermission(
  permission: string,
  user?: User
): boolean {
  const userPermissions = getUserPermissions(user)
  return userPermissions.includes(permission)
}

// Check if user has any of the specified permissions
export function hasAnyPermission(
  permissions: string[],
  user?: User
): boolean {
  const userPermissions = getUserPermissions(user)
  return permissions.some(permission => userPermissions.includes(permission))
}

// Check if user has all of the specified permissions
export function hasAllPermissions(
  permissions: string[],
  user?: User
): boolean {
  const userPermissions = getUserPermissions(user)
  return permissions.every(permission => userPermissions.includes(permission))
}

// Check if user can perform action on resource
export function canPerformAction(
  resource: string,
  action: string,
  user?: User
): boolean {
  const permission = `${resource}:${action}`
  return hasPermission(permission, user)
}

// Check if user is super admin
export function isSuperAdmin(user?: User): boolean {
  const userRole = user?.role || localStorage.getItem('userRole')
  return userRole === 'super-admin'
}

// Check if user is admin or super admin
export function isAdmin(user?: User): boolean {
  const userRole = user?.role || localStorage.getItem('userRole')
  return userRole === 'admin' || userRole === 'super-admin'
}

// Get user display name
export function getUserDisplayName(user?: User): string {
  if (user?.displayName) {
    return user.displayName
  }

  if (user?.profile?.firstName && user?.profile?.lastName) {
    return `${user.profile.firstName} ${user.profile.lastName}`
  }

  const storedName = localStorage.getItem('userName')
  if (storedName) {
    return storedName
  }

  return user?.email || 'User'
}

// Get user role with fallback
export function getUserRole(user?: User): string {
  return user?.role || localStorage.getItem('userRole') || 'learner'
}

// Clear user session data
export function clearUserSession(): void {
  localStorage.removeItem('userRole')
  localStorage.removeItem('userName')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('userId')
  localStorage.removeItem('userPermissions')
}

// Permission checking hooks for React components
export function usePermissions(user?: User) {
  return {
    hasPermission: (permission: string) => hasPermission(permission, user),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(permissions, user),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(permissions, user),
    canPerformAction: (resource: string, action: string) => canPerformAction(resource, action, user),
    isSuperAdmin: () => isSuperAdmin(user),
    isAdmin: () => isAdmin(user),
    permissions: getUserPermissions(user),
    userRole: getUserRole(user),
    displayName: getUserDisplayName(user)
  }
}

// Route protection helpers
export function requirePermission(permission: string) {
  return (user?: User) => hasPermission(permission, user)
}

export function requireAnyPermission(permissions: string[]) {
  return (user?: User) => hasAnyPermission(permissions, user)
}

export function requireRole(role: string) {
  return (user?: User) => getUserRole(user) === role
}

export function requireSuperAdmin() {
  return (user?: User) => isSuperAdmin(user)
}

export function requireAdmin() {
  return (user?: User) => isAdmin(user)
}


