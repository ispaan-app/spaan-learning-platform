'use client'

import { useState, useEffect } from 'react'
import MobileOnboardingFlow from './MobileOnboardingFlow'
import DesktopOnboardingFlow from './DesktopOnboardingFlow'

export default function ResponsiveOnboardingFlow() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }

    // Check on mount
    checkScreenSize()

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  if (isMobile) {
    return <MobileOnboardingFlow />
  }

  return <DesktopOnboardingFlow />
}
