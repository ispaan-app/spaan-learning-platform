'use client'

import { useEffect, useState } from 'react'
import { HomePageContent } from '@/components/shared/HomePageContent'
import { AppearanceService, AppearanceSettings } from '@/lib/appearance-service'

export default function HomePage() {
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load appearance settings
    const loadAppearanceSettings = async () => {
      try {
        const settings = await AppearanceService.getAppearanceSettings()
        setAppearanceSettings(settings)
      } catch (error) {
        console.error('Error loading appearance settings:', error)
        // Use default settings if loading fails
        setAppearanceSettings({
          heroImageUrl: '/images/default-hero.jpg',
          platformName: 'iSpaan',
          primaryColor: '#4F46E5',
          secondaryColor: '#7C3AED',
          lastUpdated: new Date(),
          updatedBy: 'system'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadAppearanceSettings()

    // Subscribe to real-time updates
    const unsubscribe = AppearanceService.subscribeToAppearanceSettings((settings) => {
      setAppearanceSettings(settings)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <HomePageContent 
      heroImageUrl={appearanceSettings?.heroImageUrl || '/images/default-hero.jpg'}
  platformName={appearanceSettings?.platformName || 'iSpaan'}
      primaryColor={appearanceSettings?.primaryColor || '#4F46E5'}
      secondaryColor={appearanceSettings?.secondaryColor || '#7C3AED'}
    />
  )
}