'use server'

import { logDocumentUploaded, logDocumentReviewed } from './auditLogActions'
import { createDocumentStatusTimelineEvent } from './timeline-actions'

import { adminDb, adminStorage } from '@/lib/firebase-admin'
import { z } from 'zod'

const DocumentUploadSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  documentType: z.enum(['certifiedId', 'proofOfAddress', 'highestQualification', 'proofOfBanking', 'taxNumber']),
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().min(1, 'File size must be greater than 0'),
  fileType: z.string().min(1, 'File type is required'),
})

export async function uploadDocument(formData: FormData) {
  try {
    const userId = formData.get('userId') as string
    const documentType = formData.get('documentType') as string
    const file = formData.get('file') as File

    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files.' }
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size too large. Maximum size is 10MB.' }
    }

    // Validate input
    const validatedData = DocumentUploadSchema.parse({
      userId,
      documentType,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Firebase Storage
    const fileName = `${userId}/${documentType}/${Date.now()}_${file.name}`
    const bucket = adminStorage.bucket('ispaan-app.firebasestorage.app')
    const fileUpload = bucket.file(fileName)

    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
        userId,
        documentType,
        originalName: file.name,
      }
    })

    // Get download URL
    const [url] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Long expiration
    })

    // Save document record to Firestore
    const documentData = {
      userId,
      documentType,
      fileName: file.name,
      storagePath: fileName,
      downloadUrl: url,
      fileSize: file.size,
      fileType: file.type,
      status: 'pending',
      uploadedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
    }

    const docRef = await adminDb.collection('documents').add(documentData)

    // Update user's document status
    await adminDb.collection('users').doc(userId).update({
      [`documents.${documentType}`]: {
        status: 'pending',
        uploadedAt: new Date(),
        documentId: docRef.id,
      },
      updatedAt: new Date(),
    })

    // Audit log: document uploaded
    await logDocumentUploaded(userId, 'applicant', documentType, { fileName: file.name, documentId: docRef.id })

    // Create notification for applicant
    await adminDb.collection('notifications').add({
      userId,
      type: 'document-uploaded',
      documentType,
      documentId: docRef.id,
      message: `Your ${documentType} has been uploaded and is pending review.`,
      read: false,
      createdAt: new Date(),
    })
    return { 
      success: true, 
      documentId: docRef.id,
      message: 'Document uploaded successfully!'
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to upload document' }
  }
}

export async function reviewDocument(documentId: string, status: 'approved' | 'rejected', reviewedBy: string, rejectionReason?: string) {
  try {
    const updateData: any = {
      status,
      reviewedAt: new Date(),
      reviewedBy,
    }

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason
    }

    // Update document status
    await adminDb.collection('documents').doc(documentId).update(updateData)

    // Get document details
    const docSnapshot = await adminDb.collection('documents').doc(documentId).get()
    const document = docSnapshot.data()

    if (!document) {
      return { success: false, error: 'Document not found' }
    }

    // Update user's document status
    await adminDb.collection('users').doc(document.userId).update({
      [`documents.${document.documentType}`]: {
        status,
        reviewedAt: new Date(),
        reviewedBy,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
      },
      updatedAt: new Date(),
    })

    // Create notification for applicant
    await adminDb.collection('notifications').add({
      userId: document.userId,
      type: 'document-reviewed',
      documentType: document.documentType,
      documentId,
      status,
      message: status === 'approved'
        ? `Your ${document.documentType} has been approved.`
        : `Your ${document.documentType} was rejected: ${rejectionReason || 'No reason provided.'}`,
      read: false,
      createdAt: new Date(),
    })

    // Audit log: document reviewed
    await logDocumentReviewed(document.userId, 'admin', document.documentType, status, { documentId, reviewedBy, rejectionReason })
    
    // Create timeline event
    await createDocumentStatusTimelineEvent(
      document.userId,
      document.documentType,
      status,
      reviewedBy,
      rejectionReason
    )
    
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to review document' }
  }
}

export async function getUserDocuments(userId: string) {
  try {
    const documentsSnapshot = await adminDb
      .collection('documents')
      .where('userId', '==', userId)
      .orderBy('uploadedAt', 'desc')
      .get()

    const documents = documentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return { success: true, documents }
  } catch (error) {
    return { success: false, error: 'Failed to fetch documents' }
  }
}

export async function getAllPendingDocuments() {
  try {
    const documentsSnapshot = await adminDb
      .collection('documents')
      .where('status', '==', 'pending')
      .orderBy('uploadedAt', 'asc')
      .get()

    const documents = documentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return { success: true, documents }
  } catch (error) {
    return { success: false, error: 'Failed to fetch pending documents' }
  }
}

export async function getApplicantDocumentsAction(userId: string) {
  try {
    const documentsSnapshot = await adminDb
      .collection('documents')
      .where('userId', '==', userId)
      .orderBy('uploadedAt', 'desc')
      .get()

    const documents = documentsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().fileName || '',
      type: doc.data().documentType || '',
      status: doc.data().status || 'pending',
      url: doc.data().downloadUrl || '',
      uploadedAt: doc.data().uploadedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      fileSize: doc.data().fileSize || 0,
      fileType: doc.data().fileType || '',
      description: doc.data().description || ''
    }))

    return { success: true, documents }
  } catch (error) {
    console.error('Error fetching applicant documents:', error)
    return { success: false, error: 'Failed to fetch documents' }
  }
}

