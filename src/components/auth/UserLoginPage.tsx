'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserLoginForm } from './UserLoginForm'
import { ArrowLeft, UserPlus } from 'lucide-react'

export function UserLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">iS</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your iSpaan account</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-gray-900">User Login</CardTitle>
            <p className="text-gray-600 text-sm">
              Enter your ID number and PIN to access your account
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <UserLoginForm />
            
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
                <span className="text-sm text-gray-600">Don't have an account? </span>
                <Link 
                  href="/apply" 
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Apply Now
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Secure login system
          </p>
        </div>
      </div>
    </div>
  )
}

