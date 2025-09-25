import { NextRequest, NextResponse } from 'next/server'
import { backupService } from '@/lib/backup-service'
import { requireSuperAdmin } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Create backup
export async function POST(request: NextRequest) {
  try {
    // Check if user is super admin
    const authResult = await requireSuperAdmin(request)
    if (!authResult.allowed) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const metadata = await backupService.createBackup()
    
    return NextResponse.json({
      success: true,
      backup: metadata
    })
  } catch (error) {
    console.error('Backup creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    )
  }
}

// List backups
export async function GET(request: NextRequest) {
  try {
    // Check if user is super admin
    const authResult = await requireSuperAdmin(request)
    if (!authResult.allowed) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const backups = await backupService.listBackups()
    const stats = await backupService.getBackupStats()
    
    return NextResponse.json({
      success: true,
      backups,
      stats
    })
  } catch (error) {
    console.error('Backup listing error:', error)
    return NextResponse.json(
      { error: 'Failed to list backups' },
      { status: 500 }
    )
  }
}

// Delete backup
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is super admin
    const authResult = await requireSuperAdmin(request)
    if (!authResult.allowed) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const backupId = searchParams.get('id')
    
    if (!backupId) {
      return NextResponse.json(
        { error: 'Backup ID required' },
        { status: 400 }
      )
    }

    await backupService.deleteBackup(backupId)
    
    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully'
    })
  } catch (error) {
    console.error('Backup deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete backup' },
      { status: 500 }
    )
  }
}
