/**
 * Appearance Service
 * Handles fetching and managing appearance settings from Firestore
 */

import { db } from '@/lib/firebase'
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'

export interface AppearanceSettings {
  heroImageUrl: string
  platformName: string
  primaryColor: string
  secondaryColor: string
  logoUrl?: string
  faviconUrl?: string
  lastUpdated: Date
  updatedBy: string
}

const DEFAULT_APPEARANCE: AppearanceSettings = {
  heroImageUrl: '/images/default-hero.jpg',
  platformName: 'iSpaan App',
  primaryColor: '#4F46E5',
  secondaryColor: '#7C3AED',
  lastUpdated: new Date(),
  updatedBy: 'system'
}

export class AppearanceService {
  /**
   * Get current appearance settings
   */
  static async getAppearanceSettings(): Promise<AppearanceSettings> {
    try {
      const appearanceRef = doc(db, 'settings', 'appearance')
      const appearanceDoc = await getDoc(appearanceRef)
      
      if (appearanceDoc.exists()) {
        const data = appearanceDoc.data()
        return {
          heroImageUrl: data.heroImageUrl || DEFAULT_APPEARANCE.heroImageUrl,
          platformName: data.platformName || DEFAULT_APPEARANCE.platformName,
          primaryColor: data.primaryColor || DEFAULT_APPEARANCE.primaryColor,
          secondaryColor: data.secondaryColor || DEFAULT_APPEARANCE.secondaryColor,
          logoUrl: data.logoUrl,
          faviconUrl: data.faviconUrl,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          updatedBy: data.updatedBy || 'unknown'
        }
      }
      
      return DEFAULT_APPEARANCE
    } catch (error) {
      console.error('Error fetching appearance settings:', error)
      return DEFAULT_APPEARANCE
    }
  }

  /**
   * Subscribe to appearance settings changes
   */
  static subscribeToAppearanceSettings(
    callback: (settings: AppearanceSettings) => void
  ): () => void {
    const appearanceRef = doc(db, 'settings', 'appearance')
    
    return onSnapshot(appearanceRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        const settings: AppearanceSettings = {
          heroImageUrl: data.heroImageUrl || DEFAULT_APPEARANCE.heroImageUrl,
          platformName: data.platformName || DEFAULT_APPEARANCE.platformName,
          primaryColor: data.primaryColor || DEFAULT_APPEARANCE.primaryColor,
          secondaryColor: data.secondaryColor || DEFAULT_APPEARANCE.secondaryColor,
          logoUrl: data.logoUrl,
          faviconUrl: data.faviconUrl,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          updatedBy: data.updatedBy || 'unknown'
        }
        callback(settings)
      } else {
        callback(DEFAULT_APPEARANCE)
      }
    }, (error) => {
      console.error('Error subscribing to appearance settings:', error)
      callback(DEFAULT_APPEARANCE)
    })
  }

  /**
   * Update appearance settings
   */
  static async updateAppearanceSettings(
    updates: Partial<AppearanceSettings>,
    updatedBy: string = 'super-admin'
  ): Promise<boolean> {
    try {
      const appearanceRef = doc(db, 'settings', 'appearance')
      await setDoc(appearanceRef, {
        ...updates,
        lastUpdated: new Date(),
        updatedBy
      }, { merge: true })
      
      return true
    } catch (error) {
      console.error('Error updating appearance settings:', error)
      return false
    }
  }
}

