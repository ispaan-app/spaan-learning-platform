'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  RefreshCw, 
  Copy,
  Check,
  Edit3,
  Save,
  X
} from 'lucide-react'

interface ProjectData {
  name: string
  type: 'project' | 'program'
  description?: string
}

interface AiContentAssistantProps {
  onDescriptionGenerated?: (description: string) => void
  initialData?: ProjectData
}

export function AiContentAssistant({ onDescriptionGenerated, initialData }: AiContentAssistantProps) {
  const [projectData, setProjectData] = useState<ProjectData>({
    name: initialData?.name || '',
    type: initialData?.type || 'program',
    description: initialData?.description || ''
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateDescription = async () => {
    if (!projectData.name.trim()) return

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/project-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectData.name,
          type: projectData.type
        })
      })

      const data = await response.json()
      setProjectData(prev => ({ ...prev, description: data.description }))
      onDescriptionGenerated?.(data.description)
    } catch (error) {
      console.error('Error generating description:', error)
    }
    
    setIsGenerating(false)
  }

  const handleCopy = async () => {
    if (projectData.description) {
      await navigator.clipboard.writeText(projectData.description)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSave = () => {
    setIsEditing(false)
    onDescriptionGenerated?.(projectData.description || '')
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-green-600" />
            <CardTitle className="text-green-900">AI Content Assistant</CardTitle>
          </div>
          <Badge className="bg-green-100 text-green-800">Project Helper</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                Project/Program Name
              </label>
              <Input
                id="projectName"
                value={projectData.name}
                onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Advanced Data Science Program"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                id="projectType"
                value={projectData.type}
                onChange={(e) => setProjectData(prev => ({ ...prev, type: e.target.value as 'project' | 'program' }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="program">Program</option>
                <option value="project">Project</option>
              </select>
            </div>
          </div>

          <Button
            onClick={generateDescription}
            disabled={!projectData.name.trim() || isGenerating}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <BookOpen className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Generating Description...' : 'Generate Description'}
          </Button>
        </div>

        {/* Generated Description */}
        {projectData.description && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Generated Description</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 mr-1" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-green-200 p-4">
              {isEditing ? (
                <div className="space-y-4">
                  <Textarea
                    value={projectData.description}
                    onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full min-h-[200px] resize-none"
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <p className="text-gray-900 leading-relaxed">{projectData.description}</p>
                </div>
              )}
            </div>

            {/* Usage Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Usage Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Review and edit the generated description to match your specific requirements</li>
                <li>• Ensure the description aligns with your platform's tone and style</li>
                <li>• Add specific details about duration, prerequisites, or unique features</li>
                <li>• Consider adding call-to-action elements if appropriate</li>
              </ul>
            </div>
          </div>
        )}

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-600">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Professional descriptions</span>
          </div>
          <div className="flex items-center space-x-2">
            <Edit3 className="w-4 h-4" />
            <span>Easy editing & customization</span>
          </div>
          <div className="flex items-center space-x-2">
            <Copy className="w-4 h-4" />
            <span>Quick copy & paste</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

