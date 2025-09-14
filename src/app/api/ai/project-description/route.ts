import { NextRequest, NextResponse } from 'next/server'
import { projectDescriptionFlow } from '@/ai/flows/projectDescriptionFlow'

export async function POST(request: NextRequest) {
  try {
    const { name, type } = await request.json()

    if (!name || typeof name !== 'string' || !type || !['project', 'program'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid name or type provided' },
        { status: 400 }
      )
    }

    // For now, return a mock response until we fix the AI integration
    const result = {
      description: `This is a comprehensive ${type} description for "${name}". This ${type} is designed to provide hands-on learning experiences and career development opportunities in the field.`
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error generating project description:', error)
    return NextResponse.json(
      { error: 'Failed to generate project description' },
      { status: 500 }
    )
  }
}
