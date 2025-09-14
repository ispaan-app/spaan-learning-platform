import { HomePageContent } from '@/components/shared/HomePageContent'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

async function getHeroImageUrl(): Promise<string> {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'appearance'))

    if (settingsDoc.exists()) {
      const data = settingsDoc.data()
      return data?.heroImageUrl || '/images/default-hero.jpg'
    }

    return '/images/default-hero.jpg'
  } catch (error) {
    console.error('Error fetching hero image:', error)
    return '/images/default-hero.jpg'
  }
}

export default async function HomePage() {
  const heroImageUrl = await getHeroImageUrl()

  return <HomePageContent heroImageUrl={heroImageUrl} />
}