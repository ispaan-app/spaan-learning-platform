// Comprehensive database schema definitions with proper indexing and relationships

export interface DatabaseSchema {
  collections: {
    users: UserSchema
    applications: ApplicationSchema
    learners: LearnerSchema
    placements: PlacementSchema
    companies: CompanySchema
    documents: DocumentSchema
    notifications: NotificationSchema
    activities: ActivitySchema
    leaveRequests: LeaveRequestSchema
    issueReports: IssueReportSchema
    auditLogs: AuditLogSchema
    systemConfig: SystemConfigSchema
  }
  indexes: IndexDefinition[]
  relationships: RelationshipDefinition[]
}

export interface UserSchema {
  fields: {
    id: FieldDefinition
    email: FieldDefinition
    displayName: FieldDefinition
    firstName: FieldDefinition
    lastName: FieldDefinition
    role: FieldDefinition
    status: FieldDefinition
    phone: FieldDefinition
    profile: FieldDefinition
    preferences: FieldDefinition
    lastLoginAt: FieldDefinition
    isActive: FieldDefinition
    createdAt: FieldDefinition
    updatedAt: FieldDefinition
    createdBy: FieldDefinition
    updatedBy: FieldDefinition
    version: FieldDefinition
  }
  indexes: string[]
  constraints: ConstraintDefinition[]
}

export interface ApplicationSchema {
  fields: {
    id: FieldDefinition
    userId: FieldDefinition
    program: FieldDefinition
    motivation: FieldDefinition
    experience: FieldDefinition
    availability: FieldDefinition
    status: FieldDefinition
    priority: FieldDefinition
    documents: FieldDefinition
    emergencyContact: FieldDefinition
    reviewNotes: FieldDefinition
    reviewedBy: FieldDefinition
    reviewedAt: FieldDefinition
    approvedAt: FieldDefinition
    rejectedAt: FieldDefinition
    rejectionReason: FieldDefinition
    createdAt: FieldDefinition
    updatedAt: FieldDefinition
    version: FieldDefinition
  }
  indexes: string[]
  constraints: ConstraintDefinition[]
}

export interface LearnerSchema {
  fields: {
    id: FieldDefinition
    userId: FieldDefinition
    program: FieldDefinition
    startDate: FieldDefinition
    endDate: FieldDefinition
    status: FieldDefinition
    placement: FieldDefinition
    progress: FieldDefinition
    achievements: FieldDefinition
    activities: FieldDefinition
    createdAt: FieldDefinition
    updatedAt: FieldDefinition
    version: FieldDefinition
  }
  indexes: string[]
  constraints: ConstraintDefinition[]
}

export interface PlacementSchema {
  fields: {
    id: FieldDefinition
    learnerId: FieldDefinition
    companyId: FieldDefinition
    position: FieldDefinition
    description: FieldDefinition
    startDate: FieldDefinition
    endDate: FieldDefinition
    status: FieldDefinition
    supervisor: FieldDefinition
    requirements: FieldDefinition
    benefits: FieldDefinition
    stipend: FieldDefinition
    hours: FieldDefinition
    milestones: FieldDefinition
    feedback: FieldDefinition
    createdAt: FieldDefinition
    updatedAt: FieldDefinition
    version: FieldDefinition
  }
  indexes: string[]
  constraints: ConstraintDefinition[]
}

export interface CompanySchema {
  fields: {
    id: FieldDefinition
    name: FieldDefinition
    description: FieldDefinition
    industry: FieldDefinition
    size: FieldDefinition
    location: FieldDefinition
    website: FieldDefinition
    logo: FieldDefinition
    contact: FieldDefinition
    rating: FieldDefinition
    reviews: FieldDefinition
    isActive: FieldDefinition
    createdAt: FieldDefinition
    updatedAt: FieldDefinition
    version: FieldDefinition
  }
  indexes: string[]
  constraints: ConstraintDefinition[]
}

