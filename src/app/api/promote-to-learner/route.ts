import { NextRequest, NextResponse } from 'next/server'
import { approveApplicantAndPromoteToLearner, checkDocumentApprovalStatus } from '@/app/actions/userActions'

export async function POST(request: NextRequest) {
  try {
    const { userId, approvedBy } = await request.json()

    if (!userId || !approvedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId and approvedBy' },
        { status: 400 }
      )
    }

    // First check if the applicant can be promoted
    const statusCheck = await checkDocumentApprovalStatus(userId)
    
    if (!statusCheck.success) {
      return NextResponse.json(
        { success: false, error: statusCheck.error },
        { status: 400 }
      )
    }

    if (!statusCheck.canPromote) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot promote to learner',
          details: {
            allApproved: statusCheck.allApproved,
            approvedCount: statusCheck.approvedCount,
            totalRequired: statusCheck.totalRequired,
            documentStatus: statusCheck.documentStatus
          }
        },
        { status: 400 }
      )
    }

    // Promote the applicant to learner
    const result = await approveApplicantAndPromoteToLearner(userId, approvedBy)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error promoting applicant to learner:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const statusCheck = await checkDocumentApprovalStatus(userId)
    
    if (!statusCheck.success) {
      return NextResponse.json(
        { success: false, error: statusCheck.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      ...statusCheck,
      success: true
    })
  } catch (error) {
    console.error('Error checking promotion status:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
