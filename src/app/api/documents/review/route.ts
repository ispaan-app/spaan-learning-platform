import { NextRequest, NextResponse } from 'next/server'
import { reviewDocument } from '@/app/actions/documentActions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentId, status, reviewedBy, rejectionReason } = body

    if (!documentId || !status || !reviewedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be approved or rejected' },
        { status: 400 }
      )
    }

    const result = await reviewDocument(
      documentId,
      status as 'approved' | 'rejected',
      reviewedBy,
      rejectionReason
    )

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to review document' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in document review API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
