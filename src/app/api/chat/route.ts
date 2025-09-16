import { NextRequest, NextResponse } from 'next/server'
// Mock chat implementation - AI flows temporarily disabled

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // For now, return a mock response until we fix the AI integration
    const response = `Thank you for your question: "${message}". This is a placeholder response from the AI tutor. Please configure your AI API key to get real responses.`

    return NextResponse.json({
      success: true,
      response
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
