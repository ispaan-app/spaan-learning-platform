'use client'

import { HomePageContent } from '@/components/shared/HomePageContent'

export default function HomePage() {
  // Use default hero image for now to avoid server-side Firebase issues
  const heroImageUrl = '/images/default-hero.jpg'

  return <HomePageContent heroImageUrl={heroImageUrl} />
}