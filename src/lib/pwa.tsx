// PWA Service Worker and Manifest utilities

interface PWAConfig {
  name: string
  shortName: string
  description: string
  themeColor: string
  backgroundColor: string
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser'
  orientation: 'portrait' | 'landscape' | 'any'
  startUrl: string
  scope: string
  icons: Array<{
    src: string
    sizes: string
    type: string
    purpose?: 'any' | 'maskable' | 'monochrome'
  }>
}

const defaultPWAConfig: PWAConfig = {
  name: 'iSpaan - AI-Powered Monitoring Platform',
  shortName: 'iSpaan',
  description: 'A comprehensive AI-powered monitoring platform for work-integrated learning programs',
  themeColor: '#4F46E5',
  backgroundColor: '#FFFFFF',
  display: 'standalone',
  orientation: 'portrait',
  startUrl: '/',
  scope: '/',
  icons: [
    {
      src: '/favicon-16x16.svg',
      sizes: '16x16',
      type: 'image/svg+xml',
      purpose: 'any'
    },
    {
      src: '/favicon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any'
    },
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/icons/icon-maskable-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable'
    },
    {
      src: '/icons/icon-maskable-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable'
    }
  ]
}

export class PWAManager {
  private static instance: PWAManager
  private config: PWAConfig
  private deferredPrompt: any = null
  private isInstalled: boolean = false

  constructor(config: PWAConfig = defaultPWAConfig) {
    this.config = config
    this.initialize()
  }

  static getInstance(config?: PWAConfig): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager(config)
    }
    return PWAManager.instance
  }

  private initialize(): void {
    if (typeof window === 'undefined') return

    // Check if app is already installed
    this.checkInstallStatus()

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e
    })

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true
      this.deferredPrompt = null
      console.log('PWA was installed')
    })

    // Register service worker
    this.registerServiceWorker()
  }

  private checkInstallStatus(): void {
    if (typeof window === 'undefined') return

    // Check if running in standalone mode
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true
  }

  private async registerServiceWorker(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered successfully:', registration)
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  async install(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false
    }

    try {
      this.deferredPrompt.prompt()
      const { outcome } = await this.deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        this.isInstalled = true
        this.deferredPrompt = null
        return true
      }
      
      return false
    } catch (error) {
      console.error('PWA installation failed:', error)
      return false
    }
  }

  canInstall(): boolean {
    return !!this.deferredPrompt
  }

  isAppInstalled(): boolean {
    return this.isInstalled
  }

  getConfig(): PWAConfig {
    return { ...this.config }
  }

  updateConfig(newConfig: Partial<PWAConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// PWA Hook for React components
export function usePWA() {
  const [pwaManager] = React.useState(() => PWAManager.getInstance())
  const [canInstall, setCanInstall] = React.useState(false)
  const [isInstalled, setIsInstalled] = React.useState(false)

  React.useEffect(() => {
    setCanInstall(pwaManager.canInstall())
    setIsInstalled(pwaManager.isAppInstalled())

    const checkInstallStatus = () => {
      setCanInstall(pwaManager.canInstall())
      setIsInstalled(pwaManager.isAppInstalled())
    }

    window.addEventListener('beforeinstallprompt', checkInstallStatus)
    window.addEventListener('appinstalled', checkInstallStatus)

    return () => {
      window.removeEventListener('beforeinstallprompt', checkInstallStatus)
      window.removeEventListener('appinstalled', checkInstallStatus)
    }
  }, [pwaManager])

  const install = async (): Promise<boolean> => {
    const success = await pwaManager.install()
    if (success) {
      setCanInstall(false)
      setIsInstalled(true)
    }
    return success
  }

  return {
    canInstall,
    isInstalled,
    install
  }
}

// Offline detection hook
export function useOfflineStatus() {
  const [isOffline, setIsOffline] = React.useState(false)

  React.useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine)
    }

    updateOnlineStatus()
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return isOffline
}

// PWA Install Button Component
export function PWAInstallButton() {
  const { canInstall, isInstalled, install } = usePWA()
  const [isInstalling, setIsInstalling] = React.useState(false)

  const handleInstall = async () => {
    if (!canInstall) return

    setIsInstalling(true)
    try {
      await install()
    } catch (error) {
      console.error('Installation failed:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">App Installed</span>
      </div>
    )
  }

  if (!canInstall) {
    return null
  }

  return (
    <Button
      onClick={handleInstall}
      disabled={isInstalling}
      className="flex items-center gap-2"
    >
      {isInstalling ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Installing...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Install App
        </>
      )}
    </Button>
  )
}

// Offline indicator component
export function OfflineIndicator() {
  const isOffline = useOfflineStatus()

  if (!isOffline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 z-50">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">You're offline. Some features may be limited.</span>
      </div>
    </div>
  )
}

// PWA Update notification
export function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = React.useState(false)
  const [registration, setRegistration] = React.useState<ServiceWorkerRegistration | null>(null)

  React.useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg)
      
      reg.addEventListener('updatefound', () => {
        setShowUpdate(true)
      })
    })
  }, [])

  const handleUpdate = () => {
    if (!registration) return

    registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
    setShowUpdate(false)
    window.location.reload()
  }

  if (!showUpdate) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Update Available</h3>
          <p className="text-sm">A new version of the app is available.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUpdate(false)}
            className="text-blue-500 border-white hover:bg-white"
          >
            Later
          </Button>
          <Button
            size="sm"
            onClick={handleUpdate}
            className="bg-white text-blue-500 hover:bg-gray-100"
          >
            Update
          </Button>
        </div>
      </div>
    </div>
  )
}

// Import React for hooks
import React from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Download, Loader2, WifiOff } from 'lucide-react'
