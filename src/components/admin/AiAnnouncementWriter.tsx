'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  RefreshCw, 
  Edit3, 
  Send,
  Copy,
  Check
} from 'lucide-react'

interface AnnouncementDraft {
  subject: string
  message: string
  tone: string
  targetAudience: string
}

interface AiAnnouncementWriterProps {
  onDraftGenerated?: (draft: AnnouncementDraft) => void
}

export function AiAnnouncementWriter({ onDraftGenerated }: AiAnnouncementWriterProps) {
  const [topic, setTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [draft, setDraft] = useState<AnnouncementDraft | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateAnnouncement = async () => {
    if (!topic.trim()) return

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/announcement-writer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic })
      })

      const data = await response.json()
      setDraft(data.draft)
      setIsEditing(false)
      onDraftGenerated?.(data.draft)
    } catch (error) {
      console.error('Error generating announcement:', error)
    }
    
    setIsGenerating(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
    if (draft) {
      onDraftGenerated?.(draft)
    }
  }

  const handleCopy = async () => {
    if (draft) {
      const text = `Subject: ${draft.subject}\n\n${draft.message}`
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePublish = () => {
    // In a real implementation, this would publish the announcement
    console.log('Publishing announcement:', draft)
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <CardTitle className="text-purple-900">AI Announcement Writer</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!draft ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                Announcement Topic
              </label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., holiday schedule, new course launch, system maintenance..."
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-600">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4" />
                <span>Professional tone</span>
              </div>
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Clear messaging</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>AI-generated content</span>
              </div>
            </div>

            <Button
              onClick={generateAnnouncement}
              disabled={!topic.trim() || isGenerating}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Announcement'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Draft Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge className="bg-purple-100 text-purple-800">Draft</Badge>
                <Badge variant="outline">{draft.tone}</Badge>
                <Badge variant="outline">{draft.targetAudience}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  disabled={isEditing}
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
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
              </div>
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line
              </label>
              {isEditing ? (
                <Input
                  value={draft.subject}
                  onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                  className="w-full"
                />
              ) : (
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <p className="font-medium text-gray-900">{draft.subject}</p>
                </div>
              )}
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Body
              </label>
              {isEditing ? (
                <Textarea
                  value={draft.message}
                  onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                  className="w-full min-h-[200px]"
                />
              ) : (
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="whitespace-pre-wrap text-gray-900">{draft.message}</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing ? (
              <div className="flex space-x-3">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Button
                  onClick={handlePublish}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Publish Announcement
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDraft(null)
                    setTopic('')
                  }}
                  className="flex-1"
                >
                  Generate New
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

