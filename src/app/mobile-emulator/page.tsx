'use client'

import React, { useState } from 'react'
import { MobileEmulator, CompactMobileEmulator } from '@/components/ui/mobile-emulator'
import { ArrowLeft, ExternalLink, Smartphone, Tablet, Monitor } from 'lucide-react'
import Link from 'next/link'

export default function MobileEmulatorPage() {
  const [testUrl, setTestUrl] = useState('/')
  const [selectedDevice, setSelectedDevice] = useState('iPhone 14 Pro')

  const quickTestPages = [
    { name: 'Home', url: '/' },
    { name: 'Apply', url: '/apply' },
    { name: 'Login', url: '/login' },
    { name: 'About', url: '/about' },
    { name: 'Contact', url: '/contact' },
    { name: 'Admin', url: '/admin' },
    { name: 'Super Admin', url: '/super-admin' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Mobile Emulator</h1>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={testUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Test Pages</h3>
              <div className="space-y-2">
                {quickTestPages.map((page) => (
                  <button
                    key={page.name}
                    onClick={() => setTestUrl(page.url)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      testUrl === page.url
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page.name}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Custom URL</h4>
                <input
                  type="text"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter custom URL"
                />
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Device Presets</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedDevice('iPhone 14 Pro')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedDevice === 'iPhone 14 Pro'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>iPhone 14 Pro</span>
                  </button>
                  <button
                    onClick={() => setSelectedDevice('iPad Pro')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedDevice === 'iPad Pro'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Tablet className="w-4 h-4" />
                    <span>iPad Pro</span>
                  </button>
                  <button
                    onClick={() => setSelectedDevice('Desktop')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedDevice === 'Desktop'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Desktop</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Tips</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Use the rotate button to test landscape mode</li>
                  <li>• Try different device presets to test responsiveness</li>
                  <li>• Click "Open in New Tab" to test in real browser</li>
                  <li>• Test touch interactions and mobile-specific features</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Emulator */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <MobileEmulator 
                url={testUrl}
                defaultDevice={selectedDevice}
                showControls={true}
                className="h-[800px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