export interface DocumentSchema {
  fields: {
    id: FieldDefinition
    userId: FieldDefinition
    applicationId: FieldDefinition
    name: FieldDefinition
    type: FieldDefinition
    status: FieldDefinition
    url: FieldDefinition
    size: FieldDefinition
    mimeType: FieldDefinition
    uploadedAt: FieldDefinition
    reviewedAt: FieldDefinition
    reviewedBy: FieldDefinition
    rejectionReason: FieldDefinition
    required: FieldDefinition
    category: FieldDefinition
    createdAt: FieldDefinition
    updatedAt: FieldDefinition
    version: FieldDefinition
  }
  indexes: string[]
  constraints: ConstraintDefinition[]
}

export interface NotificationSchema {
  fields: {
    id: FieldDefinition
    userId: FieldDefinition
    type: FieldDefinition
    title: FieldDefinition
    message: FieldDefinition
    data: FieldDefinition
    read: FieldDefinition
    readAt: FieldDefinition
    priority: FieldDefinition
    category: FieldDefinition
    actionUrl: FieldDefinition
    expiresAt: FieldDefinition
    createdAt: FieldDefinition
    updatedAt: FieldDefinition
    version: FieldDefinition
  }
  indexes: string[]
  constraints: ConstraintDefinition[]
}

export interface ActivitySchema {
  fields: {
    id: FieldDefinition
    userId: FieldDefinition
    type: FieldDefinition
    title: FieldDefinition
    description: FieldDefinition
    timestamp: FieldDefinition
    status: FieldDefinition
    metadata: FieldDefinition
    createdAt: FieldDefinition
    updatedAt: FieldDefinition
    version: FieldDefinition
  }
  indexes: string[]
  constraints: ConstraintDefinition[]
}

export interface LeaveRequestSchema {
  fields: {
    id: FieldDefinition
    userId: FieldDefinition
    type: FieldDefinition
    startDate: FieldDefinition
    endDate: FieldDefinition
    days: FieldDefinition
    reason: FieldDefinition
    status: FieldDefinition
    emergencyContact: FieldDefinition
    attachments: FieldDefinition
    approvedBy: FieldDefinition
    approvedAt: FieldDefinition
    rejectedAt: FieldDefinition
    rejectionReason: FieldDefinition
    comments: FieldDefinition
    createdAt: FieldDefinition
    updatedAt: FieldDefinition
    version: FieldDefinition
  }
  indexes: string[]
  constraints: ConstraintDefinition[]
}

export interface IssueReportSchema {
  fields: {
    id: FieldDefinition
    userId: FieldDefinition
    category: FieldDefinition
    priority: FieldDefinition
    title: FieldDefinition
    description: FieldDefinition
    status: FieldDefinition
    location: FieldDefinition
    contactMethod: FieldDefinition
    contactInfo: FieldDefinition
    placementInfo: FieldDefinition
    deviceInfo: FieldDefinition
    assignedTo: FieldDefinition
    resolvedAt: FieldDefinition
    resolution: FieldDefinition
    adminNotes: FieldDefinition
    attachments: FieldDefinition
    comments: FieldDefinition
    createdAt: FieldDefinition
    updatedAt: FieldDefinition
    version: FieldDefinition
  }
  indexes: string[]
  constraints: ConstraintDefinition[]
}

export interface AuditLogSchema {
  fields: {
    id: FieldDefinition
    userId: FieldDefinition
    action: FieldDefinition
    resource: FieldDefinition
    resourceId: FieldDefinition
    oldValues: FieldDefinition
    newValues: FieldDefinition
    ipAddress: FieldDefinition
    userAgent: FieldDefinition
    timestamp: FieldDefinition
    sessionId: FieldDefinition
    metadata: FieldDefinition
  }
  indexes: string[]
  constraints: ConstraintDefinition[]
}

