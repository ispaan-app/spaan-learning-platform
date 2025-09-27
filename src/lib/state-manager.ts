import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from 'firebase/auth'

// Centralized state management to replace multiple state sources
interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'applicant' | 'learner' | 'admin' | 'super-admin'
  status: 'pending' | 'active' | 'inactive' | 'suspended'
  program?: string
  placementId?: string
  monthlyHours?: number
  targetHours?: number
  lastCheckIn?: string
  createdAt: string
  updatedAt: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  actionUrl?: string
}

interface CacheItem {
  data: any
  timestamp: number
  ttl: number
}

interface AppState {
  // Authentication State
  user: User | null
  userData: UserData | null
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null

  // Notifications State
  notifications: Notification[]
  unreadCount: number

  // UI State
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  online: boolean
  currentPage: string

  // Data Cache (Centralized)
  cache: Record<string, CacheItem>

  // Real-time Data State
  realtimeData: Record<string, {
    data: any
    loading: boolean
    error: string | null
    lastUpdated: Date
  }>

  // Actions
  setUser: (user: User | null) => void
  setUserData: (userData: UserData | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (isLoading: boolean) => void
  setAuthError: (error: string | null) => void
  
  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void

  // UI Actions
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setOnline: (online: boolean) => void
  setCurrentPage: (page: string) => void

  // Cache Actions
  setCache: (key: string, data: any, ttl?: number) => void
  getCache: (key: string) => any | null
  clearCache: (key?: string) => void
  invalidateCache: (pattern?: string) => void

  // Real-time Data Actions
  setRealtimeData: (key: string, data: any, loading?: boolean, error?: string | null) => void
  getRealtimeData: (key: string) => any
  clearRealtimeData: (key?: string) => void

  // Auth Actions
  login: (user: User, userData: UserData) => void
  logout: () => void
  updateUserData: (updates: Partial<UserData>) => void

  // Utility Actions
  reset: () => void
}

const initialState = {
  user: null,
  userData: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,
  notifications: [],
  unreadCount: 0,
  sidebarOpen: true,
  theme: 'system' as 'light' | 'dark' | 'system',
  online: true,
  currentPage: '/',
  cache: {},
  realtimeData: {}
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Authentication Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setUserData: (userData) => set({ userData }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),
      setAuthError: (authError) => set({ authError }),

      // Notification Actions
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        }
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }))
      },

      markNotificationRead: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          if (!notification || notification.read) return state

          return {
            notifications: state.notifications.map(n => 
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }
        })
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0
        }))
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: notification && !notification.read 
              ? Math.max(0, state.unreadCount - 1) 
              : state.unreadCount
          }
        })
      },

      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),

      // UI Actions
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      setOnline: (online) => set({ online }),
      setCurrentPage: (currentPage) => set({ currentPage }),

      // Cache Actions
      setCache: (key, data, ttl = 300000) => { // 5 minutes default TTL
        set((state) => ({
          cache: {
            ...state.cache,
            [key]: {
              data,
              timestamp: Date.now(),
              ttl
            }
          }
        }))
      },

      getCache: (key) => {
        const state = get()
        const item = state.cache[key]
        
        if (!item) return null
        
        const now = Date.now()
        if (now - item.timestamp > item.ttl) {
          // Don't auto-cleanup in getter - let it be handled elsewhere
          return null
        }
        
        return item.data
      },

      clearCache: (key) => {
        if (key) {
          set((state) => {
            const newCache = { ...state.cache }
            delete newCache[key]
            return { cache: newCache }
          })
        } else {
          set({ cache: {} })
        }
      },

      invalidateCache: (pattern) => {
        set((state) => {
          if (!pattern) {
            return { cache: {} }
          }
          
          const newCache = { ...state.cache }
          Object.keys(newCache).forEach(key => {
            if (key.includes(pattern)) {
              delete newCache[key]
            }
          })
          return { cache: newCache }
        })
      },

      // Real-time Data Actions
      setRealtimeData: (key, data, loading = false, error = null) => {
        set((state) => ({
          realtimeData: {
            ...state.realtimeData,
            [key]: {
              data,
              loading,
              error,
              lastUpdated: new Date()
            }
          }
        }))
      },

      getRealtimeData: (key) => {
        const state = get()
        return state.realtimeData[key]?.data || null
      },

      clearRealtimeData: (key) => {
        if (key) {
          set((state) => {
            const newRealtimeData = { ...state.realtimeData }
            delete newRealtimeData[key]
            return { realtimeData: newRealtimeData }
          })
        } else {
          set({ realtimeData: {} })
        }
      },

      // Auth Actions
      login: (user, userData) => {
        set({
          user,
          userData,
          isAuthenticated: true,
          isLoading: false,
          authError: null
        })
      },

      logout: () => {
        set({
          user: null,
          userData: null,
          isAuthenticated: false,
          isLoading: false,
          authError: null,
          notifications: [],
          unreadCount: 0,
          cache: {},
          realtimeData: {}
        })
      },

      updateUserData: (updates) => {
        set((state) => ({
          userData: state.userData ? { ...state.userData, ...updates } : null
        }))
      },

      // Utility Actions
      reset: () => set(initialState)
    }),
    {
      name: 'ispaan-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        userData: state.userData,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        notifications: state.notifications,
        unreadCount: state.unreadCount
      })
    }
  )
)

