'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnhancedDashboardLayout } from '@/components/ui/enhanced-dashboard-layout'
import { EnhancedLearnerDashboard } from '@/components/learner/EnhancedLearnerDashboard'
import { EnhancedAdminDashboard } from '@/components/admin/EnhancedAdminDashboard'
import { EnhancedSuperAdminDashboard } from '@/components/super-admin/EnhancedSuperAdminDashboard'
import { Crown, Shield, Brain, Users, ArrowRight, Sparkles } from 'lucide-react'

export default function DashboardShowcasePage() {
  const [selectedRole, setSelectedRole] = useState<'learner' | 'admin' | 'super-admin'>('learner')

  const getRoleInfo = () => {
    switch (selectedRole) {
      case 'learner':
        return {
          title: 'Learner Dashboard',
          icon: Brain,
          color: 'from-green-600 via-emerald-600 to-teal-500',
          description: 'Track your learning progress and manage your educational journey'
        }
      case 'admin':
        return {
          title: 'Administrator Dashboard',
          icon: Shield,
          color: 'from-blue-600 via-cyan-600 to-teal-500',
          description: 'Manage learners, applications, and platform operations'
        }
      case 'super-admin':
        return {
          title: 'Super Administrator Dashboard',
          icon: Crown,
          color: 'from-purple-600 via-pink-600 to-red-500',
          description: 'Complete platform oversight and management'
        }
    }
  }

  const roleInfo = getRoleInfo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">iS</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">iSpaan</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-blue-700 font-semibold">Enhanced Dashboards</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Role Selector */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard Showcase</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the mind-blowing UI/UX improvements across all user dashboards
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            {[
              { role: 'learner' as const, label: 'Learner', icon: Brain },
              { role: 'admin' as const, label: 'Admin', icon: Shield },
              { role: 'super-admin' as const, label: 'Super Admin', icon: Crown }
            ].map(({ role, label, icon: Icon }) => (
              <Button
                key={role}
                variant={selectedRole === role ? 'default' : 'outline'}
                onClick={() => setSelectedRole(role)}
                className={`group flex items-center space-x-2 px-6 py-3 ${
                  selectedRole === role 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
                {selectedRole === role && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-25"></div>
          <Card className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <roleInfo.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">{roleInfo.title}</CardTitle>
                  <p className="text-blue-100">{roleInfo.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px] overflow-y-auto">
                <EnhancedDashboardLayout
                  userRole={selectedRole}
                  userName="Demo User"
                  userEmail="demo@example.com"
                  className="h-full"
                >
                  {selectedRole === 'learner' && <EnhancedLearnerDashboard />}
                  {selectedRole === 'admin' && <EnhancedAdminDashboard />}
                  {selectedRole === 'super-admin' && <EnhancedSuperAdminDashboard />}
                </EnhancedDashboardLayout>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>Modern Design</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Glassmorphism effects, gradient backgrounds, and smooth animations create a stunning visual experience.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-green-600" />
                <span>Role-Based Theming</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Each user role has its own unique color scheme and iconography for better visual identity.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span>Enhanced UX</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Improved navigation, better data visualization, and intuitive interactions for all users.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
