'use server'

import { adminDb } from '@/lib/firebase-admin'

export interface Report {
  id: string
  name: string
  type: 'Analytics' | 'Financial' | 'Technical' | 'Security' | 'User' | 'System'
  status: 'completed' | 'running' | 'failed' | 'pending'
  created: string
  lastRun: string
  size: string
  downloads: number
  description: string
  generatedBy?: string
  parameters?: Record<string, any>
}

export async function getReports(): Promise<Report[]> {
  try {
    // Get reports from Firestore
    const reportsSnapshot = await adminDb.collection('reports').orderBy('created', 'desc').get()
    
    if (reportsSnapshot.empty) {
      // If no reports exist, create some default reports
      return await createDefaultReports()
    }

    return reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created: doc.data().created?.toDate?.()?.toISOString().split('T')[0] || doc.data().created,
      lastRun: doc.data().lastRun?.toDate?.()?.toISOString().replace('T', ' ').split('.')[0] || doc.data().lastRun
    })) as Report[]
  } catch (error) {
    console.error('Error fetching reports:', error)
    return await createDefaultReports()
  }
}

export async function generateReport(
  reportType: string, 
  parameters: Record<string, any> = {},
  generatedBy: string
): Promise<{ success: boolean; reportId?: string; error?: string }> {
  try {
    const reportId = `report_${Date.now()}`
    const now = new Date()
    
    const reportData = {
      name: getReportName(reportType),
      type: getReportType(reportType),
      status: 'running',
      created: now,
      lastRun: now,
      size: '0 MB',
      downloads: 0,
      description: getReportDescription(reportType),
      generatedBy,
      parameters,
      createdAt: now,
      updatedAt: now
    }

    // Save report to Firestore
    await adminDb.collection('reports').doc(reportId).set(reportData)

    // Simulate report generation (in real implementation, this would trigger actual report generation)
    setTimeout(async () => {
      const reportSize = Math.floor(Math.random() * 5000) + 1000 // 1-6 MB
      await adminDb.collection('reports').doc(reportId).update({
        status: 'completed',
        size: `${(reportSize / 1000).toFixed(1)} MB`,
        lastRun: new Date()
      })
    }, 5000) // 5 second delay

    return { success: true, reportId }
  } catch (error) {
    console.error('Error generating report:', error)
    return { success: false, error: 'Failed to generate report' }
  }
}

export async function downloadReport(reportId: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Update download count
    const reportRef = adminDb.collection('reports').doc(reportId)
    const reportDoc = await reportRef.get()
    
    if (!reportDoc.exists) {
      return { success: false, error: 'Report not found' }
    }

    const currentDownloads = reportDoc.data()?.downloads || 0
    await reportRef.update({ downloads: currentDownloads + 1 })

    // In a real implementation, this would generate and return a download URL
    // For now, we'll return a mock URL
    return { 
      success: true, 
      url: `/api/reports/download/${reportId}` 
    }
  } catch (error) {
    console.error('Error downloading report:', error)
    return { success: false, error: 'Failed to download report' }
  }
}

async function createDefaultReports(): Promise<Report[]> {
  const defaultReports: Omit<Report, 'id'>[] = [
    {
      name: 'Monthly User Analytics',
      type: 'Analytics',
      status: 'completed',
      created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
      size: '2.4 MB',
      downloads: 15,
      description: 'Comprehensive user analytics for the past month'
    },
    {
      name: 'System Performance Report',
      type: 'Technical',
      status: 'completed',
      created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
      size: '1.8 MB',
      downloads: 8,
      description: 'System performance metrics and health indicators'
    },
    {
      name: 'Security Audit Report',
      type: 'Security',
      status: 'completed',
      created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
      size: '3.2 MB',
      downloads: 22,
      description: 'Comprehensive security audit and compliance report'
    }
  ]

  // Save default reports to Firestore
  const batch = adminDb.batch()
  defaultReports.forEach((report, index) => {
    const reportRef = adminDb.collection('reports').doc()
    batch.set(reportRef, {
      ...report,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  })
  
  try {
    await batch.commit()
  } catch (error) {
    console.error('Error creating default reports:', error)
  }

  return defaultReports.map((report, index) => ({
    id: `default_${index}`,
    ...report
  }))
}

function getReportName(reportType: string): string {
  const names: Record<string, string> = {
    'user_analytics': 'User Analytics Report',
    'revenue': 'Revenue Analysis Report',
    'system_performance': 'System Performance Report',
    'security_audit': 'Security Audit Report',
    'user_engagement': 'User Engagement Analysis',
    'attendance': 'Attendance Report',
    'placements': 'Placement Analysis Report'
  }
  return names[reportType] || 'Custom Report'
}

function getReportType(reportType: string): Report['type'] {
  const types: Record<string, Report['type']> = {
    'user_analytics': 'Analytics',
    'revenue': 'Financial',
    'system_performance': 'Technical',
    'security_audit': 'Security',
    'user_engagement': 'Analytics',
    'attendance': 'Analytics',
    'placements': 'Analytics'
  }
  return types[reportType] || 'Analytics'
}

function getReportDescription(reportType: string): string {
  const descriptions: Record<string, string> = {
    'user_analytics': 'Comprehensive analysis of user behavior and platform usage',
    'revenue': 'Financial metrics and revenue analysis',
    'system_performance': 'System health and performance indicators',
    'security_audit': 'Security compliance and audit findings',
    'user_engagement': 'Detailed analysis of user engagement patterns',
    'attendance': 'Attendance tracking and analysis report',
    'placements': 'Work placement analysis and outcomes'
  }
  return descriptions[reportType] || 'Custom report generated from platform data'
}


