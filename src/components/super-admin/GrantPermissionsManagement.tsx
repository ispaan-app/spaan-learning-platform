'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  UserPlus, 
  Shield, 
  Crown, 
  Search, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  Users,
  Building2,
  GraduationCap,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  program?: string
  department?: string
}

interface Project {
  id: string
  name: string
  description: string
}

interface Program {
  id: string
  name: string
  description: string
  projectId?: string
}

export function GrantPermissionsManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const toast = useToast()

  // Form states for different actions
  const [grantRoleForm, setGrantRoleForm] = useState({
    userEmail: '',
    newRole: 'admin'
  })

  const [createAdminForm, setCreateAdminForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'admin',
    department: '',
    assignedProject: '',
    assignedProgram: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [usersSnapshot, projectsSnapshot, programsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'programs'), orderBy('createdAt', 'desc')))
      ])

      setUsers(usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[])

      setProjects(projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[])

      setPrograms(programsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Program[])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleGrantRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!grantRoleForm.userEmail || !grantRoleForm.newRole) return

    setActionLoading('grant-role')
    try {
      // Find user by email
      const user = users.find(u => u.email.toLowerCase() === grantRoleForm.userEmail.toLowerCase())
      if (!user) {
        toast.error('User not found with that email address')
        return
      }

      // Update user role
      await updateDoc(doc(db, 'users', user.id), {
        role: grantRoleForm.newRole,
        updatedAt: new Date().toISOString()
      })

      // Log the action
      await addDoc(collection(db, 'audit-logs'), {
        action: 'ROLE_GRANTED',
        adminId: 'super-admin',
        adminName: 'Super Admin',
        targetUserId: user.id,
        targetUserEmail: user.email,
        details: {
          previousRole: user.role,
          newRole: grantRoleForm.newRole
        },
        timestamp: new Date().toISOString()
      })

      toast.success(`Successfully granted ${grantRoleForm.newRole} role to ${user.email}`)
      setGrantRoleForm({ userEmail: '', newRole: 'admin' })
      loadData()
    } catch (error) {
      console.error('Error granting role:', error)
      toast.error('Failed to grant role')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createAdminForm.firstName || !createAdminForm.lastName || !createAdminForm.email) return

    setActionLoading('create-admin')
    try {
      const userData = {
        email: createAdminForm.email,
        firstName: createAdminForm.firstName,
        lastName: createAdminForm.lastName,
        role: createAdminForm.role,
        status: 'active',
        department: createAdminForm.department,
        assignedProject: createAdminForm.assignedProject,
        assignedProgram: createAdminForm.assignedProgram,
        profile: {
          firstName: createAdminForm.firstName,
          lastName: createAdminForm.lastName,
          department: createAdminForm.department,
          position: createAdminForm.role === 'admin' ? 'Administrator' : 'Super Administrator'
        },
        permissions: createAdminForm.role === 'super-admin' 
          ? ['manage_users', 'manage_projects', 'manage_programs', 'manage_appearance', 'view_audit_logs']
          : ['manage_users', 'manage_placements', 'view_reports'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'super-admin'
      }

      const docRef = await addDoc(collection(db, 'users'), userData)

      // Log the action
      await addDoc(collection(db, 'audit-logs'), {
        action: 'ADMIN_CREATED',
        adminId: 'super-admin',
        adminName: 'Super Admin',
        targetUserId: docRef.id,
        targetUserEmail: createAdminForm.email,
        details: {
          role: createAdminForm.role,
          department: createAdminForm.department,
          assignedProject: createAdminForm.assignedProject,
          assignedProgram: createAdminForm.assignedProgram
        },
        timestamp: new Date().toISOString()
      })

      toast.success(`Successfully created ${createAdminForm.role} account for ${createAdminForm.email}`)
      setCreateAdminForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'admin',
        department: '',
        assignedProject: '',
        assignedProgram: ''
      })
      loadData()
    } catch (error) {
      console.error('Error creating admin:', error)
      toast.error('Failed to create admin account')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super-admin':
        return <Badge className="bg-purple-600">Super Admin</Badge>
      case 'admin':
        return <Badge className="bg-blue-600">Admin</Badge>
      case 'learner':
        return <Badge variant="outline">Learner</Badge>
      case 'applicant':
        return <Badge variant="secondary">Applicant</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-600">Loading permissions data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Super Admins</p>
                <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'super-admin').length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projects</p>
                <p className="text-2xl font-bold text-green-600">{projects.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="grant-role" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grant-role" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Grant Role to Existing User</span>
          </TabsTrigger>
          <TabsTrigger value="create-admin" className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Create New Admin</span>
          </TabsTrigger>
        </TabsList>

        {/* Grant Role Tab */}
        <TabsContent value="grant-role" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grant Role to Existing User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGrantRole} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userEmail">User Email</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={grantRoleForm.userEmail}
                      onChange={(e) => setGrantRoleForm(prev => ({ ...prev, userEmail: e.target.value }))}
                      placeholder="Enter user's email address"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="newRole">New Role</Label>
                    <Select 
                      value={grantRoleForm.newRole} 
                      onValueChange={(value) => setGrantRoleForm(prev => ({ ...prev, newRole: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super-admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={actionLoading === 'grant-role'}
                  className="w-full"
                >
                  {actionLoading === 'grant-role' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Granting Role...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Grant Role
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Admin Tab */}
        <TabsContent value="create-admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Admin Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={createAdminForm.firstName}
                      onChange={(e) => setCreateAdminForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={createAdminForm.lastName}
                      onChange={(e) => setCreateAdminForm(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={createAdminForm.email}
                      onChange={(e) => setCreateAdminForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={createAdminForm.password}
                      onChange={(e) => setCreateAdminForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password (optional - auto-generated if empty)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={createAdminForm.role} 
                      onValueChange={(value) => setCreateAdminForm(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super-admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={createAdminForm.department}
                      onChange={(e) => setCreateAdminForm(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Enter department"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignedProject">Assigned Project</Label>
                    <Select 
                      value={createAdminForm.assignedProject} 
                      onValueChange={(value) => setCreateAdminForm(prev => ({ ...prev, assignedProject: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={actionLoading === 'create-admin'}
                  className="w-full"
                >
                  {actionLoading === 'create-admin' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Admin...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Admin Account
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.department && (
                      <p className="text-sm text-gray-500">{user.department}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getRoleBadge(user.role)}
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found matching your search criteria.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


