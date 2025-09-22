'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SimpleAdminDashboard() {
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
    addLog('Simple admin dashboard mounted')
  }, [])

  useEffect(() => {
    addLog(`Auth state: user=${!!user}, userData=${!!userData}, loading=${loading}`)
  }, [user, userData, loading])

  // Test Firebase connection
  useEffect(() => {
    const testFirebase = async () => {
      try {
        addLog('Testing Firebase connection...')
        const { db } = await import('@/lib/firebase')
        const { collection, getDocs, limit } = await import('firebase/firestore')
        
        const testQuery = collection(db, 'users')
        const snapshot = await getDocs(testQuery)
        addLog(`Firebase test successful: ${snapshot.size} users found`)
      } catch (error) {
        addError(`Firebase test failed: ${error}`)
      }
    }

    testFirebase()
  }, [])

  if (loading) {
    return (
      <AdminLayout userRole="admin">
        <div className="p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p>Loading simple admin dashboard...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout userRole="admin">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Simple Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Auth State</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-2 rounded text-sm">
                {JSON.stringify({ 
                  user: !!user, 
                  userData: !!userData, 
                  loading,
                  userEmail: user?.email,
                  userRole: userData?.role
                }, null, 2)}
              </pre>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Console Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-2 rounded text-sm max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="text-xs font-mono text-green-600">{log}</div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 p-2 rounded text-sm max-h-96 overflow-y-auto">
                {errors.map((error, index) => (
                  <div key={index} className="text-xs font-mono text-red-600">{error}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}