export interface SystemConfigSchema {
  fields: {
    id: FieldDefinition
    key: FieldDefinition
    value: FieldDefinition
    type: FieldDefinition
    description: FieldDefinition
    isPublic: FieldDefinition
    updatedBy: FieldDefinition
    updatedAt: FieldDefinition
    version: FieldDefinition
  }
  indexes: string[]
  constraints: ConstraintDefinition[]
}

export interface FieldDefinition {
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'reference'
  required: boolean
  unique?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  enum?: string[]
  default?: any
  description?: string
  validation?: ValidationRule[]
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message: string
}

export interface IndexDefinition {
  name: string
  collection: string
  fields: Array<{
    field: string
    order: 'asc' | 'desc'
  }>
  unique?: boolean
  sparse?: boolean
  partial?: any
  options?: Record<string, any>
}

export interface ConstraintDefinition {
  name: string
  type: 'foreign_key' | 'unique' | 'check' | 'not_null'
  fields: string[]
  reference?: {
    table: string
    field: string
  }
  condition?: string
}

export interface RelationshipDefinition {
  from: {
    collection: string
    field: string
  }
  to: {
    collection: string
    field: string
  }
  type: 'one_to_one' | 'one_to_many' | 'many_to_many'
  onDelete?: 'cascade' | 'set_null' | 'restrict'
  onUpdate?: 'cascade' | 'set_null' | 'restrict'
}

