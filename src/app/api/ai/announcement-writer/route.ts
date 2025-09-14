import { NextRequest, NextResponse } from 'next/server'
import { announcementWriterFlow } from '@/ai/flows/announcementWriterFlow'

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json()

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Invalid topic provided' },
        { status: 400 }
      )
    }

    // For now, return a mock response until we fix the AI integration
    const result = {
      draft: {
        subject: `Announcement: ${topic}`,
        message: `This is a placeholder announcement about ${topic}. Please configure your AI API key to generate real content.`,
        tone: 'Professional',
        targetAudience: 'All Users'
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in announcement generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate announcement' },
      { status: 500 }
    )
  }
}
