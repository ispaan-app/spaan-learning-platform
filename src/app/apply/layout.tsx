import React from 'react'

interface ApplyLayoutProps {
  children: React.ReactNode
}

export default function ApplyLayout({ children }: ApplyLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  )
}

