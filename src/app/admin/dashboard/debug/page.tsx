'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/admin/AdminLayout'

export default function AdminDashboardDebug() {
  const [logs, setLogs] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const { user, userData, loading } = useAuth()
  
  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  const addError = (error: string) => {
    console.error(error)
    setErrors(prev => [...prev, `${new Date().toISOString()}: ${error}`])
  }

  useEffect(() => {
    addLog('Debug page mounted')
    
    // Test Firebase connection
    const testFirebase = async () => {
      try {
        const { db } = await import('@/lib/firebase')
        const { collection, getDocs, limit } = await import('firebase/firestore')
        
        addLog('Testing Firebase connection...')
        const testQuery = collection(db, 'users')
        const snapshot = await getDocs(testQuery)
        addLog(`Firebase test successful: ${snapshot.size} users found`)
      } catch (error) {
        addError(`Firebase test failed: ${error}`)
      }
    }

    testFirebase()
  }, [])

  useEffect(() => {
    addLog(`Auth state: user=${!!user}, userData=${!!userData}, loading=${loading}`)
  }, [user, userData, loading])

  // Test the hooks that might be causing issues
  useEffect(() => {
    try {
      const { useRealtimeAdminActivity } = require('@/hooks/useRealtimeAdminActivity')
      const { useRealtimeAdminNotifications } = require('@/hooks/useRealtimeAdminNotifications')
      const { useAdminList } = require('@/hooks/useAdminList')
      
      addLog('Testing admin hooks...')
      
      // These might cause errors, so we'll catch them
      try {
        const activities = useRealtimeAdminActivity(10)
        addLog(`useRealtimeAdminActivity: ${activities.length} activities`)
      } catch (error) {
        addError(`useRealtimeAdminActivity failed: ${error}`)
      }
      
      try {
        const notifications = useRealtimeAdminNotifications(10)
        addLog(`useRealtimeAdminNotifications: ${notifications.length} notifications`)
      } catch (error) {
        addError(`useRealtimeAdminNotifications failed: ${error}`)
      }
      
      try {
        const admins = useAdminList()
        addLog(`useAdminList: ${admins.length} admins`)
      } catch (error) {
        addError(`useAdminList failed: ${error}`)
      }
      
    } catch (error) {
      addError(`Hook testing failed: ${error}`)
    }
  }, [])

  if (loading) {
    return (
      <AdminLayout userRole="admin">
        <div className="p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p>Loading debug page...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="admin">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard Debug</h1>
        
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
            <h2 className="text-lg font-semibold mb-2">Console Logs:</h2>
            <div className="bg-gray-100 p-2 rounded text-sm max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-xs font-mono text-green-600">{log}</div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2 text-red-600">Errors:</h2>
            <div className="bg-red-50 p-2 rounded text-sm max-h-96 overflow-y-auto">
              {errors.map((error, index) => (
                <div key={index} className="text-xs font-mono text-red-600">{error}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