// Individual selectors for better performance and to prevent re-renders
export const useAuth = () => {
  const user = useAppStore((state) => state.user)
  const userData = useAppStore((state) => state.userData)
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  const isLoading = useAppStore((state) => state.isLoading)
  const authError = useAppStore((state) => state.authError)
  const login = useAppStore((state) => state.login)
  const logout = useAppStore((state) => state.logout)
  const updateUserData = useAppStore((state) => state.updateUserData)
  
  return {
    user,
    userData,
    isAuthenticated,
    isLoading,
    authError,
    login,
    logout,
    updateUserData
  }
}

export const useNotifications = () => {
  const notifications = useAppStore((state) => state.notifications)
  const unreadCount = useAppStore((state) => state.unreadCount)
  const addNotification = useAppStore((state) => state.addNotification)
  const markNotificationRead = useAppStore((state) => state.markNotificationRead)
  const markAllNotificationsRead = useAppStore((state) => state.markAllNotificationsRead)
  const removeNotification = useAppStore((state) => state.removeNotification)
  const clearNotifications = useAppStore((state) => state.clearNotifications)
  
  return {
    notifications,
    unreadCount,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    clearNotifications
  }
}

export const useUI = () => {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen)
  const theme = useAppStore((state) => state.theme)
  const online = useAppStore((state) => state.online)
  const currentPage = useAppStore((state) => state.currentPage)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const setTheme = useAppStore((state) => state.setTheme)
  const setOnline = useAppStore((state) => state.setOnline)
  const setCurrentPage = useAppStore((state) => state.setCurrentPage)
  
  return {
    sidebarOpen,
    theme,
    online,
    currentPage,
    setSidebarOpen,
    toggleSidebar,
    setTheme,
    setOnline,
    setCurrentPage
  }
}

export const useCache = () => {
  const setCache = useAppStore((state) => state.setCache)
  const getCache = useAppStore((state) => state.getCache)
  const clearCache = useAppStore((state) => state.clearCache)
  const invalidateCache = useAppStore((state) => state.invalidateCache)
  
  return {
    setCache,
    getCache,
    clearCache,
    invalidateCache
  }
}

export const useRealtimeData = (key: string) => useAppStore((state) => ({
  data: state.realtimeData[key]?.data || null,
  loading: state.realtimeData[key]?.loading || false,
  error: state.realtimeData[key]?.error || null,
  lastUpdated: state.realtimeData[key]?.lastUpdated || null,
  setData: (data: any, loading?: boolean, error?: string | null) => 
    state.setRealtimeData(key, data, loading, error)
}))

// Export types
export type { UserData, Notification, CacheItem, AppState }
