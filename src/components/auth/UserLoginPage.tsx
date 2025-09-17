'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserLoginForm } from './UserLoginForm'
import { ArrowLeft, UserPlus, Sparkles, Shield, User, Key, CheckCircle, Target, Brain, Award } from 'lucide-react'

export function UserLoginPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E1' }}>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Welcome Content */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center px-6 py-3 rounded-full mb-6 shadow-lg" style={{ backgroundColor: 'rgba(30, 61, 89, 0.1)' }}>
                  <Sparkles className="w-5 h-5 mr-2" style={{ color: '#FF6E40' }} />
                  <span className="font-semibold" style={{ color: '#1E3D59' }}>Welcome Back</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  <span className="block" style={{ color: '#1E3D59' }}>Sign in to</span>
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    iSpaan
                  </span>
                </h1>
                
                <p className="text-lg leading-relaxed mb-8" style={{ color: '#1E3D59', opacity: 0.7 }}>
                  Access your personalized learning dashboard and continue your journey
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {[
                  {
                    icon: Shield,
                    text: "Secure ID + PIN authentication"
                  },
                  {
                    icon: Target,
                    text: "Track your learning progress"
                  },
                  {
                    icon: Brain,
                    text: "AI-powered career guidance"
                  },
                  {
                    icon: Award,
                    text: "Earn certificates and badges"
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#FF6E40' }}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium group-hover:opacity-80 transition-opacity" style={{ color: '#1E3D59' }}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="relative group">
              <div className="relative rounded-2xl shadow-xl p-8 border" style={{ backgroundColor: '#F5F0E1', borderColor: 'rgba(30, 61, 89, 0.1)' }}>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: '#1E3D59' }}>
                    User Login
                  </h2>
                  <p style={{ color: '#1E3D59', opacity: 0.7 }}>Enter your ID number and PIN to access your account</p>
                </div>

                <UserLoginForm />
                
                {/* Links */}
                <div className="space-y-4 pt-6" style={{ borderTop: '1px solid rgba(30, 61, 89, 0.1)' }}>
                  <div className="text-center">
                    <Link 
                      href="/login" 
                      className="group inline-flex items-center text-sm transition-colors" style={{ color: '#1E3D59', opacity: 0.7 }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                      Back to Login Options
                    </Link>
                  </div>
                  
                  <div className="text-center">
                    <span className="text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>Don't have an account? </span>
                    <Link 
                      href="/apply" 
                      className="group inline-flex items-center text-sm font-medium transition-colors" style={{ color: '#FF6E40' }}
                    >
                      <UserPlus className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
                      Apply Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <div className="flex items-center justify-center space-x-6 text-sm" style={{ color: '#1E3D59', opacity: 0.7 }}>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FF6E40' }}></div>
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full animate-pulse delay-300" style={{ backgroundColor: '#FFC13B' }}></div>
                <span>Reliable</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full animate-pulse delay-500" style={{ backgroundColor: '#1E3D59' }}></div>
                <span>Professional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

