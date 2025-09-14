import { NextRequest, NextResponse } from 'next/server'
import { brandingImageFlow } from '@/ai/flows/brandingImageFlow'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt provided' },
        { status: 400 }
      )
    }

    // For now, return a mock response until we fix the AI integration
    const result = {
      imageUrl: `https://via.placeholder.com/1920x1080/4F46E5/FFFFFF?text=${encodeURIComponent(prompt)}`
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating branding image:', error)
    return NextResponse.json(
      { error: 'Failed to generate branding image' },
      { status: 500 }
    )
  }
}
