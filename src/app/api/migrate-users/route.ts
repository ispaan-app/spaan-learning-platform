import { NextRequest, NextResponse } from 'next/server'
import { UserMigrationManager } from '@/lib/user-migration'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'stats'

    switch (action) {
      case 'stats':
        const stats = await UserMigrationManager.getMigrationStats()
        return NextResponse.json({
          success: true,
          data: stats
        })

      case 'list':
        const users = await UserMigrationManager.getAllUsers()
        return NextResponse.json({
          success: true,
          data: users
        })

      case 'export':
        const exportData = await UserMigrationManager.exportUsers()
        return new NextResponse(exportData, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename=users-export.json'
          }
        })

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action'
        }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Migration operation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...options } = await request.json()

    switch (action) {
      case 'create-missing-documents':
        const createResult = await UserMigrationManager.createMissingUserDocuments(options)
        return NextResponse.json({
          success: true,
          data: createResult
        })

      case 'migrate-to-new-structure':
        const migrateResult = await UserMigrationManager.migrateUsersToNewStructure(options)
        return NextResponse.json({
          success: true,
          data: migrateResult
        })

      case 'update-role':
        const { uid, role } = options
        if (!uid || !role) {
          return NextResponse.json({
            success: false,
            message: 'UID and role are required'
          }, { status: 400 })
        }
        
        const roleResult = await UserMigrationManager.updateUserRole(uid, role, options)
        return NextResponse.json({
          success: roleResult,
          message: roleResult ? 'Role updated successfully' : 'Failed to update role'
        })

      case 'update-status':
        const { uid: statusUid, status } = options
        if (!statusUid || !status) {
          return NextResponse.json({
            success: false,
            message: 'UID and status are required'
          }, { status: 400 })
        }
        
        const statusResult = await UserMigrationManager.updateUserStatus(statusUid, status, options)
        return NextResponse.json({
          success: statusResult,
          message: statusResult ? 'Status updated successfully' : 'Failed to update status'
        })

      case 'import':
        const { jsonData } = options
        if (!jsonData) {
          return NextResponse.json({
            success: false,
            message: 'JSON data is required for import'
          }, { status: 400 })
        }
        
        const importResult = await UserMigrationManager.importUsers(jsonData, options)
        return NextResponse.json({
          success: true,
          data: importResult
        })

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action'
        }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Migration operation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}





































