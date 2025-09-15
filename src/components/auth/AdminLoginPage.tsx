'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminLoginForm } from './AdminLoginForm'
import { ArrowLeft, Shield, Crown } from 'lucide-react'

type AdminRole = 'admin' | 'super-admin'

export function AdminLoginPage() {
  const [selectedRole, setSelectedRole] = useState<AdminRole>('admin')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">iS</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600">Sign in to access administrative functions</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-gray-900">Administrator Login</CardTitle>
            
            {/* Role Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1 mt-4">
              <button
                onClick={() => setSelectedRole('admin')}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedRole === 'admin'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </button>
              <button
                onClick={() => setSelectedRole('super-admin')}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedRole === 'super-admin'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Crown className="w-4 h-4 mr-2" />
                Super Admin
              </button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <AdminLoginForm selectedRole={selectedRole} />
            
            {/* Links */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <Link 
                  href="/login" 
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login Options
                </Link>
              </div>
              
              <div className="text-center">
                <Link 
                  href="/login/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Secure administrative access • iSpaan App
          </p>
        </div>
      </div>
    </div>
  )
}

