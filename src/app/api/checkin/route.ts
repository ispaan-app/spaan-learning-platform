import { NextRequest, NextResponse } from 'next/server'
import { createCheckIn, createCheckOut, getLearnerCheckIns, getLearnerProgress } from '@/app/actions/checkinActions'

export async function POST(request: NextRequest) {
  try {
    const { action, learnerId, checkInId, ...data } = await request.json()

    if (!learnerId) {
      return NextResponse.json(
        { success: false, error: 'Learner ID is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'checkin':
        const checkInResult = await createCheckIn(learnerId, data)
        return NextResponse.json(checkInResult)

      case 'checkout':
        if (!checkInId) {
          return NextResponse.json(
            { success: false, error: 'Check-in ID is required for checkout' },
            { status: 400 }
          )
        }
        const checkOutResult = await createCheckOut(learnerId, checkInId, data.notes)
        return NextResponse.json(checkOutResult)

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use "checkin" or "checkout"' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Check-in API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const learnerId = searchParams.get('learnerId')
    const action = searchParams.get('action')

    if (!learnerId) {
      return NextResponse.json(
        { success: false, error: 'Learner ID is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'progress':
        const progressResult = await getLearnerProgress(learnerId)
        return NextResponse.json(progressResult)

      case 'checkins':
        const checkInsResult = await getLearnerCheckIns(learnerId)
        return NextResponse.json(checkInsResult)

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use "progress" or "checkins"' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Check-in API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
