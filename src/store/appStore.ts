import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from 'firebase/auth'

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

interface AppState {
  // Authentication
  user: User | null
  userData: UserData | null
  isAuthenticated: boolean
  isLoading: boolean

  // Notifications
  notifications: Notification[]
  unreadCount: number

  // UI State
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  online: boolean

  // Data Cache
  cache: Record<string, {
    data: any
    timestamp: number
    ttl: number
  }>

  // Actions
  setUser: (user: User | null) => void
  setUserData: (userData: UserData | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (isLoading: boolean) => void
  
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void

  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setOnline: (online: boolean) => void

  setCache: (key: string, data: any, ttl?: number) => void
  getCache: (key: string) => any | null
  clearCache: (key?: string) => void

  // Auth actions
  login: (user: User, userData: UserData) => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      userData: null,
      isAuthenticated: false,
      isLoading: true,

      notifications: [],
      unreadCount: 0,

      sidebarOpen: true,
      theme: 'system',
      online: true,

      cache: {},

      // Actions
      setUser: (user) => set({ user }),
      setUserData: (userData) => set({ userData }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        }
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }))
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }))
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

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      setOnline: (online) => set({ online }),

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
        const cache = get().cache[key]
        if (!cache) return null
        
        const now = Date.now()
        if (now - cache.timestamp > cache.ttl) {
          // Cache expired
          set((state) => {
            const newCache = { ...state.cache }
            delete newCache[key]
            return { cache: newCache }
          })
          return null
        }
        
        return cache.data
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

      login: (user, userData) => {
        set({
          user,
          userData,
          isAuthenticated: true,
          isLoading: false
        })
      },

      logout: () => {
        set({
          user: null,
          userData: null,
          isAuthenticated: false,
          isLoading: false,
          notifications: [],
          unreadCount: 0,
          cache: {}
        })
      }
    }),
    {
      name: 'ispaan-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        notifications: state.notifications.slice(0, 50), // Keep only last 50 notifications
        cache: state.cache
      })
    }
  )
)

// Selectors for better performance
export const useAuth = () => useAppStore((state) => ({
  user: state.user,
  userData: state.userData,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  login: state.login,
  logout: state.logout
}))

export const useNotifications = () => useAppStore((state) => ({
  notifications: state.notifications,
  unreadCount: state.unreadCount,
  addNotification: state.addNotification,
  markNotificationRead: state.markNotificationRead,
  markAllNotificationsRead: state.markAllNotificationsRead,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications
}))

export const useUI = () => useAppStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  theme: state.theme,
  online: state.online,
  setSidebarOpen: state.setSidebarOpen,
  toggleSidebar: state.toggleSidebar,
  setTheme: state.setTheme,
  setOnline: state.setOnline
}))

export const useCache = () => useAppStore((state) => ({
  setCache: state.setCache,
  getCache: state.getCache,
  clearCache: state.clearCache
}))

