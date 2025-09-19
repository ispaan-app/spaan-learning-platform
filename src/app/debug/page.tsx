'use client'

import React from 'react'

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Debug Page - Style Testing
        </h1>
        
        {/* Test Basic Tailwind Classes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Basic Tailwind Classes Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-blue-800 font-medium">Blue Background</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-green-800 font-medium">Green Background</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <p className="text-red-800 font-medium">Red Background</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <p className="text-yellow-800 font-medium">Yellow Background</p>
            </div>
          </div>
        </div>

        {/* Test Custom CSS Variables */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Custom CSS Variables Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-coral p-4 rounded-lg">
              <p className="text-white font-medium">Coral Background (Custom)</p>
            </div>
            <div className="bg-gold p-4 rounded-lg">
              <p className="text-dark-blue font-medium">Gold Background (Custom)</p>
            </div>
            <div className="bg-dark-blue p-4 rounded-lg">
              <p className="text-cream font-medium">Dark Blue Background (Custom)</p>
            </div>
            <div className="bg-cream p-4 rounded-lg border-2 border-coral">
              <p className="text-dark-blue font-medium">Cream Background with Coral Border</p>
            </div>
          </div>
        </div>

        {/* Test Gradients */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Gradient Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-coral p-4 rounded-lg">
              <p className="text-white font-medium">Coral to Gold Gradient</p>
            </div>
            <div className="bg-gradient-warm p-4 rounded-lg">
              <p className="text-dark-blue font-medium">Warm Gradient</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
              <p className="text-white font-medium">Standard Tailwind Gradient</p>
            </div>
            <div className="bg-gradient-to-br from-pink-400 to-orange-400 p-4 rounded-lg">
              <p className="text-white font-medium">Another Standard Gradient</p>
            </div>
          </div>
        </div>

        {/* Test Shadows */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Shadow Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-coral">
              <p className="text-gray-800 font-medium">Coral Shadow</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-gold">
              <p className="text-gray-800 font-medium">Gold Shadow</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-dark-blue">
              <p className="text-gray-800 font-medium">Dark Blue Shadow</p>
            </div>
          </div>
        </div>

        {/* Test Hover Effects */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Hover Effects Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-coral text-white px-6 py-3 rounded-lg hover:bg-gold hover:text-dark-blue transition-all duration-300 transform hover:scale-105">
              Hover Me (Coral to Gold)
            </button>
            <button className="bg-gold text-dark-blue px-6 py-3 rounded-lg hover:bg-coral hover:text-white transition-all duration-300 transform hover:scale-105">
              Hover Me (Gold to Coral)
            </button>
          </div>
        </div>

        {/* Test Animations */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Animation Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-coral p-4 rounded-lg animate-pulse">
              <p className="text-white font-medium">Pulse Animation</p>
            </div>
            <div className="bg-gold p-4 rounded-lg animate-bounce">
              <p className="text-dark-blue font-medium">Bounce Animation</p>
            </div>
            <div className="bg-dark-blue p-4 rounded-lg animate-spin">
              <p className="text-cream font-medium">Spin Animation</p>
            </div>
          </div>
        </div>

        {/* CSS Variables Display */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">CSS Variables Status</h2>
          <div className="space-y-2 text-sm font-mono">
            <p>--background: {typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--background') : 'Loading...'}</p>
            <p>--foreground: {typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--foreground') : 'Loading...'}</p>
            <p>--coral: {typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--coral') : 'Loading...'}</p>
            <p>--gold: {typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--gold') : 'Loading...'}</p>
            <p>--dark-blue: {typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--dark-blue') : 'Loading...'}</p>
            <p>--cream: {typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--cream') : 'Loading...'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}