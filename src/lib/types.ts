// Centralized type definitions to eliminate duplication and improve maintainability

// Import error types
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  DATABASE = 'database',
  NETWORK = 'network',
  EXTERNAL_API = 'external_api',
  EXTERNAL_SERVICE = 'external_service',
  SYSTEM = 'system',
  BUSINESS_LOGIC = 'business_logic',
  FILE_UPLOAD = 'file_upload',
  UNKNOWN = 'unknown'
}

// Base types
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface User extends BaseEntity {
  email: string
  displayName: string
  firstName: string
  lastName: string
  role: UserRole
  status: UserStatus
  phone?: string
  profile?: UserProfile
  preferences?: UserPreferences
  lastLoginAt?: Date
  isActive: boolean
}

export interface UserProfile {
  bio?: string
  avatar?: string
  department?: string
  position?: string
  location?: string
  skills?: string[]
  experience?: string
  education?: Education[]
  socialLinks?: SocialLinks
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  notifications: NotificationPreferences
  accessibility: AccessibilityPreferences
  dashboard: DashboardPreferences
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  categories: Record<string, boolean>
}

export interface AccessibilityPreferences {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  screenReader: boolean
  keyboardNavigation: boolean
}

export interface DashboardPreferences {
  widgets: Record<string, boolean>
  layout: string
  refreshInterval: number
}

// Enums
export type UserRole = 'applicant' | 'learner' | 'admin' | 'super-admin'
export type UserStatus = 'pending' | 'active' | 'inactive' | 'suspended' | 'completed' | 'enrolled' | 'on_leave' | 'dropped_out'

export interface Education {
  institution: string
  degree: string
  field: string
  startDate: Date
  endDate?: Date
  gpa?: number
}

export interface SocialLinks {
  linkedin?: string
  github?: string
  portfolio?: string
}

// Application types
export interface Application extends BaseEntity {
  userId: string
  user: User
  program: string
  motivation: string
  experience: string
  availability: string
  status: ApplicationStatus
  priority: Priority
  documents: Document[]
  emergencyContact: EmergencyContact
  reviewNotes?: string
  reviewedBy?: string
  reviewedAt?: Date
  approvedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
}

export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
  email?: string
}

// Document types
export interface Document extends BaseEntity {
  userId: string
  applicationId?: string
  name: string
  type: DocumentType
  status: DocumentStatus
  url: string
  size: number
  mimeType: string
  uploadedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  rejectionReason?: string
  required: boolean
  category: string
}

export type DocumentType = 'cv' | 'id' | 'certificate' | 'transcript' | 'portfolio' | 'other'
export type DocumentStatus = 'uploaded' | 'pending' | 'approved' | 'rejected'

// Learner types
export interface Learner extends User {
  program: string
  startDate: Date
  endDate?: Date
  status: LearnerStatus
  placement?: Placement
  progress: LearnerProgress
  achievements: Achievement[]
  activities: LearnerActivity[]
}

export type LearnerStatus = 'enrolled' | 'active' | 'on_leave' | 'completed' | 'dropped_out' | 'suspended'

export interface LearnerProgress {
  workHours: number
  targetHours: number
  completedCourses: number
  totalCourses: number
  certificates: number
  placementHours: number
  lastCheckIn?: Date
  attendanceRate: number
  performanceScore: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  type: AchievementType
  earnedAt: Date
  points: number
  badge?: string
}

export type AchievementType = 'course_completion' | 'certification' | 'placement' | 'attendance' | 'milestone'

export interface LearnerActivity {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: Date
  status: ActivityStatus
  metadata?: Record<string, any>
}

export type ActivityType = 'checkin' | 'checkout' | 'course_start' | 'course_complete' | 'document_upload' | 'leave_request' | 'placement_start' | 'placement_end'
export type ActivityStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed'

// Placement types
export interface Placement extends BaseEntity {
  learnerId: string
  learner: Learner
  companyId: string
  company: Company
  position: string
  description: string
  startDate: Date
  endDate?: Date
  status: PlacementStatus
  supervisor: Supervisor
  requirements: string[]
  benefits: string[]
  stipend: Stipend
  hours: PlacementHours
  milestones: Milestone[]
  feedback?: PlacementFeedback
}

export type PlacementStatus = 'pending' | 'active' | 'completed' | 'terminated' | 'suspended'

export interface Company {
  id: string
  name: string
  description: string
  industry: string
  size: CompanySize
  location: Location
  website?: string
  logo?: string
  contact: CompanyContact
  rating: number
  reviews: CompanyReview[]
}

export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise'

