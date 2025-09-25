'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WelcomeCard } from '@/components/ui/welcome-card'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Settings, 
  Shield, 
  Database, 
  Mail, 
  Bell, 
  Globe, 
  Lock,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'

export default function SuperAdminSettingsPage() {
  const { user, userRole } = useAuth()
  
  return (
    <AdminLayout userRole="super-admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark-blue">System Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure platform-wide settings and preferences
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button className="bg-coral hover:bg-coral/90">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Welcome Card */}
        <WelcomeCard 
          userName={user?.displayName || "Settings Admin"} 
          userRole="super-admin" 
          className="mb-6"
        />

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-coral" />
                  <span>General Settings</span>
                </CardTitle>
                <CardDescription>
                  Basic platform configuration and appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input id="siteName" defaultValue="ISPAAN Platform" />
                  </div>
                  <div>
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input id="siteUrl" defaultValue="https://ispaan.com" />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Default Timezone</Label>
                    <select 
                      id="timezone"
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent"
                    >
                      <option value="UTC-5">Eastern Time (UTC-5)</option>
                      <option value="UTC-6">Central Time (UTC-6)</option>
                      <option value="UTC-7">Mountain Time (UTC-7)</option>
                      <option value="UTC-8">Pacific Time (UTC-8)</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="language">Default Language</Label>
                    <select 
                      id="language"
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-dark-blue">Maintenance Mode</h3>
                      <p className="text-sm text-muted-foreground">
                        Enable maintenance mode to restrict access
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-dark-blue">User Registration</h3>
                      <p className="text-sm text-muted-foreground">
                        Allow new users to register
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-dark-blue">Email Verification</h3>
                      <p className="text-sm text-muted-foreground">
                        Require email verification for new accounts
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-coral" />
                  <span>Security Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure security policies and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-dark-blue">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for all admin accounts
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-dark-blue">Password Complexity</h3>
                      <p className="text-sm text-muted-foreground">
                        Enforce strong password requirements
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-dark-blue">Session Timeout</h3>
                      <p className="text-sm text-muted-foreground">
                        Auto-logout after inactivity
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input id="sessionTimeout" type="number" defaultValue="30" />
                  </div>
                  <div>
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input id="maxLoginAttempts" type="number" defaultValue="5" />
                  </div>
                  <div>
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input id="passwordMinLength" type="number" defaultValue="8" />
                  </div>
                  <div>
                    <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                    <Input id="lockoutDuration" type="number" defaultValue="15" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-coral" />
                  <span>API Security</span>
                </CardTitle>
                <CardDescription>
                  Configure API access and rate limiting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
                    <Input id="apiRateLimit" type="number" defaultValue="1000" />
                  </div>
                  <div>
                    <Label htmlFor="apiKeyExpiry">API Key Expiry (days)</Label>
                    <Input id="apiKeyExpiry" type="number" defaultValue="90" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-dark-blue">CORS Protection</h3>
                    <p className="text-sm text-muted-foreground">
                      Enable Cross-Origin Resource Sharing protection
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-coral" />
                  <span>Notification Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure system-wide notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-dark-blue">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Send email notifications for system events
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-dark-blue">Push Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Send browser push notifications
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-dark-blue">SMS Alerts</h3>
                      <p className="text-sm text-muted-foreground">
                        Send SMS for critical alerts
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input id="adminEmail" type="email" defaultValue="admin@ispaan.com" />
                  </div>
                  <div>
                    <Label htmlFor="notificationEmail">Notification Email</Label>
                    <Input id="notificationEmail" type="email" defaultValue="notifications@ispaan.com" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Settings */}
          <TabsContent value="database" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-coral" />
                  <span>Database Configuration</span>
                </CardTitle>
                <CardDescription>
                  Manage database connections and backup settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dbHost">Database Host</Label>
                    <Input id="dbHost" defaultValue="localhost" />
                  </div>
                  <div>
                    <Label htmlFor="dbPort">Database Port</Label>
                    <Input id="dbPort" type="number" defaultValue="5432" />
                  </div>
                  <div>
                    <Label htmlFor="dbName">Database Name</Label>
                    <Input id="dbName" defaultValue="ispaan_db" />
                  </div>
                  <div>
                    <Label htmlFor="dbUser">Database User</Label>
                    <Input id="dbUser" defaultValue="ispaan_user" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-dark-blue">Auto Backup</h3>
                      <p className="text-sm text-muted-foreground">
                        Enable automatic database backups
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-dark-blue">Connection Pooling</h3>
                      <p className="text-sm text-muted-foreground">
                        Enable database connection pooling
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="backupFrequency">Backup Frequency (hours)</Label>
                    <Input id="backupFrequency" type="number" defaultValue="24" />
                  </div>
                  <div>
                    <Label htmlFor="backupRetention">Backup Retention (days)</Label>
                    <Input id="backupRetention" type="number" defaultValue="30" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-coral" />
                  <span>Email Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure SMTP settings and email templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input id="smtpHost" defaultValue="smtp.gmail.com" />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input id="smtpPort" type="number" defaultValue="587" />
                  </div>
                  <div>
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input id="smtpUser" defaultValue="noreply@ispaan.com" />
                  </div>
                  <div>
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input id="smtpPassword" type="password" placeholder="••••••••" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-dark-blue">SSL/TLS Encryption</h3>
                      <p className="text-sm text-muted-foreground">
                        Use secure connection for email
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-dark-blue">Email Queue</h3>
                      <p className="text-sm text-muted-foreground">
                        Queue emails for background processing
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromName">From Name</Label>
                    <Input id="fromName" defaultValue="ISPAAN Platform" />
                  </div>
                  <div>
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input id="fromEmail" type="email" defaultValue="noreply@ispaan.com" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Status */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-coral" />
              <span>System Status</span>
            </CardTitle>
            <CardDescription>
              Current system health and configuration status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <h3 className="font-medium text-dark-blue">Database</h3>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <h3 className="font-medium text-dark-blue">Email Service</h3>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <h3 className="font-medium text-dark-blue">Backup Service</h3>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}