'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Image as ImageIcon,
  FileText,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file') => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
  className
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
      setIsExpanded(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // For now, just send as text with file info
      // In a real implementation, you'd upload the file and get a URL
      const fileInfo = `📎 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`
      onSendMessage(fileInfo, 'file')
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      // For now, just send as text with image info
      // In a real implementation, you'd upload the image and get a URL
      const imageInfo = `🖼️ ${file.name} (${(file.size / 1024).toFixed(1)}KB)`
      onSendMessage(imageInfo, 'image')
    }
  }

  return (
    <div className={cn("border-t bg-white p-4", className)}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* File Inputs (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="*/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          id="image-input"
        />

        {/* Message Input */}
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsExpanded(true)}
              onBlur={() => {
                if (!message.trim()) {
                  setIsExpanded(false)
                }
              }}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "min-h-[40px] max-h-32 resize-none",
                isExpanded && "min-h-[80px]"
              )}
              rows={1}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('image-input')?.click()}
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expanded Actions */}
        {isExpanded && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMessage('')
                  setIsExpanded(false)
                }}
                className="text-gray-500"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={!message.trim() || disabled}
                className="flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </Button>
            </div>
          </div>
        )}

        {/* Compact Send Button (when not expanded) */}
        {!isExpanded && message.trim() && (
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={disabled}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