export interface Location {
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface CompanyContact {
  name: string
  email: string
  phone: string
  position: string
}

export interface CompanyReview {
  id: string
  rating: number
  comment: string
  reviewer: string
  date: Date
}

export interface Supervisor {
  name: string
  email: string
  phone: string
  position: string
  department: string
}

export interface Stipend {
  amount: number
  currency: string
  frequency: 'weekly' | 'monthly' | 'bi-weekly'
  paymentMethod: string
  bankDetails?: BankDetails
}

export interface BankDetails {
  accountNumber: string
  bankName: string
  branchCode: string
  accountHolder: string
}

export interface PlacementHours {
  weekly: number
  total: number
  completed: number
  remaining: number
  schedule: WorkSchedule[]
}

export interface WorkSchedule {
  day: string
  startTime: string
  endTime: string
  breakDuration: number
}

export interface Milestone {
  id: string
  title: string
  description: string
  dueDate: Date
  status: MilestoneStatus
  completedAt?: Date
  notes?: string
}

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'

export interface PlacementFeedback {
  id: string
  placementId: string
  type: FeedbackType
  rating: number
  comment: string
  submittedBy: string
  submittedAt: Date
  response?: string
  respondedAt?: Date
}

export type FeedbackType = 'learner_to_company' | 'company_to_learner' | 'learner_to_program' | 'company_to_program'

// Leave types
export interface LeaveRequest extends BaseEntity {
  userId: string
  user: User
  type: LeaveType
  startDate: Date
  endDate: Date
  days: number
  reason: string
  status: LeaveStatus
  emergencyContact: string
  attachments?: Document[]
  approvedBy?: string
  approvedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
  comments?: LeaveComment[]
}

export type LeaveType = 'sick' | 'personal' | 'emergency' | 'vacation' | 'study' | 'other'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface LeaveComment {
  id: string
  author: string
  comment: string
  timestamp: Date
  isInternal: boolean
}

// Issue types
export interface IssueReport extends BaseEntity {
  userId: string
  user: User
  category: IssueCategory
  priority: Priority
  title: string
  description: string
  status: IssueStatus
  location?: string
  contactMethod: ContactMethod
  contactInfo: string
  placementInfo?: PlacementInfo
  deviceInfo: DeviceInfo
  assignedTo?: string
  resolvedAt?: Date
  resolution?: string
  adminNotes?: string
  attachments?: Document[]
  comments?: IssueComment[]
}

export type IssueCategory = 'technical' | 'billing' | 'placement' | 'stipend' | 'academic' | 'other'
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type ContactMethod = 'email' | 'phone' | 'sms'

export interface PlacementInfo {
  id: string
  companyName: string
  position: string
}

export interface DeviceInfo {
  userAgent: string
  platform: string
  language: string
  timezone: string
  screenResolution?: string
  browserVersion?: string
}

export interface IssueComment {
  id: string
  author: string
  comment: string
  timestamp: Date
  isInternal: boolean
  attachments?: Document[]
}

// Notification types
export interface Notification extends BaseEntity {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  readAt?: Date
  priority: NotificationPriority
  category: string
  actionUrl?: string
  expiresAt?: Date
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'reminder'
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

// Analytics types
export interface AnalyticsEvent {
  id: string
  name: string
  category: string
  action: string
  label?: string
  value?: number
  userId?: string
  sessionId: string
  timestamp: number
  properties: Record<string, any>
  page: string
  userAgent: string
  ip?: string
}

export interface AnalyticsMetrics {
  totalUsers: number
  activeUsers: number
  newUsers: number
  returningUsers: number
  pageViews: number
  uniquePageViews: number
  averageSessionDuration: number
  bounceRate: number
  conversionRate: number
  topPages: Array<{ page: string; views: number }>
  topReferrers: Array<{ referrer: string; visits: number }>
  deviceTypes: Array<{ device: string; count: number }>
  browserTypes: Array<{ browser: string; count: number }>
  operatingSystems: Array<{ os: string; count: number }>
  countries: Array<{ country: string; count: number }>
  timeRanges: Array<{ range: string; users: number }>
}

export interface BusinessMetrics {
  applicationsSubmitted: number
  applicationsApproved: number
  applicationsRejected: number
  applicationsPending: number
  learnersActive: number
  learnersCompleted: number
  learnersDroppedOut: number
  placementsActive: number
  placementsCompleted: number
  totalRevenue: number
  monthlyRevenue: number
  averagePlacementDuration: number
  learnerSatisfactionScore: number
  employerSatisfactionScore: number
  completionRate: number
  dropoutRate: number
  placementSuccessRate: number
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: number
  requestId?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Form types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'datetime-local' | 'time' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file'
  required: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  validation?: ValidationRule[]
  defaultValue?: any
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message: string
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: Record<string, any>
  stack?: string
  timestamp: number
  userId?: string
  requestId?: string
  severity: ErrorSeverity
  category: ErrorCategory
}

// Search types
export interface SearchFilters {
  query?: string
  category?: string
  status?: string
  dateFrom?: Date
  dateTo?: Date
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface SearchResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  filters: SearchFilters
}

// Export commonly used type unions
export type EntityStatus = ApplicationStatus | LearnerStatus | PlacementStatus | LeaveStatus | IssueStatus | DocumentStatus
export type PriorityLevel = Priority | NotificationPriority
export type ContactMethods = ContactMethod
export type UserRoles = UserRole
export type UserStatuses = UserStatus
