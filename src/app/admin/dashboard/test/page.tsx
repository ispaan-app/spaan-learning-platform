'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeAdminActivity } from '@/hooks/useRealtimeAdminActivity'
import { useRealtimeAdminNotifications } from '@/hooks/useRealtimeAdminNotifications'
import { useAdminList } from '@/hooks/useAdminList'

export default function AdminDashboardTest() {
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  useEffect(() => {
    addLog('Component mounted')
  }, [])

  // Test useAuth hook
  const { user, userData, loading } = useAuth()
  useEffect(() => {
    addLog(`useAuth: user=${!!user}, userData=${!!userData}, loading=${loading}`)
  }, [user, userData, loading])

  // Test useRealtimeAdminActivity hook
  const recentActivity = useRealtimeAdminActivity(10)
  useEffect(() => {
    addLog(`useRealtimeAdminActivity: activities=${recentActivity.length}`)
  }, [recentActivity])

  // Test useRealtimeAdminNotifications hook
  const adminNotifications = useRealtimeAdminNotifications(10)
  useEffect(() => {
    addLog(`useRealtimeAdminNotifications: notifications=${adminNotifications.length}`)
  }, [adminNotifications])

  // Test useAdminList hook
  const admins = useAdminList()
  useEffect(() => {
    addLog(`useAdminList: admins=${admins.length}`)
  }, [admins])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard Test</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Auth State:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify({ user: !!user, userData: !!userData, loading }, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Data Counts:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify({ 
              activities: recentActivity.length, 
              notifications: adminNotifications.length, 
              admins: admins.length 
            }, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Console Logs:</h2>
          <div className="bg-gray-100 p-2 rounded text-sm max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-xs font-mono">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
