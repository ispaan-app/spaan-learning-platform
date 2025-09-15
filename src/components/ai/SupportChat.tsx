'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Lightbulb,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  suggestions?: string[]
  relatedPages?: string[]
}

interface SupportChatProps {
  userRole?: 'learner' | 'admin' | 'super-admin'
}

export function SupportChat({ userRole = 'learner' }: SupportChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    const messageToSend = inputMessage.trim()
    if (!messageToSend) return

    const userMessage: Message = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/support-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          userRole,
          currentPage: window.location.pathname,
          conversationHistory: messages
        })
      })

      const data = await response.json()
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        suggestions: data.suggestions,
        relatedPages: data.relatedPages
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickQuestions = {
    learner: [
      "How do I check in and log hours?",
      "How do I apply for leave?",
      "How do I view my upcoming classes?",
      "How do I report a stipend issue?",
      "How do I update my profile?",
      "How do I access the AI mentor?"
    ],
    admin: [
      "How do I review applications?",
      "How do I manage learner placements?",
      "How do I view audit logs?",
      "How do I generate reports?",
      "How do I manage system settings?",
      "How do I approve/reject applicants?"
    ],
    'super-admin': [
      "How do I manage user roles?",
      "How do I configure system settings?",
      "How do I view advanced analytics?",
      "How do I manage security settings?",
      "How do I troubleshoot system issues?",
      "How do I manage platform-wide settings?"
    ]
  }

  const getRoleColor = () => {
    switch (userRole) {
      case 'learner': return 'bg-blue-600'
      case 'admin': return 'bg-green-600'
      case 'super-admin': return 'bg-purple-600'
      default: return 'bg-gray-600'
    }
  }

  const getRoleLabel = () => {
    switch (userRole) {
      case 'learner': return 'Learner Support'
      case 'admin': return 'Admin Support'
      case 'super-admin': return 'Super Admin Support'
      default: return 'Support'
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-lg transition-all duration-200"
          size="lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className={`${getRoleColor()} text-white p-4 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <span className="font-medium">{getRoleLabel()}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              How can I help you?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Ask me anything about using the platform
            </p>
            <div className="space-y-2">
              {quickQuestions[userRole].slice(0, 3).map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3 text-xs"
                  onClick={() => setInputMessage(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              } rounded-lg p-3 text-sm`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center space-x-1 mb-1">
                    <Lightbulb className="w-3 h-3 text-yellow-600" />
                    <span className="text-xs font-medium">Suggestions:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {message.suggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Pages */}
              {message.relatedPages && message.relatedPages.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center space-x-1 mb-1">
                    <ExternalLink className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-medium">Related:</span>
                  </div>
                  <div className="space-y-1">
                    {message.relatedPages.map((page, idx) => (
                      <Link
                        key={idx}
                        href={page}
                        className="block text-xs text-blue-600 hover:underline"
                      >
                        {page}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            className="flex-1 text-sm"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

