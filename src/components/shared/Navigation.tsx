'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export function Navigation() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">iS</span>
              </div>
              <span className="text-xl font-bold text-gray-900">iSpaan</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Development Tools */}
            <Link href="/mobile-emulator" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              📱 Mobile Test
            </Link>
            <Link href="/onboarding" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              🎯 Take a Tour
            </Link>
            
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, {user.displayName || user.email}
                </span>
                <Button variant="outline" onClick={logout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/apply">
                  <Button>Apply Now</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

