'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Image as ImageIcon, 
  Wand2, 
  Check, 
  RefreshCw,
  Eye,
  Download,
  Copy,
  Palette,
  Save
} from 'lucide-react'

interface AppearanceSettings {
  heroImageUrl: string
  platformName: string
  primaryColor: string
  secondaryColor: string
  logoUrl?: string
  faviconUrl?: string
  lastUpdated: Date
  updatedBy: string
}

export function AppearanceManagement() {
  const [settings, setSettings] = useState<AppearanceSettings>({
    heroImageUrl: '/images/default-hero.jpg',
    platformName: 'iSpaan App',
    primaryColor: '#4F46E5',
    secondaryColor: '#7C3AED',
    lastUpdated: new Date(),
    updatedBy: 'system'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadAppearanceSettings()
  }, [])

  const loadAppearanceSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/appearance')
      const data = await response.json()
      
      if (data.success) {
        setSettings(data.settings)
      } else {
        setError('Failed to load appearance settings')
      }
    } catch (err) {
      console.error('Error loading appearance settings:', err)
      setError('Failed to load appearance settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')
      setSuccess('')

      const response = await fetch('/api/appearance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(data.message)
        // Reload settings to get updated data
        await loadAppearanceSettings()
      } else {
        setError(data.error || 'Failed to save appearance settings')
      }
    } catch (err) {
      console.error('Error saving appearance settings:', err)
      setError('Failed to save appearance settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'logo' | 'favicon') => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload/hero-image', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        
        if (type === 'hero') {
          setSettings(prev => ({ ...prev, heroImageUrl: data.url }))
        } else if (type === 'logo') {
          setSettings(prev => ({ ...prev, logoUrl: data.url }))
        } else if (type === 'favicon') {
          setSettings(prev => ({ ...prev, faviconUrl: data.url }))
        }
        
        setSuccess(`${type === 'hero' ? 'Hero image' : type === 'logo' ? 'Logo' : 'Favicon'} updated successfully!`)
      } else {
        setError(`Failed to upload ${type === 'hero' ? 'hero image' : type === 'logo' ? 'logo' : 'favicon'}. Please try again.`)
      }
    } catch (err) {
      console.error(`Error uploading ${type}:`, err)
      setError(`An error occurred while uploading ${type === 'hero' ? 'hero image' : type === 'logo' ? 'logo' : 'favicon'}. Please try again.`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Hero Image Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="w-6 h-6" />
            <span>Hero Image</span>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <img
                src={settings.heroImageUrl}
                alt="Current hero image"
                className="w-full h-64 object-cover rounded-lg border"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(settings.heroImageUrl, '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(settings.heroImageUrl)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy URL
              </Button>
            </div>
            <div>
              <Label htmlFor="hero-upload">Upload New Hero Image</Label>
              <Input
                id="hero-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'hero')}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-6 h-6" />
            <span>Platform Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input
                id="platform-name"
                value={settings.platformName}
                onChange={(e) => setSettings(prev => ({ ...prev, platformName: e.target.value }))}
                placeholder="Enter platform name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="primary-color"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  placeholder="#4F46E5"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="secondary-color"
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  placeholder="#7C3AED"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            Changes will be reflected on the landing page immediately after saving.
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-lg font-semibold mb-2" style={{ color: settings.primaryColor }}>
              {settings.platformName}
            </div>
            <div className="text-sm text-gray-600">
              Primary Color: {settings.primaryColor} | Secondary Color: {settings.secondaryColor}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}