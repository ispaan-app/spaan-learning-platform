'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

interface FirebaseSetupGuideProps {
  children: React.ReactNode
}

export function FirebaseSetupGuide({ children }: FirebaseSetupGuideProps) {
  const [showSetup, setShowSetup] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setAuthError(null)
        setShowSetup(false)
        if (user) {
          console.log('✅ Firebase Auth: User authenticated')
        }
      },
      (error: any) => {
        console.error('❌ Firebase Auth Error:', error)
        
        if (error.code === 'auth/network-request-failed') {
          setAuthError('Firebase network request failed')
          setShowSetup(true)
        }
      }
    )

    return () => unsubscribe()
  }, [])

  if (showSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="text-8xl mb-6">🔧</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Firebase Authentication Setup Required
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your Firebase project needs to be configured to allow authentication from localhost.
            </p>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 mb-8">
              <h2 className="text-xl font-semibold text-blue-900 mb-6">
                Follow these steps to fix the login issue:
              </h2>
              <div className="text-left space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                  <div>
                    <p className="font-semibold text-blue-900">Open Firebase Console</p>
                    <p className="text-blue-700">Go to: <a href="https://console.firebase.google.com/project/ispaan-app" target="_blank" rel="noopener noreferrer" className="underline font-semibold">https://console.firebase.google.com/project/ispaan-app</a></p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                  <div>
                    <p className="font-semibold text-blue-900">Navigate to Authentication Settings</p>
                    <p className="text-blue-700">Click "Authentication" → "Settings" → "Authorized domains"</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="font-semibold text-blue-900">Add These Domains</p>
                    <div className="bg-white rounded-lg p-4 mt-2">
                      <ul className="space-y-2 text-blue-800">
                        <li>• localhost</li>
                        <li>• 127.0.0.1</li>
                        <li>• localhost:3000</li>
                        <li>• localhost:3001</li>
                        <li>• localhost:3002</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</div>
                  <div>
                    <p className="font-semibold text-blue-900">Save and Test</p>
                    <p className="text-blue-700">Click "Save" and then refresh this page</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Refresh Page After Setup
              </button>
              <button
                onClick={() => setShowSetup(false)}
                className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Continue Anyway (May Not Work)
              </button>
            </div>
            
            <div className="mt-6 text-sm text-gray-500">
              <p>This setup is required for Firebase authentication to work with localhost during development.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
