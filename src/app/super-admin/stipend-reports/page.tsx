import { AdminLayout } from '@/components/admin/AdminLayout'
import { StipendReportsManagement } from '@/components/super-admin/StipendReportsManagement'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore'

interface StipendReport {
  id: string
  learnerId: string
  learnerName: string
  placementId: string
  companyName: string
  month: string
  year: number
  status: 'pending' | 'resolved'
  submittedAt: Date
  resolvedAt?: Date
  resolvedBy?: string
  notes?: string
  amount?: number
  issue?: string
}

// Helper function to serialize Firestore data
function serializeData(data: any): any {
  if (data === null || data === undefined) {
    return data
  }
  
  if (data instanceof Date) {
    return data.toISOString()
  }
  
  if (Array.isArray(data)) {
    return data.map(serializeData)
  }
  
  if (typeof data === 'object' && data.constructor === Object) {
    const serialized: any = {}
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeData(value)
    }
    return serialized
  }
  
  return data
}

async function getStipendReports(): Promise<StipendReport[]> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'stipendReports'),
        orderBy('submittedAt', 'desc'),
        limit(50)
      )
    )
    
    return serializeData(snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.() || new Date(),
      resolvedAt: doc.data().resolvedAt?.toDate?.() || null
    }))) as StipendReport[]
  } catch (error) {
    console.error('Error fetching stipend reports:', error)
    return []
  }
}

export default async function StipendReportsPage() {
  const stipendReports = await getStipendReports()

  return (
    <AdminLayout userRole="super-admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stipend Reports Management</h1>
          <p className="text-gray-600 mt-2">
            Monitor and resolve payment issues, manage stipend disbursements
          </p>
        </div>

        <StipendReportsManagement initialReports={stipendReports} />
      </div>
    </AdminLayout>
  )
}