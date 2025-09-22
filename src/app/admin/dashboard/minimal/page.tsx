'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/admin/AdminLayout'

export default function MinimalAdminDashboard() {
  const [step, setStep] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const { user, userData, loading } = useAuth()
  
  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  useEffect(() => {
    addLog('Minimal admin dashboard mounted')
  }, [])

  useEffect(() => {
    addLog(`Auth state: user=${!!user}, userData=${!!userData}, loading=${loading}`)
  }, [user, userData, loading])

  // Test each component step by step
  useEffect(() => {
    const testComponents = async () => {
      try {
        addLog(`Testing step ${step}`)
        
        switch (step) {
          case 0:
            addLog('Step 0: Basic auth check')
            break
          case 1:
            addLog('Step 1: Testing Firebase connection')
            const { db } = await import('@/lib/firebase')
            const { collection, getDocs, limit } = await import('firebase/firestore')
            const testQuery = collection(db, 'users')
            const snapshot = await getDocs(testQuery)
            addLog(`Firebase test successful: ${snapshot.size} users found`)
            break
          case 2:
            addLog('Step 2: Testing useRealtimeAdminActivity hook')
            const { useRealtimeAdminActivity } = await import('@/hooks/useRealtimeAdminActivity')
            // This might cause an error, so we'll catch it
            try {
              const activities = useRealtimeAdminActivity(5)
              addLog(`useRealtimeAdminActivity: ${activities.length} activities`)
            } catch (error) {
              addLog(`useRealtimeAdminActivity error: ${error}`)
            }
            break
          case 3:
            addLog('Step 3: Testing useRealtimeAdminNotifications hook')
            const { useRealtimeAdminNotifications } = await import('@/hooks/useRealtimeAdminNotifications')
            try {
              const notifications = useRealtimeAdminNotifications(5)
              addLog(`useRealtimeAdminNotifications: ${notifications.length} notifications`)
            } catch (error) {
              addLog(`useRealtimeAdminNotifications error: ${error}`)
            }
            break
          case 4:
            addLog('Step 4: Testing useAdminList hook')
            const { useAdminList } = await import('@/hooks/useAdminList')
            try {
              const admins = useAdminList()
              addLog(`useAdminList: ${admins.length} admins`)
            } catch (error) {
              addLog(`useAdminList error: ${error}`)
            }
            break
          default:
            addLog('All tests completed')
        }
      } catch (error) {
        addLog(`Error in step ${step}: ${error}`)
      }
    }

    testComponents()
  }, [step])

  if (loading) {
    return (
      <AdminLayout userRole="admin">
        <div className="p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p>Loading minimal admin dashboard...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="admin">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Minimal Admin Dashboard</h1>
        
        <div className="mb-4">
          <button 
            onClick={() => setStep(prev => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={step >= 5}
          >
            Test Next Component (Step {step + 1})
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Auth State:</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify({ 
                user: !!user, 
                userData: !!userData, 
                loading,
                userEmail: user?.email,
                userRole: userData?.role
              }, null, 2)}
            </pre>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Test Logs:</h2>
            <div className="bg-gray-100 p-2 rounded text-sm max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-xs font-mono text-green-600">{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
