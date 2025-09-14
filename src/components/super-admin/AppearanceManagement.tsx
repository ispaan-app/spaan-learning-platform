'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Palette, 
  Image, 
  Type, 
  Monitor, 
  Smartphone, 
  Tablet,
  Upload,
  Save,
  Eye,
  RefreshCw,
  Download,
  Trash2,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  Wand2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { db } from '@/lib/firebase'
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { FileUpload } from '@/components/ui/file-upload'
import { uploadLogo, uploadHeroImage, uploadFavicon } from '@/lib/fileUpload'

interface BrandingSettings {
  logoUrl: string
  faviconUrl: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  siteName: string
  siteDescription: string
  heroImageUrl: string
  footerText: string
  primaryHsl: { h: number; s: number; l: number }
  secondaryHsl: { h: number; s: number; l: number }
  accentHsl: { h: number; s: number; l: number }
}

interface HSLColor {
  h: number
  s: number
  l: number
}

// Utility functions for color conversion
const hexToHsl = (hex: string): HSLColor => {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

const hslToHex = (hsl: HSLColor): string => {
  const h = hsl.h / 360
  const s = hsl.s / 100
  const l = hsl.l / 100

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }

  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function AppearanceManagement() {
  const [settings, setSettings] = useState<BrandingSettings>({
    logoUrl: '/images/logo.png',
    faviconUrl: '/favicon.ico',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    accentColor: '#F59E0B',
    fontFamily: 'Inter',
    siteName: 'ISPaan Platform',
    siteDescription: 'Empowering learners through structured programs and placements',
    heroImageUrl: '/images/default-hero.jpg',
    footerText: '© 2024 ISPaan Platform. All rights reserved.',
    primaryHsl: hexToHsl('#3B82F6'),
    secondaryHsl: hexToHsl('#1E40AF'),
    accentHsl: hexToHsl('#F59E0B')
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({})
  const [hasChanges, setHasChanges] = useState(false)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const toast = useToast()

  const fontOptions = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Poppins',
    'Montserrat',
    'Source Sans Pro',
    'Nunito'
  ]

  const colorPresets = [
    {
      name: 'Blue Professional',
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#F59E0B'
    },
    {
      name: 'Green Success',
      primary: '#10B981',
      secondary: '#059669',
      accent: '#F59E0B'
    },
    {
      name: 'Purple Creative',
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#F59E0B'
    },
    {
      name: 'Orange Energy',
      primary: '#F97316',
      secondary: '#EA580C',
      accent: '#3B82F6'
    }
  ]

  // Load settings from Firestore
  useEffect(() => {
    loadSettings()
  }, [])

  // Track changes
  useEffect(() => {
    setHasChanges(true)
  }, [settings])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const settingsDoc = await getDoc(doc(db, 'appearance', 'settings'))
      if (settingsDoc.exists()) {
        const data = settingsDoc.data()
        setSettings(prev => ({
          ...prev,
          ...data,
          primaryHsl: data.primaryHsl || hexToHsl(data.primaryColor || '#3B82F6'),
          secondaryHsl: data.secondaryHsl || hexToHsl(data.secondaryColor || '#1E40AF'),
          accentHsl: data.accentHsl || hexToHsl(data.accentColor || '#F59E0B')
        }))
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load appearance settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'appearance', 'settings'), settings, { merge: true })
      setHasChanges(false)
      toast.success('Appearance settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save appearance settings')
    } finally {
      setSaving(false)
    }
  }

  const handlePresetSelect = (preset: typeof colorPresets[0]) => {
    setSettings(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
      primaryHsl: hexToHsl(preset.primary),
      secondaryHsl: hexToHsl(preset.secondary),
      accentHsl: hexToHsl(preset.accent)
    }))
    toast.success(`Applied ${preset.name} color scheme`)
  }

  const handleHslChange = (colorType: 'primary' | 'secondary' | 'accent', hslValue: HSLColor) => {
    const hexColor = hslToHex(hslValue)
    setSettings(prev => ({
      ...prev,
      [`${colorType}Color`]: hexColor,
      [`${colorType}Hsl`]: hslValue
    }))
  }

  const handleFileUpload = async (files: File[], type: 'logo' | 'hero' | 'favicon') => {
    if (files.length === 0) return [{ success: false, error: 'No file selected' }]

    const file = files[0]
    setUploading(prev => ({ ...prev, [type]: true }))

    try {
      let result
      switch (type) {
        case 'logo':
          result = await uploadLogo(file)
          break
        case 'hero':
          result = await uploadHeroImage(file)
          break
        case 'favicon':
          result = await uploadFavicon(file)
          break
        default:
          throw new Error('Invalid upload type')
      }

      if (result.success && result.url) {
        setSettings(prev => ({
          ...prev,
          [`${type}Url`]: result.url!
        }))
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`)
        return [{ success: true, url: result.url }]
      } else {
        toast.error(result.error || `Failed to upload ${type}`)
        return [{ success: false, error: result.error }]
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(`Failed to upload ${type}`)
      return [{ success: false, error: error.message }]
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }))
    }
  }

  const generateAiImagePrompt = async () => {
    setAiGenerating(true)
    try {
      // Simulate AI image prompt generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const prompts = [
        "Professional tech company hero image with modern gradient background, clean typography, and subtle geometric patterns",
        "Educational platform hero with diverse learners, modern classroom setting, and vibrant blue color scheme",
        "Innovation-focused hero image with abstract geometric shapes, professional lighting, and technology elements",
        "Learning and growth themed hero with upward arrow, graduation cap, and professional color palette"
      ]
      
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
      toast.success(`AI Image Prompt: "${randomPrompt}"`)
    } catch (error) {
      toast.error('Failed to generate AI image prompt')
    } finally {
      setAiGenerating(false)
    }
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = 'appearance-settings.json'
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success('Settings exported successfully')
  }

  const HSLSlider = ({ colorType, hslValue }: { colorType: 'primary' | 'secondary' | 'accent', hslValue: HSLColor }) => {
    const colorName = colorType.charAt(0).toUpperCase() + colorType.slice(1)
    
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">{colorName} Color</Label>
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-lg border-2 border-gray-200"
              style={{ backgroundColor: hslToHex(hslValue) }}
            />
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <Label className="text-xs text-gray-500">Hue</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[hslValue.h]}
                      onValueChange={([h]) => handleHslChange(colorType, { ...hslValue, h })}
                      max={360}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{hslValue.h}°</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Saturation</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[hslValue.s]}
                      onValueChange={([s]) => handleHslChange(colorType, { ...hslValue, s })}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{hslValue.s}%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Lightness</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[hslValue.l]}
                      onValueChange={([l]) => handleHslChange(colorType, { ...hslValue, l })}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{hslValue.l}%</span>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <Input
                  value={hslToHex(hslValue)}
                  onChange={(e) => {
                    const hex = e.target.value
                    if (/^#[0-9A-F]{6}$/i.test(hex)) {
                      const hsl = hexToHsl(hex)
                      handleHslChange(colorType, hsl)
                    }
                  }}
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Preview Controls */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3 text-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span>Live Preview</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={previewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('desktop')}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('tablet')}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('mobile')}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className={`border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center transition-all duration-200 ease-out bg-gray-50/50 ${
            previewMode === 'desktop' ? 'max-w-4xl mx-auto' :
            previewMode === 'tablet' ? 'max-w-2xl mx-auto' :
            'max-w-sm mx-auto'
          }`}>
            <div 
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
              style={{
                '--primary-color': settings.primaryColor,
                '--secondary-color': settings.secondaryColor,
                '--accent-color': settings.accentColor,
                fontFamily: settings.fontFamily
              } as React.CSSProperties}
            >
              <div className="text-center mb-6">
                {settings.logoUrl && (
                  <img 
                    src={settings.logoUrl} 
                    alt="Logo" 
                    className="h-12 mx-auto mb-4"
                  />
                )}
                <h1 className="text-2xl font-bold mb-2" style={{ color: settings.primaryColor }}>
                  {settings.siteName}
                </h1>
                <p className="text-gray-600">{settings.siteDescription}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <div className="flex-1 h-10 rounded" style={{ backgroundColor: settings.primaryColor }}></div>
                  <div className="flex-1 h-10 rounded" style={{ backgroundColor: settings.secondaryColor }}></div>
                  <div className="flex-1 h-10 rounded" style={{ backgroundColor: settings.accentColor }}></div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">{settings.fontFamily} Font Family</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="branding" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg border border-gray-100 rounded-xl p-1">
          <TabsTrigger value="branding" className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            <Palette className="w-4 h-4" />
            <span>Branding</span>
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            <Image className="w-4 h-4" />
            <span>Images</span>
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            <Type className="w-4 h-4" />
            <span>Typography</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            <Monitor className="w-4 h-4" />
            <span>Content</span>
          </TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <span>Color Scheme</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Presets */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Quick Presets</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {colorPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetSelect(preset)}
                      className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 ease-out text-left bg-white hover:bg-blue-50/50"
                    >
                      <div className="flex space-x-1 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: preset.primary }}
                        ></div>
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: preset.secondary }}
                        ></div>
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: preset.accent }}
                        ></div>
                      </div>
                      <p className="text-sm font-medium">{preset.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* HSL Color Controls */}
              <div className="space-y-6">
                <HSLSlider colorType="primary" hslValue={settings.primaryHsl} />
                <HSLSlider colorType="secondary" hslValue={settings.secondaryHsl} />
                <HSLSlider colorType="accent" hslValue={settings.accentHsl} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Image className="w-5 h-5 text-white" />
                  </div>
                  <span>Images & Media</span>
                </CardTitle>
                <Button
                  onClick={generateAiImagePrompt}
                  disabled={aiGenerating}
                  variant="outline"
                  size="sm"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Image Prompts
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                {/* Logo Upload */}
                <FileUpload
                  onUpload={(files) => handleFileUpload(files, 'logo')}
                  accept="image/*"
                  maxSize={5}
                  multiple={false}
                  label="Logo"
                  description="Upload your organization logo (max 5MB)"
                  preview={true}
                  uploadedFiles={settings.logoUrl ? [{
                    name: 'Current Logo',
                    url: settings.logoUrl,
                    type: 'image'
                  }] : []}
                  onRemove={() => setSettings(prev => ({ ...prev, logoUrl: '' }))}
                />

                {/* Hero Image Upload */}
                <FileUpload
                  onUpload={(files) => handleFileUpload(files, 'hero')}
                  accept="image/*"
                  maxSize={15}
                  multiple={false}
                  label="Hero Image"
                  description="Upload a hero image for your homepage (max 15MB)"
                  preview={true}
                  uploadedFiles={settings.heroImageUrl ? [{
                    name: 'Current Hero Image',
                    url: settings.heroImageUrl,
                    type: 'image'
                  }] : []}
                  onRemove={() => setSettings(prev => ({ ...prev, heroImageUrl: '' }))}
                />

                {/* Favicon Upload */}
                <FileUpload
                  onUpload={(files) => handleFileUpload(files, 'favicon')}
                  accept=".ico,.png,.svg"
                  maxSize={1}
                  multiple={false}
                  label="Favicon"
                  description="Upload a favicon for your website (max 1MB, .ico, .png, or .svg)"
                  preview={true}
                  uploadedFiles={settings.faviconUrl ? [{
                    name: 'Current Favicon',
                    url: settings.faviconUrl,
                    type: 'image'
                  }] : []}
                  onRemove={() => setSettings(prev => ({ ...prev, faviconUrl: '' }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Type className="w-5 h-5 text-white" />
                </div>
                <span>Typography</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fontFamily" className="text-sm font-medium mb-2 block">
                  Font Family
                </Label>
                <Select 
                  value={settings.fontFamily} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, fontFamily: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font family" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Font Preview:</p>
                <div style={{ fontFamily: settings.fontFamily }}>
                  <h1 className="text-2xl font-bold mb-2">Heading 1</h1>
                  <h2 className="text-xl font-semibold mb-2">Heading 2</h2>
                  <p className="text-base">This is a sample paragraph showing how the selected font family will look in your application.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <span>Content & Text</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName" className="text-sm font-medium mb-2 block">
                  Site Name
                </Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  placeholder="Enter site name"
                />
              </div>

              <div>
                <Label htmlFor="siteDescription" className="text-sm font-medium mb-2 block">
                  Site Description
                </Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  placeholder="Enter site description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="footerText" className="text-sm font-medium mb-2 block">
                  Footer Text
                </Label>
                <Input
                  id="footerText"
                  value={settings.footerText}
                  onChange={(e) => setSettings(prev => ({ ...prev, footerText: e.target.value }))}
                  placeholder="Enter footer text"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Actions */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {hasChanges ? (
                <>
                  <Badge variant="outline" className="border-orange-300 text-orange-600">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Unsaved Changes
                  </Badge>
                  <span className="text-sm text-orange-600">Changes not saved</span>
                </>
              ) : (
                <>
                  <Badge variant="outline" className="border-green-300 text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Saved
                  </Badge>
                  <span className="text-sm text-green-600">All changes saved</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline"
                onClick={exportSettings}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Settings
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 shadow-lg hover:shadow-xl transition-all duration-200 ease-out"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
