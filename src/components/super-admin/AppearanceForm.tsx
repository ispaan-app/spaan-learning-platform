'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Copy
} from 'lucide-react'

export function AppearanceForm() {
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [imagePrompt, setImagePrompt] = useState('')
  const [concept, setConcept] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      // In a real implementation, you would upload to Firebase Storage
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload/hero-image', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentImage(data.url)
        setSuccess('Hero image updated successfully!')
      } else {
        setError('Failed to upload image. Please try again.')
      }
    } catch (err) {
      setError('An error occurred while uploading. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const generateImagePrompt = async () => {
    if (!concept.trim()) return

    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/ai/image-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ concept })
      })

      if (response.ok) {
        const data = await response.json()
        setImagePrompt(data.prompt)
      } else {
        setError('Failed to generate prompt. Please try again.')
      }
    } catch (err) {
      setError('An error occurred while generating prompt. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateImage = async () => {
    if (!imagePrompt) return

    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/ai/branding-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: imagePrompt })
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedImage(data.imageUrl)
      } else {
        setError('Failed to generate image. Please try again.')
      }
    } catch (err) {
      setError('An error occurred while generating image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const setAsHero = async () => {
    if (!generatedImage) return

    setIsUploading(true)
    setError('')

    try {
      // In a real implementation, you would save the generated image as hero
      const response = await fetch('/api/upload/hero-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: generatedImage })
      })

      if (response.ok) {
        setCurrentImage(generatedImage)
        setSuccess('AI-generated image set as hero image!')
      } else {
        setError('Failed to set hero image. Please try again.')
      }
    } catch (err) {
      setError('An error occurred while setting hero image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Current Hero Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="w-6 h-6" />
            <span>Current Hero Image</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentImage ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={currentImage}
                  alt="Current hero image"
                  className="w-full h-64 object-cover rounded-lg border"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentImage, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(currentImage)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No hero image set. Upload an image or generate one using AI.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-6 h-6" />
            <span>Manual Upload</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Upload Hero Image
            </label>
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Recommended: 1920x1080px, JPG or PNG format, max 5MB</p>
          </div>

          {isUploading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Uploading image...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Image Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="w-6 h-6" />
            <span>AI Branding Image Generator</span>
            <Badge className="bg-purple-100 text-purple-800">AI Powered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Generate Prompt */}
          <div className="space-y-4">
            <div>
              <label htmlFor="concept" className="block text-sm font-medium text-gray-700 mb-2">
                Image Concept
              </label>
              <Input
                id="concept"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g., diverse students working on laptops, modern learning environment..."
                className="w-full"
              />
            </div>
            
            <Button
              onClick={generateImagePrompt}
              disabled={!concept.trim() || isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Generate Prompt
            </Button>
          </div>

          {/* Generated Prompt */}
          {imagePrompt && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generated Prompt
                </label>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-sm text-gray-700">{imagePrompt}</p>
                </div>
              </div>
              
              <Button
                onClick={generateImage}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4 mr-2" />
                )}
                Generate Image
              </Button>
            </div>
          )}

          {/* Generated Image Preview */}
          {generatedImage && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generated Image
                </label>
                <div className="relative">
                  <img
                    src={generatedImage}
                    alt="Generated image"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={setAsHero}
                  disabled={isUploading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUploading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Set as Hero
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(generatedImage, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(generatedImage)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

