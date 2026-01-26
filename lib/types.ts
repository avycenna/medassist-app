// Type definitions for the Medical Assistant Management App

export type Role = 'OWNER' | 'PROVIDER'

export type CaseStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export type AssistanceType = 'TELECONSULTATION' | 'CLINIC_CONSULT' | 'HOME_VISIT' | 'EMERGENCY' | 'OTHER'

export type SenderType = 'OWNER' | 'PROVIDER' | 'CLIENT'

// User types
export interface User {
  id: string
  email: string
  username: string | null
  name: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

export interface UserWithPassword extends User {
  passwordHash: string
}

// Session types
export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
}

// Case types
export interface Case {
  id: string
  patientName: string | null
  firstName: string | null
  lastName: string | null
  dob: Date | null
  address: string | null
  phoneNumber: string | null
  email: string | null
  nationality: string | null
  symptoms: string | null
  symptomsRaw: string | null
  assistanceType: AssistanceType | null
  referenceNumber: string | null
  availability: string | null
  status: CaseStatus
  assignedToId: string | null
  source: string
  rawEmailContent: string | null
  emailSubject: string | null
  emailFrom: string | null
  emailReceivedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CaseWithRelations extends Case {
  assignedTo: User | null
  messages: Message[]
  statusHistory: StatusHistory[]
}

// Magic link types
export interface MagicLink {
  id: string
  tokenHash: string
  caseId: string
  clientFirstName: string | null
  clientLastName: string | null
  clientEmail: string | null
  clientPhone: string | null
  intakeCompleted: boolean
  expiresAt: Date | null
  revokedAt: Date | null
  usedAt: Date | null
  createdAt: Date
}

// Message types
export interface Message {
  id: string
  caseId: string
  content: string
  senderType: SenderType
  senderId: string | null
  magicLinkId: string | null
  createdAt: Date
}

export interface MessageWithSender extends Message {
  sender: User | null
}

// Status history types
export interface StatusHistory {
  id: string
  caseId: string
  fromStatus: CaseStatus | null
  toStatus: CaseStatus
  changedBy: string | null
  note: string | null
  createdAt: Date
}

// Parsed email case data
export interface ParsedCaseData {
  patientName?: string
  firstName?: string
  lastName?: string
  dob?: string
  address?: string
  phoneNumber?: string
  email?: string
  nationality?: string
  symptoms?: string
  referenceNumber?: string
  assistanceType?: string
  availability?: string
}

// Email data from IMAP
export interface EmailData {
  messageId: string
  subject: string
  from: string
  date: Date
  text: string
  html?: string
}

// Dashboard stats
export interface DashboardStats {
  pending: number
  assigned: number
  inProgress: number
  completed: number
  cancelled: number
  total: number
}

// Client intake form data
export interface IntakeFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
}

// Auth types
export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}
