'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { StipendReportsManagement } from '@/components/super-admin/StipendReportsManagement'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy, limit, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  Activity
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface StipendReport {
  id: string
  learnerId: string
  learnerName: string
  placementId: string
  companyName: string
  month: string
  year: number
  status: 'pending' | 'resolved'
  submittedAt: Date | string
  resolvedAt?: Date | string
  resolvedBy?: string
  notes?: string
  amount?: number
  issue?: string
}

export default function StipendReportsPage() {
  const { user: currentUser } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast()
  const [stipendReports, setStipendReports] = useState<StipendReport[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [realTimeStats, setRealTimeStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    totalAmount: 0,
    systemHealth: 'excellent'
  })

  // Real-time data processing
  const processStipendReportsData = (reportsData: StipendReport[]) => {
    const total = reportsData.length
    const pending = reportsData.filter(r => r.status === 'pending').length
    const resolved = reportsData.filter(r => r.status === 'resolved').length
    const totalAmount = reportsData.reduce((sum, r) => sum + (r.amount || 0), 0)
    
    // Calculate system health based on data availability and pending reports
    let systemHealth = 'excellent'
    if (total === 0) {
      systemHealth = 'excellent' // No reports means no issues
    } else if (pending > total * 0.5) {
      systemHealth = 'poor'
    } else if (pending > total * 0.2) {
      systemHealth = 'good'
    } else {
      systemHealth = 'excellent'
    }
    
    setRealTimeStats({ 
      total, 
      pending, 
      resolved, 
      totalAmount,
      systemHealth
    })
    setLastUpdate(new Date())
  }

  // Load stipend reports from Firestore
  const loadStipendReports = async () => {
    try {
      setLoading(true)
      console.log('Loading stipend reports from Firestore...')
      
    const snapshot = await getDocs(
      query(
        collection(db, 'stipendReports'),
        orderBy('submittedAt', 'desc'),
        limit(50)
      )
    )
    
      if (!snapshot || snapshot.empty) {
        console.log('No stipend reports found in database')
        setStipendReports([])
        processStipendReportsData([])
        return
      }
      
      const reportsData = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
      id: doc.id,
          learnerId: data.learnerId || '',
          learnerName: data.learnerName || '',
          placementId: data.placementId || '',
          companyName: data.companyName || '',
          month: data.month || '',
          year: data.year || new Date().getFullYear(),
          status: data.status || 'pending',
          submittedAt: data.submittedAt?.toDate?.() || new Date(),
          resolvedAt: data.resolvedAt?.toDate?.() || null,
          resolvedBy: data.resolvedBy || '',
          notes: data.notes || '',
          amount: data.amount || 0,
          issue: data.issue || ''
        }
      }) as StipendReport[]

      console.log('Processed stipend reports data:', reportsData.length, 'reports')
      setStipendReports(reportsData)
      processStipendReportsData(reportsData)
      
  } catch (error) {
      console.error('Error loading stipend reports:', error)
      toastError(`Failed to load stipend reports: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Real-time data subscription
  useEffect(() => {
    if (!currentUser) {
      console.log('No current user, skipping real-time setup')
      setLoading(false)
      return
    }

    console.log('Setting up real-time subscription for stipend reports...')
    let unsubscribe: (() => void) | null = null
    let timeoutId: NodeJS.Timeout | null = null

    // Set a timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      console.log('Loading timeout reached, setting loading to false')
      setLoading(false)
    }, 10000) // 10 second timeout

    const processSnapshot = (snapshot: any) => {
      console.log('Processing stipend reports snapshot with', snapshot.docs.length, 'documents')
      
      // Clear the timeout since we got data
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      
      const reportsData = snapshot.docs.map((doc: any) => {
        const data = doc.data()
        return {
          id: doc.id,
          learnerId: data.learnerId || '',
          learnerName: data.learnerName || '',
          placementId: data.placementId || '',
          companyName: data.companyName || '',
          month: data.month || '',
          year: data.year || new Date().getFullYear(),
          status: data.status || 'pending',
          submittedAt: data.submittedAt?.toDate?.() || new Date(),
          resolvedAt: data.resolvedAt?.toDate?.() || null,
          resolvedBy: data.resolvedBy || '',
          notes: data.notes || '',
          amount: data.amount || 0,
          issue: data.issue || ''
        }
      }) as StipendReport[]

      console.log('Setting stipend reports:', reportsData.length)
      setStipendReports(reportsData)
      processStipendReportsData(reportsData)
      setLoading(false) // Ensure loading is set to false when data is processed
    }

    const setupSubscription = () => {
      try {
        console.log('Attempting real-time subscription for stipend reports...')
        unsubscribe = onSnapshot(
          query(collection(db, 'stipendReports'), orderBy('submittedAt', 'desc')),
          processSnapshot,
          (error) => {
            console.error('Stipend reports subscription failed, trying basic query:', error)
            // Try basic collection query as fallback
            try {
              unsubscribe = onSnapshot(
                collection(db, 'stipendReports'),
                (fallbackSnapshot) => {
                  console.log('Fallback query successful, processing data...')
                  // Sort manually since we can't use orderBy
                  const sortedDocs = fallbackSnapshot.docs.sort((a, b) => {
                    const dateA = a.data().submittedAt?.toDate?.() || new Date(0)
                    const dateB = b.data().submittedAt?.toDate?.() || new Date(0)
                    return dateB.getTime() - dateA.getTime()
                  })
                  processSnapshot({ docs: sortedDocs })
                },
                (fallbackError) => {
                  console.error('Fallback subscription also failed:', fallbackError)
                  toastError('Failed to connect to stipend reports database')
                  setLoading(false)
                  
                  if (timeoutId) {
                    clearTimeout(timeoutId)
                    timeoutId = null
                  }
                }
              )
            } catch (fallbackError) {
              console.error('Error setting up fallback subscription:', fallbackError)
              toastError('Database connection failed')
              setLoading(false)
              
              if (timeoutId) {
                clearTimeout(timeoutId)
                timeoutId = null
              }
            }
          }
        )
      } catch (error) {
        console.error('Error setting up stipend reports subscription:', error)
        // Try basic collection query as fallback
        try {
          unsubscribe = onSnapshot(
            collection(db, 'stipendReports'),
            (fallbackSnapshot) => {
              console.log('Fallback query successful, processing data...')
              // Sort manually since we can't use orderBy
              const sortedDocs = fallbackSnapshot.docs.sort((a, b) => {
                const dateA = a.data().submittedAt?.toDate?.() || new Date(0)
                const dateB = b.data().submittedAt?.toDate?.() || new Date(0)
                return dateB.getTime() - dateA.getTime()
              })
              processSnapshot({ docs: sortedDocs })
            },
            (fallbackError) => {
              console.error('Fallback subscription also failed:', fallbackError)
              toastError('Database connection failed')
              setLoading(false)
              
              if (timeoutId) {
                clearTimeout(timeoutId)
                timeoutId = null
              }
            }
          )
        } catch (fallbackError) {
          console.error('Error setting up fallback subscription:', fallbackError)
          toastError('Database connection failed')
          setLoading(false)
          
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
        }
      }
    }

    // Set up real-time subscription (this will also do the initial load)
    setupSubscription()

    // Network status monitoring
    const handleOnline = () => {
      console.log('Network came online')
      setIsOnline(true)
    }
    const handleOffline = () => {
      console.log('Network went offline')
      setIsOnline(false)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      console.log('Cleaning up stipend reports subscription...')
      if (unsubscribe) {
        unsubscribe()
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [currentUser?.uid, toastError])

  const handleRefresh = async () => {
    if (refreshing) return
    
    setRefreshing(true)
    try {
      console.log('Manual refresh triggered...')
      await loadStipendReports()
      toastSuccess('Stipend reports data refreshed successfully')
    } catch (error) {
      console.error('Error refreshing stipend reports:', error)
      toastError('Failed to refresh stipend reports data')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <AdminLayout userRole="super-admin">
      <div className="space-y-8" style={{ backgroundColor: '#F5F0E1', minHeight: '100vh' }}>
        {/* Enhanced Header with Real-time Status */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #1E3D59, #8B5CF6, #FF6E40)' }}></div>
          <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold" style={{ color: '#1E3D59' }}>Stipend Reports Management</h1>
                    <p className="text-lg" style={{ color: '#1E3D59' }}>Monitor and resolve payment issues with real-time data</p>
                  </div>
                </div>
                
                {/* Real-time Status Indicators */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-sm font-medium text-green-600">Live Data</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-gray-500" />
                    )}
                    <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                    <Clock className="w-4 h-4" style={{ color: '#FFC13B' }} />
                    <span className="text-sm font-medium" style={{ color: '#1E3D59' }}>
                      Updated {lastUpdate.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F5F0E1' }}>
                    <Database className="w-4 h-4" style={{ color: '#FF6E40' }} />
                    <span className="text-sm font-medium" style={{ color: '#1E3D59' }}>
                      {realTimeStats.total} Total Reports
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                  className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: '#1E3D59' }}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="font-semibold">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Real-time Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Reports Card */}
          <div className="relative group">
            <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#1E3D59' }}>
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-xs font-medium text-green-600">Live</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Total Reports</p>
                  <p className="text-3xl font-bold mb-2" style={{ color: '#1E3D59' }}>{realTimeStats.total}</p>
                  {realTimeStats.total === 0 ? (
                    <p className="text-xs text-gray-500 mb-2">No reports submitted yet</p>
                  ) : (
                    <p className="text-xs text-gray-500 mb-2">All submitted reports</p>
                  )}
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F5F0E1' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((realTimeStats.total / 100) * 100, 100)}%`, backgroundColor: '#1E3D59' }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Reports Card */}
          <div className="relative group">
            <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FF6E40' }}>
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-xs font-medium text-green-600">Live</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Pending Reports</p>
                  <p className="text-3xl font-bold mb-2" style={{ color: '#1E3D59' }}>{realTimeStats.pending}</p>
                  {realTimeStats.total === 0 ? (
                    <p className="text-xs text-gray-500 mb-2">No reports to process</p>
                  ) : realTimeStats.pending === 0 ? (
                    <p className="text-xs text-green-600 mb-2">All reports resolved</p>
                  ) : (
                    <p className="text-xs text-orange-600 mb-2">Awaiting resolution</p>
                  )}
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F5F0E1' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${realTimeStats.total > 0 ? (realTimeStats.pending / realTimeStats.total) * 100 : 0}%`, backgroundColor: '#FF6E40' }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resolved Reports Card */}
          <div className="relative group">
            <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#10B981' }}>
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-xs font-medium text-green-600">Live</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Resolved Reports</p>
                  <p className="text-3xl font-bold mb-2" style={{ color: '#1E3D59' }}>{realTimeStats.resolved}</p>
                  {realTimeStats.total === 0 ? (
                    <p className="text-xs text-gray-500 mb-2">No reports to resolve</p>
                  ) : realTimeStats.resolved === 0 ? (
                    <p className="text-xs text-orange-600 mb-2">No reports resolved yet</p>
                  ) : (
                    <p className="text-xs text-green-600 mb-2">Successfully resolved</p>
                  )}
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F5F0E1' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${realTimeStats.total > 0 ? (realTimeStats.resolved / realTimeStats.total) * 100 : 0}%`, backgroundColor: '#10B981' }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Total Amount Card */}
          <div className="relative group">
            <Card className="relative bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#8B5CF6' }}>
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                    <span className="text-xs font-medium text-green-600">Live</span>
                  </div>
                </div>
        <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#1E3D59' }}>Total Amount</p>
                  <p className="text-2xl font-bold mb-2" style={{ color: '#1E3D59' }}>R{realTimeStats.totalAmount.toLocaleString()}</p>
                  {realTimeStats.totalAmount === 0 ? (
                    <p className="text-xs text-gray-500 mb-2">No amounts to process</p>
                  ) : (
                    <p className="text-xs text-gray-500 mb-2">Total stipend value</p>
                  )}
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: '#F5F0E1' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((realTimeStats.totalAmount / 100000) * 100, 100)}%`, backgroundColor: '#8B5CF6' }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Health Indicator */}
        {realTimeStats.total === 0 && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#10B981' }}>
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-800 mb-1">System Status: Excellent</h3>
                  <p className="text-green-700">
                    No stipend reports have been submitted yet. The system is ready to process reports when learners submit them.
                  </p>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F0FDF4' }}>
                  <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                  <span className="text-sm font-medium text-green-600">All Clear</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stipend Reports Management Component */}
        <StipendReportsManagement 
          initialReports={stipendReports} 
          loading={loading}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          realTimeStats={realTimeStats}
          isOnline={isOnline}
          lastUpdate={lastUpdate}
        />
      </div>
    </AdminLayout>
  )
}