// Database schema implementation
export const databaseSchema: DatabaseSchema = {
  collections: {
    users: {
      fields: {
        id: { type: 'string', required: true, unique: true },
        email: { type: 'string', required: true, unique: true, maxLength: 254 },
        displayName: { type: 'string', required: true, maxLength: 100 },
        firstName: { type: 'string', required: true, maxLength: 50 },
        lastName: { type: 'string', required: true, maxLength: 50 },
        role: { type: 'string', required: true, enum: ['applicant', 'learner', 'admin', 'super-admin'] },
        status: { type: 'string', required: true, enum: ['pending', 'active', 'inactive', 'suspended'] },
        phone: { type: 'string', maxLength: 20 },
        profile: { type: 'object' },
        preferences: { type: 'object' },
        lastLoginAt: { type: 'date' },
        isActive: { type: 'boolean', required: true, default: true },
        createdAt: { type: 'date', required: true },
        updatedAt: { type: 'date', required: true },
        createdBy: { type: 'string' },
        updatedBy: { type: 'string' },
        version: { type: 'number', required: true, default: 1 }
      },
      indexes: ['email', 'role', 'status', 'isActive', 'createdAt'],
      constraints: []
    },
    applications: {
      fields: {
        id: { type: 'string', required: true, unique: true },
        userId: { type: 'reference', required: true },
        program: { type: 'string', required: true, maxLength: 100 },
        motivation: { type: 'string', required: true, maxLength: 2000 },
        experience: { type: 'string', required: true, maxLength: 2000 },
        availability: { type: 'string', required: true, maxLength: 500 },
        status: { type: 'string', required: true, enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn'] },
        priority: { type: 'string', required: true, enum: ['low', 'medium', 'high', 'urgent'] },
        documents: { type: 'array' },
        emergencyContact: { type: 'object', required: true },
        reviewNotes: { type: 'string', maxLength: 1000 },
        reviewedBy: { type: 'string' },
        reviewedAt: { type: 'date' },
        approvedAt: { type: 'date' },
        rejectedAt: { type: 'date' },
        rejectionReason: { type: 'string', maxLength: 500 },
        createdAt: { type: 'date', required: true },
        updatedAt: { type: 'date', required: true },
        version: { type: 'number', required: true, default: 1 }
      },
      indexes: ['userId', 'status', 'priority', 'createdAt', 'program'],
      constraints: [
        {
          name: 'fk_applications_user',
          type: 'foreign_key',
          fields: ['userId'],
          reference: { table: 'users', field: 'id' }
        }
      ]
    },
    learners: {
      fields: {
        id: { type: 'string', required: true, unique: true },
        userId: { type: 'reference', required: true },
        program: { type: 'string', required: true, maxLength: 100 },
        startDate: { type: 'date', required: true },
        endDate: { type: 'date' },
        status: { type: 'string', required: true, enum: ['enrolled', 'active', 'on_leave', 'completed', 'dropped_out', 'suspended'] },
        placement: { type: 'object' },
        progress: { type: 'object', required: true },
        achievements: { type: 'array' },
        activities: { type: 'array' },
        createdAt: { type: 'date', required: true },
        updatedAt: { type: 'date', required: true },
        version: { type: 'number', required: true, default: 1 }
      },
      indexes: ['userId', 'status', 'program', 'startDate', 'endDate'],
      constraints: [
        {
          name: 'fk_learners_user',
          type: 'foreign_key',
          fields: ['userId'],
          reference: { table: 'users', field: 'id' }
        }
      ]
    },
    placements: {
      fields: {
        id: { type: 'string', required: true, unique: true },
        learnerId: { type: 'reference', required: true },
        companyId: { type: 'reference', required: true },
        position: { type: 'string', required: true, maxLength: 100 },
        description: { type: 'string', required: true, maxLength: 2000 },
        startDate: { type: 'date', required: true },
        endDate: { type: 'date' },
        status: { type: 'string', required: true, enum: ['pending', 'active', 'completed', 'terminated', 'suspended'] },
        supervisor: { type: 'object', required: true },
        requirements: { type: 'array' },
        benefits: { type: 'array' },
        stipend: { type: 'object', required: true },
        hours: { type: 'object', required: true },
        milestones: { type: 'array' },
        feedback: { type: 'object' },
        createdAt: { type: 'date', required: true },
        updatedAt: { type: 'date', required: true },
        version: { type: 'number', required: true, default: 1 }
      },
      indexes: ['learnerId', 'companyId', 'status', 'startDate', 'endDate'],
      constraints: [
        {
          name: 'fk_placements_learner',
          type: 'foreign_key',
          fields: ['learnerId'],
          reference: { table: 'learners', field: 'id' }
        },
        {
          name: 'fk_placements_company',
          type: 'foreign_key',
          fields: ['companyId'],
          reference: { table: 'companies', field: 'id' }
        }
      ]
    },
    companies: {
      fields: {
        id: { type: 'string', required: true, unique: true },
        name: { type: 'string', required: true, maxLength: 200 },
        description: { type: 'string', maxLength: 2000 },
        industry: { type: 'string', maxLength: 100 },
        size: { type: 'string', enum: ['startup', 'small', 'medium', 'large', 'enterprise'] },
        location: { type: 'object', required: true },
        website: { type: 'string', maxLength: 200 },
        logo: { type: 'string', maxLength: 500 },
        contact: { type: 'object', required: true },
        rating: { type: 'number', min: 0, max: 5 },
        reviews: { type: 'array' },
        isActive: { type: 'boolean', required: true, default: true },
        createdAt: { type: 'date', required: true },
        updatedAt: { type: 'date', required: true },
        version: { type: 'number', required: true, default: 1 }
      },
      indexes: ['name', 'industry', 'isActive', 'rating', 'createdAt'],
      constraints: []
    },
    documents: {
      fields: {
        id: { type: 'string', required: true, unique: true },
        userId: { type: 'reference', required: true },
        applicationId: { type: 'reference' },
        name: { type: 'string', required: true, maxLength: 200 },
        type: { type: 'string', required: true, enum: ['cv', 'id', 'certificate', 'transcript', 'portfolio', 'other'] },
        status: { type: 'string', required: true, enum: ['uploaded', 'pending', 'approved', 'rejected'] },
        url: { type: 'string', required: true, maxLength: 500 },
        size: { type: 'number', required: true, min: 0 },
        mimeType: { type: 'string', required: true, maxLength: 100 },
        uploadedAt: { type: 'date', required: true },
        reviewedAt: { type: 'date' },
        reviewedBy: { type: 'string' },
        rejectionReason: { type: 'string', maxLength: 500 },
        required: { type: 'boolean', required: true, default: false },
        category: { type: 'string', maxLength: 100 },
        createdAt: { type: 'date', required: true },
        updatedAt: { type: 'date', required: true },
        version: { type: 'number', required: true, default: 1 }
      },
      indexes: ['userId', 'applicationId', 'type', 'status', 'uploadedAt'],
      constraints: [
        {
          name: 'fk_documents_user',
          type: 'foreign_key',
          fields: ['userId'],
          reference: { table: 'users', field: 'id' }
        },
        {
          name: 'fk_documents_application',
          type: 'foreign_key',
          fields: ['applicationId'],
          reference: { table: 'applications', field: 'id' }
        }
      ]
    },
    notifications: {
      fields: {
        id: { type: 'string', required: true, unique: true },
        userId: { type: 'reference', required: true },
        type: { type: 'string', required: true, enum: ['info', 'success', 'warning', 'error', 'reminder'] },
        title: { type: 'string', required: true, maxLength: 200 },
        message: { type: 'string', required: true, maxLength: 1000 },
        data: { type: 'object' },
        read: { type: 'boolean', required: true, default: false },
        readAt: { type: 'date' },
        priority: { type: 'string', required: true, enum: ['low', 'medium', 'high', 'urgent'] },
        category: { type: 'string', maxLength: 100 },
        actionUrl: { type: 'string', maxLength: 500 },
        expiresAt: { type: 'date' },
        createdAt: { type: 'date', required: true },
        updatedAt: { type: 'date', required: true },
        version: { type: 'number', required: true, default: 1 }
      },
      indexes: ['userId', 'type', 'priority', 'read', 'createdAt', 'expiresAt'],
      constraints: [
        {
          name: 'fk_notifications_user',
          type: 'foreign_key',
          fields: ['userId'],
          reference: { table: 'users', field: 'id' }
        }
      ]
    },
    activities: {
      fields: {
        id: { type: 'string', required: true, unique: true },
        userId: { type: 'reference', required: true },
        type: { type: 'string', required: true, enum: ['checkin', 'checkout', 'course_start', 'course_complete', 'document_upload', 'leave_request', 'placement_start', 'placement_end'] },
        title: { type: 'string', required: true, maxLength: 200 },
        description: { type: 'string', maxLength: 1000 },
        timestamp: { type: 'date', required: true },
        status: { type: 'string', required: true, enum: ['pending', 'in_progress', 'completed', 'cancelled', 'failed'] },
        metadata: { type: 'object' },
        createdAt: { type: 'date', required: true },
        updatedAt: { type: 'date', required: true },
        version: { type: 'number', required: true, default: 1 }
      },
      indexes: ['userId', 'type', 'status', 'timestamp', 'createdAt'],
      constraints: [
        {
          name: 'fk_activities_user',
          type: 'foreign_key',
          fields: ['userId'],
          reference: { table: 'users', field: 'id' }
        }
      ]
    },
    leaveRequests: {
      fields: {
        id: { type: 'string', required: true, unique: true },
        userId: { type: 'reference', required: true },
        type: { type: 'string', required: true, enum: ['sick', 'personal', 'emergency', 'vacation', 'study', 'other'] },
        startDate: { type: 'date', required: true },
        endDate: { type: 'date', required: true },
        days: { type: 'number', required: true, min: 0 },
        reason: { type: 'string', required: true, maxLength: 1000 },
        status: { type: 'string', required: true, enum: ['pending', 'approved', 'rejected', 'cancelled'] },
        emergencyContact: { type: 'string', required: true, maxLength: 200 },
        attachments: { type: 'array' },
        approvedBy: { type: 'string' },
        approvedAt: { type: 'date' },
        rejectedAt: { type: 'date' },
        rejectionReason: { type: 'string', maxLength: 500 },
        comments: { type: 'array' },
        createdAt: { type: 'date', required: true },
        updatedAt: { type: 'date', required: true },
        version: { type: 'number', required: true, default: 1 }
      },
      indexes: ['userId', 'type', 'status', 'startDate', 'endDate'],
      constraints: [
        {
          name: 'fk_leave_requests_user',
          type: 'foreign_key',
          fields: ['userId'],
          reference: { table: 'users', field: 'id' }
        }
      ]
    },
    issueReports: {
      fields: {
        id: { type: 'string', required: true, unique: true },
        userId: { type: 'reference', required: true },
        category: { type: 'string', required: true, enum: ['technical', 'billing', 'placement', 'stipend', 'academic', 'other'] },
        priority: { type: 'string', required: true, enum: ['low', 'medium', 'high', 'urgent'] },
        title: { type: 'string', required: true, maxLength: 200 },
        description: { type: 'string', required: true, maxLength: 2000 },
        status: { type: 'string', required: true, enum: ['open', 'in_progress', 'resolved', 'closed'] },
        location: { type: 'string', maxLength: 200 },
        contactMethod: { type: 'string', enum: ['email', 'phone', 'sms'] },
        contactInfo: { type: 'string', required: true, maxLength: 200 },
        placementInfo: { type: 'object' },
        deviceInfo: { type: 'object' },
        assignedTo: { type: 'string' },
        resolvedAt: { type: 'date' },
        resolution: { type: 'string', maxLength: 1000 },
        adminNotes: { type: 'string', maxLength: 1000 },
        attachments: { type: 'array' },
        comments: { type: 'array' },
        createdAt: { type: 'date', required: true },
        updatedAt: { type: 'date', required: true },
        version: { type: 'number', required: true, default: 1 }
      },
      indexes: ['userId', 'category', 'priority', 'status', 'assignedTo', 'createdAt'],
      constraints: [
        {
          name: 'fk_issue_reports_user',
          type: 'foreign_key',
          fields: ['userId'],
          reference: { table: 'users', field: 'id' }
        }
      ]
    },
    auditLogs: {
      fields: {
        id: { type: 'string', required: true, unique: true },
        userId: { type: 'string' },
        action: { type: 'string', required: true, maxLength: 100 },
        resource: { type: 'string', required: true, maxLength: 100 },
        resourceId: { type: 'string', required: true },
        oldValues: { type: 'object' },
        newValues: { type: 'object' },
        ipAddress: { type: 'string', maxLength: 45 },
        userAgent: { type: 'string', maxLength: 500 },
        timestamp: { type: 'date', required: true },
        sessionId: { type: 'string' },
        metadata: { type: 'object' }
      },
      indexes: ['userId', 'action', 'resource', 'timestamp', 'sessionId'],
      constraints: []
    },
    systemConfig: {
      fields: {
        id: { type: 'string', required: true, unique: true },
        key: { type: 'string', required: true, unique: true, maxLength: 100 },
        value: { type: 'string', required: true, maxLength: 1000 },
        type: { type: 'string', required: true, enum: ['string', 'number', 'boolean', 'object', 'array'] },
        description: { type: 'string', maxLength: 500 },
        isPublic: { type: 'boolean', required: true, default: false },
        updatedBy: { type: 'string' },
        updatedAt: { type: 'date', required: true },
        version: { type: 'number', required: true, default: 1 }
      },
      indexes: ['key', 'isPublic', 'updatedAt'],
      constraints: []
    }
  },
  indexes: [
    // Composite indexes for common queries
    {
      name: 'idx_users_role_status',
      collection: 'users',
      fields: [
        { field: 'role', order: 'asc' },
        { field: 'status', order: 'asc' }
      ]
    },
    {
      name: 'idx_applications_status_created',
      collection: 'applications',
      fields: [
        { field: 'status', order: 'asc' },
        { field: 'createdAt', order: 'desc' }
      ]
    },
    {
      name: 'idx_learners_status_program',
      collection: 'learners',
      fields: [
        { field: 'status', order: 'asc' },
        { field: 'program', order: 'asc' }
      ]
    },
    {
      name: 'idx_placements_status_dates',
      collection: 'placements',
      fields: [
        { field: 'status', order: 'asc' },
        { field: 'startDate', order: 'asc' },
        { field: 'endDate', order: 'asc' }
      ]
    },
    {
      name: 'idx_notifications_user_read',
      collection: 'notifications',
      fields: [
        { field: 'userId', order: 'asc' },
        { field: 'read', order: 'asc' },
        { field: 'createdAt', order: 'desc' }
      ]
    },
    {
      name: 'idx_activities_user_timestamp',
      collection: 'activities',
      fields: [
        { field: 'userId', order: 'asc' },
        { field: 'timestamp', order: 'desc' }
      ]
    },
    {
      name: 'idx_audit_logs_resource_timestamp',
      collection: 'auditLogs',
      fields: [
        { field: 'resource', order: 'asc' },
        { field: 'timestamp', order: 'desc' }
      ]
    }
  ],
  relationships: [
    {
      from: { collection: 'applications', field: 'userId' },
      to: { collection: 'users', field: 'id' },
      type: 'many_to_one',
      onDelete: 'cascade'
    },
    {
      from: { collection: 'learners', field: 'userId' },
      to: { collection: 'users', field: 'id' },
      type: 'one_to_one',
      onDelete: 'cascade'
    },
    {
      from: { collection: 'placements', field: 'learnerId' },
      to: { collection: 'learners', field: 'id' },
      type: 'many_to_one',
      onDelete: 'cascade'
    },
    {
      from: { collection: 'placements', field: 'companyId' },
      to: { collection: 'companies', field: 'id' },
      type: 'many_to_one',
      onDelete: 'restrict'
    },
    {
      from: { collection: 'documents', field: 'userId' },
      to: { collection: 'users', field: 'id' },
      type: 'many_to_one',
      onDelete: 'cascade'
    },
    {
      from: { collection: 'documents', field: 'applicationId' },
      to: { collection: 'applications', field: 'id' },
      type: 'many_to_one',
      onDelete: 'cascade'
    },
    {
      from: { collection: 'notifications', field: 'userId' },
      to: { collection: 'users', field: 'id' },
      type: 'many_to_one',
      onDelete: 'cascade'
    },
    {
      from: { collection: 'activities', field: 'userId' },
      to: { collection: 'users', field: 'id' },
      type: 'many_to_one',
      onDelete: 'cascade'
    },
    {
      from: { collection: 'leaveRequests', field: 'userId' },
      to: { collection: 'users', field: 'id' },
      type: 'many_to_one',
      onDelete: 'cascade'
    },
    {
      from: { collection: 'issueReports', field: 'userId' },
      to: { collection: 'users', field: 'id' },
      type: 'many_to_one',
      onDelete: 'cascade'
    }
  ]
}

// Database migration utilities
export class DatabaseMigration {
  private static instance: DatabaseMigration
  private migrations: Migration[] = []

  static getInstance(): DatabaseMigration {
    if (!DatabaseMigration.instance) {
      DatabaseMigration.instance = new DatabaseMigration()
    }
    return DatabaseMigration.instance
  }

  addMigration(migration: Migration): void {
    this.migrations.push(migration)
  }

  async runMigrations(): Promise<void> {
    for (const migration of this.migrations) {
      try {
        await migration.up()
        console.log(`Migration ${migration.name} completed successfully`)
      } catch (error) {
        console.error(`Migration ${migration.name} failed:`, error)
        throw error
      }
    }
  }

  async rollbackMigrations(): Promise<void> {
    for (const migration of this.migrations.reverse()) {
      try {
        await migration.down()
        console.log(`Migration ${migration.name} rolled back successfully`)
      } catch (error) {
        console.error(`Migration ${migration.name} rollback failed:`, error)
        throw error
      }
    }
  }
}

export interface Migration {
  name: string
  version: string
  up(): Promise<void>
  down(): Promise<void>
}

export { databaseSchema as DatabaseSchema }
