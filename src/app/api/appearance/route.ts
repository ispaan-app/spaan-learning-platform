import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export async function GET() {
  try {
    const appearanceRef = doc(db, 'settings', 'appearance')
    const appearanceDoc = await getDoc(appearanceRef)
    
    if (appearanceDoc.exists()) {
      const data = appearanceDoc.data()
      return NextResponse.json({
        success: true,
        settings: {
          heroImageUrl: data.heroImageUrl || '/images/default-hero.jpg',
          platformName: data.platformName || 'iSpaan',
          primaryColor: data.primaryColor || '#4F46E5',
          secondaryColor: data.secondaryColor || '#7C3AED',
          logoUrl: data.logoUrl,
          faviconUrl: data.faviconUrl,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          updatedBy: data.updatedBy || 'unknown'
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      settings: {
        heroImageUrl: '/images/default-hero.jpg',
  platformName: 'iSpaan',
        primaryColor: '#4F46E5',
        secondaryColor: '#7C3AED',
        lastUpdated: new Date(),
        updatedBy: 'system'
      }
    })
  } catch (error) {
    console.error('Error fetching appearance settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appearance settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      heroImageUrl, 
      platformName, 
      primaryColor, 
      secondaryColor, 
      logoUrl, 
      faviconUrl 
    } = body

    const appearanceRef = doc(db, 'settings', 'appearance')
    await setDoc(appearanceRef, {
      heroImageUrl,
      platformName,
      primaryColor,
      secondaryColor,
      logoUrl,
      faviconUrl,
      lastUpdated: new Date(),
      updatedBy: 'super-admin' // In real implementation, get from auth context
    }, { merge: true })

    return NextResponse.json({ 
      success: true, 
      message: 'Appearance settings updated successfully! The landing page will reflect these changes immediately.'
    })

  } catch (error) {
    console.error('Error updating appearance settings:', error)
    return NextResponse.json(
      { error: 'Failed to update appearance settings' },
      { status: 500 }
    )
  }
}



