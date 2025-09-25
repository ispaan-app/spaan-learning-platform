import { adminDb } from '@/lib/firebase-admin'

// No sample programs - use real data from database

export async function populatePrograms() {
  try {
    console.log('🚀 Checking programs in database...')
    
    // Check if programs already exist
    const programsSnapshot = await adminDb.collection('programs').limit(1).get()
    
    if (programsSnapshot.empty) {
      console.log('📝 No programs found in database')
      return { success: true, message: 'No programs found. Please add programs through the Programs Management interface.', count: 0 }
    } else {
      console.log('✅ Programs already exist in database')
      return { success: true, message: 'Programs already exist in database. Use the Programs Management interface to manage them.', count: programsSnapshot.size }
    }
  } catch (error) {
    console.error('❌ Error checking programs:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Run if called directly
if (require.main === module) {
  populatePrograms()
    .then(result => {
      if (result.success) {
        console.log(`✅ Successfully populated ${result.count} programs`)
        process.exit(0)
      } else {
        console.error('❌ Failed to populate programs:', result.error)
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error)
      process.exit(1)
    })
}

