import { NextRequest, NextResponse } from 'next/server'
import { candidateMatcherFlow } from '@/lib/ai/candidate-matcher'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const result = await candidateMatcherFlow(body)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
