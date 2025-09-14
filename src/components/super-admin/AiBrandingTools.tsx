'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Palette, 
  RefreshCw, 
  Download, 
  Copy,
  Check,
  Image,
  Wand2,
  Eye,
  Upload
} from 'lucide-react'

interface BrandingToolsProps {
  onImageGenerated?: (imageUrl: string) => void
}

export function BrandingTools({ onImageGenerated }: BrandingToolsProps) {
  const [concept, setConcept] = useState('')
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState('')
  const [copied, setCopied] = useState(false)

  const generateImagePrompt = async () => {
    if (!concept.trim()) return

    setIsGeneratingPrompt(true)
    
    try {
      const response = await fetch('/api/ai/image-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ concept })
      })

      const data = await response.json()
      setGeneratedPrompt(data.prompt)
    } catch (error) {
      console.error('Error generating prompt:', error)
    }
    
    setIsGeneratingPrompt(false)
  }

  const generateBrandingImage = async () => {
    if (!generatedPrompt) return

    setIsGeneratingImage(true)
    
    try {
      const response = await fetch('/api/ai/branding-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: generatedPrompt })
      })

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
      onImageGenerated?.(data.imageUrl)
    } catch (error) {
      console.error('Error generating image:', error)
    }
    
    setIsGeneratingImage(false)
  }

  const handleCopyPrompt = async () => {
    if (generatedPrompt) {
      await navigator.clipboard.writeText(generatedPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownloadImage = () => {
    if (generatedImage) {
      const a = document.createElement('a')
      a.href = generatedImage
      a.download = 'branding-hero-image.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="w-6 h-6 text-pink-600" />
            <CardTitle className="text-pink-900">AI Branding Tools</CardTitle>
          </div>
          <Badge className="bg-pink-100 text-pink-800">Creative AI</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Concept Input */}
        <div className="space-y-4">
          <div>
            <label htmlFor="concept" className="block text-sm font-medium text-gray-700 mb-2">
              Branding Concept
            </label>
            <Input
              id="concept"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g., tech skills for the future, modern learning, career development..."
              className="w-full"
            />
          </div>

          <Button
            onClick={generateImagePrompt}
            disabled={!concept.trim() || isGeneratingPrompt}
            className="w-full bg-pink-600 hover:bg-pink-700"
          >
            {isGeneratingPrompt ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            {isGeneratingPrompt ? 'Generating Prompt...' : 'Generate Image Prompt'}
          </Button>
        </div>

        {/* Step 2: Generated Prompt */}
        {generatedPrompt && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Generated Prompt</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPrompt}
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>

            <div className="bg-white rounded-lg border border-pink-200 p-4">
              <Textarea
                value={generatedPrompt}
                readOnly
                className="w-full min-h-[100px] resize-none"
              />
            </div>

            <Button
              onClick={generateBrandingImage}
              disabled={isGeneratingImage}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isGeneratingImage ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Image className="w-4 h-4 mr-2" />
              )}
              {isGeneratingImage ? 'Generating Image...' : 'Generate Branding Image'}
            </Button>
          </div>
        )}

        {/* Step 3: Generated Image */}
        {generatedImage && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Generated Image</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(generatedImage, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadImage}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-pink-200 p-4">
              <img
                src={generatedImage}
                alt="Generated branding image"
                className="w-full h-auto rounded-lg"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Usage Instructions</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Download the image and upload it as your landing page hero image</li>
                <li>• Ensure the image meets your platform's visual guidelines</li>
                <li>• Consider adding your logo overlay if needed</li>
                <li>• Test the image on different screen sizes for responsiveness</li>
              </ul>
            </div>
          </div>
        )}

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-pink-600">
          <div className="flex items-center space-x-2">
            <Wand2 className="w-4 h-4" />
            <span>AI prompt generation</span>
          </div>
          <div className="flex items-center space-x-2">
            <Image className="w-4 h-4" />
            <span>High-quality image creation</span>
          </div>
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Easy download & usage</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

