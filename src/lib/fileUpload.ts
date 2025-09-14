import { storage } from './firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  fileName?: string
}

export interface FileUploadOptions {
  folder: string
  fileName?: string
  maxSize?: number // in MB
  allowedTypes?: string[]
}

const DEFAULT_MAX_SIZE = 10 // 10MB
const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]

export const uploadFile = async (
  file: File,
  options: FileUploadOptions
): Promise<UploadResult> => {
  try {
    // Validate file size
    const maxSize = options.maxSize || DEFAULT_MAX_SIZE
    if (file.size > maxSize * 1024 * 1024) {
      return {
        success: false,
        error: `File size exceeds ${maxSize}MB limit`
      }
    }

    // Validate file type
    const allowedTypes = options.allowedTypes || DEFAULT_ALLOWED_TYPES
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `File type ${file.type} is not allowed`
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = options.fileName || `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    // Create storage reference
    const storageRef = ref(storage, `${options.folder}/${fileName}`)
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file)
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return {
      success: true,
      url: downloadURL,
      fileName
    }
  } catch (error: any) {
    console.error('File upload error:', error)
    return {
      success: false,
      error: error.message || 'Upload failed'
    }
  }
}

export const deleteFile = async (fileUrl: string): Promise<boolean> => {
  try {
    // Extract path from URL
    const url = new URL(fileUrl)
    const pathMatch = url.pathname.match(/\/o\/(.+?)\?/)
    
    if (!pathMatch) {
      throw new Error('Invalid file URL')
    }
    
    const filePath = decodeURIComponent(pathMatch[1])
    const fileRef = ref(storage, filePath)
    
    await deleteObject(fileRef)
    return true
  } catch (error: any) {
    console.error('File deletion error:', error)
    return false
  }
}

export const uploadAvatar = async (file: File, userId: string): Promise<UploadResult> => {
  return uploadFile(file, {
    folder: 'avatars',
    fileName: `avatar-${userId}-${Date.now()}.${file.name.split('.').pop()}`,
    maxSize: 5, // 5MB for avatars
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  })
}

export const uploadDocument = async (file: File, userId: string, documentType: string): Promise<UploadResult> => {
  return uploadFile(file, {
    folder: `documents/${userId}`,
    fileName: `${documentType}-${Date.now()}.${file.name.split('.').pop()}`,
    maxSize: 20, // 20MB for documents
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ]
  })
}

export const uploadImage = async (file: File, folder: string, purpose?: string): Promise<UploadResult> => {
  return uploadFile(file, {
    folder: `images/${folder}`,
    fileName: purpose ? `${purpose}-${Date.now()}.${file.name.split('.').pop()}` : undefined,
    maxSize: 10, // 10MB for images
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  })
}

export const uploadLogo = async (file: File): Promise<UploadResult> => {
  return uploadFile(file, {
    folder: 'branding',
    fileName: `logo-${Date.now()}.${file.name.split('.').pop()}`,
    maxSize: 5, // 5MB for logos
    allowedTypes: ['image/jpeg', 'image/png', 'image/svg+xml']
  })
}

export const uploadHeroImage = async (file: File): Promise<UploadResult> => {
  return uploadFile(file, {
    folder: 'branding',
    fileName: `hero-${Date.now()}.${file.name.split('.').pop()}`,
    maxSize: 15, // 15MB for hero images
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  })
}

export const uploadFavicon = async (file: File): Promise<UploadResult> => {
  return uploadFile(file, {
    folder: 'branding',
    fileName: `favicon-${Date.now()}.${file.name.split('.').pop()}`,
    maxSize: 1, // 1MB for favicons
    allowedTypes: ['image/x-icon', 'image/png', 'image/svg+xml']
  })
}

// Utility function to convert file to base64 for preview
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Utility function to validate image dimensions
export const validateImageDimensions = (
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve(img.width <= maxWidth && img.height <= maxHeight)
    }
    img.onerror = () => resolve(false)
    img.src = URL.createObjectURL(file)
  })
}


