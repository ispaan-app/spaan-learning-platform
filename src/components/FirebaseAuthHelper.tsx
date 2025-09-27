'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

interface FirebaseAuthHelperProps {
  children: React.ReactNode
}

export function FirebaseAuthHelper({ children }: FirebaseAuthHelperProps) {
  const [authError, setAuthError] = useState<string | null>(null)
  const [showSolution, setShowSolution] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setAuthError(null)
        if (user) {
          console.log('✅ Firebase Auth: User authenticated')
        }
      },
      (error: any) => {
        console.error('❌ Firebase Auth Error:', error)
        
        if (error.code === 'auth/network-request-failed') {
          setAuthError('Firebase network request failed')
          setShowSolution(true)
        } else {
          setAuthError(error.message)
        }
      }
    )

    return () => unsubscribe()
  }, [])

  if (showSolution) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="max-w-2xl bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🔧</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Firebase Authentication Setup Required
            </h1>
            <p className="text-gray-600 mb-6">
              Your Firebase project needs to be configured to allow authentication from localhost.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                Follow these steps to fix:
              </h2>
              <ol className="text-left text-blue-800 space-y-2">
                <li>1. Go to <a href="https://console.firebase.google.com/project/ispaan-app" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Firebase Console</a></li>
                <li>2. Navigate to <strong>Authentication → Settings → Authorized domains</strong></li>
                <li>3. Add these domains:</li>
                <ul className="ml-4 mt-2 space-y-1">
                  <li>• localhost</li>
                  <li>• 127.0.0.1</li>
                  <li>• localhost:3000</li>
                  <li>• localhost:3001</li>
                  <li>• localhost:3002</li>
                </ul>
                <li>4. Click <strong>Save</strong></li>
                <li>5. Refresh this page</li>
              </ol>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page After Setup
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
