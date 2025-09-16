'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Shield, Crown, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

export function LoginSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in duration-300">
          <div className="flex items-center justify-center mb-6 animate-in zoom-in duration-200 delay-100">
            <Logo size="xl" showText={false} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 animate-in slide-in-from-bottom duration-200 delay-150">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">iSpaan</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-in slide-in-from-bottom duration-200 delay-200">
            Choose your login method to access iSpaan
          </p>
        </div>

        {/* Login Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Login */}
          <Card className="shadow-lg border-0 hover:shadow-lg transition-all duration-200 ease-out group animate-in slide-in-from-left duration-200 delay-250">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-102 transition-transform duration-200 ease-out">
                <User className="w-8 h-8 text-blue-600 group-hover:scale-102 transition-transform duration-200 ease-out" />
              </div>
              <CardTitle className="text-2xl text-gray-900 group-hover:text-blue-600 transition-colors">User Login</CardTitle>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                For learners and applicants
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center animate-in slide-in-from-left duration-200 delay-300">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>ID Number + PIN authentication</span>
                </div>
                <div className="flex items-center animate-in slide-in-from-left duration-200 delay-350">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Access to learner dashboard</span>
                </div>
                <div className="flex items-center animate-in slide-in-from-left duration-200 delay-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span>Application status tracking</span>
                </div>
              </div>
              
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 group-hover:shadow-md transition-all duration-200 ease-out">
                <Link href="/login/user" className="flex items-center justify-center">
                  Sign In as User
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform duration-200 ease-out" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Admin Login */}
          <Card className="shadow-lg border-0 hover:shadow-lg transition-all duration-200 ease-out group animate-in slide-in-from-right duration-200 delay-250">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-102 transition-transform duration-200 ease-out">
                <Shield className="w-8 h-8 text-purple-600 group-hover:scale-102 transition-transform duration-200 ease-out" />
              </div>
              <CardTitle className="text-2xl text-gray-900 group-hover:text-purple-600 transition-colors">Admin Login</CardTitle>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                For administrators and super admins
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center animate-in slide-in-from-right duration-200 delay-300">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span>Email + Password authentication</span>
                </div>
                <div className="flex items-center animate-in slide-in-from-right duration-200 delay-350">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span>Role-based access control</span>
                </div>
                <div className="flex items-center animate-in slide-in-from-right duration-200 delay-400">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span>Platform management tools</span>
                </div>
              </div>
              
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 group-hover:shadow-md transition-all duration-200 ease-out">
                <Link href="/login/admin" className="flex items-center justify-center">
                  Sign In as Admin
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform duration-200 ease-out" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Options */}
        <div className="text-center mt-12 animate-in slide-in-from-bottom duration-200 delay-450">
          <div className="space-y-4">
            <p className="text-gray-600 text-lg">New to iSpaan?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild variant="gradient" size="lg" className="group hover:shadow-md transition-all duration-200 ease-out">
                <Link href="/apply" className="flex items-center">
                  Start Your Application
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform duration-200 ease-out" />
                </Link>
              </Button>
              {/* Removed Test Login (Dev) button */}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 animate-in fade-in duration-200 delay-500">
          <p className="text-sm text-gray-500 flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Secure</span>
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Reliable</span>
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span>Professional Learning Platform</span>
          </p>
        </div>
      </div>
    </div>
  )
}

