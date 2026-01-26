/**
 * Email Parser for Medical Case Extraction
 * 
 * Handles various email formats and extracts structured case data
 * from semi-structured medical case emails.
 */

import type { ParsedCaseData, AssistanceType } from "./types"

// Field patterns with variations
const FIELD_PATTERNS: Record<string, RegExp[]> = {
  name: [
    /(?:name|patient\s*name|full\s*name)\s*[:\-]?\s*(.+)/i,
    /^([A-Z][a-z]+\s+[A-Z][a-z]+)$/m,
  ],
  firstName: [
    /(?:first\s*name|given\s*name|forename)\s*[:\-]?\s*(.+)/i,
  ],
  lastName: [
    /(?:last\s*name|surname|family\s*name)\s*[:\-]?\s*(.+)/i,
  ],
  dob: [
    /(?:dob|date\s*of\s*birth|birth\s*date|d\.o\.b\.?)\s*[:\-]?\s*(.+)/i,
    /(?:born|birthday)\s*[:\-]?\s*(.+)/i,
  ],
  address: [
    /(?:address|location|residence|home\s*address)\s*[:\-]?\s*(.+)/i,
  ],
  phone: [
    /(?:phone|telephone|tel|contact\s*phone|mobile|cell)\s*(?:number)?\s*[:\-]?\s*(.+)/i,
    /(?:contact)\s*[:\-]?\s*(\+?[\d\s\-()]+)/i,
  ],
  email: [
    /(?:email|e-mail|mail)\s*(?:address)?\s*[:\-]?\s*(.+)/i,
  ],
  symptoms: [
    /(?:symptoms?|complaint|presenting\s*complaint|chief\s*complaint|reason\s*for\s*visit|condition)\s*[:\-]?\s*(.+)/i,
  ],
  referenceNumber: [
    /(?:reference|ref|case\s*id|reference\s*number|ref\.?\s*(?:no|number)?)\s*[:\-]?\s*(.+)/i,
  ],
  nationality: [
    /(?:nationality|citizenship|country)\s*[:\-]?\s*(.+)/i,
  ],
  assistanceType: [
    /(?:kind\s*of\s*assistance|type\s*of\s*(?:assistance|service|consultation)|assistance\s*type|service\s*required|consultation\s*type)\s*[:\-]?\s*(.+)/i,
  ],
  availability: [
    /(?:availability|available|preferred\s*time|when\s*available)\s*[:\-]?\s*(.+)/i,
  ],
}

// Multi-line field patterns (for fields that might span multiple lines)
const MULTILINE_FIELDS = ["symptoms", "address"]

// Assistance type mapping
const ASSISTANCE_TYPE_MAP: Record<string, AssistanceType> = {
  teleconsultation: "TELECONSULTATION",
  teleconsult: "TELECONSULTATION",
  "tele-consultation": "TELECONSULTATION",
  "tele consultation": "TELECONSULTATION",
  video: "TELECONSULTATION",
  "video call": "TELECONSULTATION",
  "video consultation": "TELECONSULTATION",
  clinic: "CLINIC_CONSULT",
  "clinic consult": "CLINIC_CONSULT",
  "clinic consultation": "CLINIC_CONSULT",
  "in-person": "CLINIC_CONSULT",
  "in person": "CLINIC_CONSULT",
  office: "CLINIC_CONSULT",
  "office visit": "CLINIC_CONSULT",
  home: "HOME_VISIT",
  "home visit": "HOME_VISIT",
  "house call": "HOME_VISIT",
  emergency: "EMERGENCY",
  urgent: "EMERGENCY",
  "emergency room": "EMERGENCY",
  er: "EMERGENCY",
}

/**
 * Clean extracted value by trimming and removing common artifacts
 */
function cleanValue(value: string): string {
  return value
    .trim()
    .replace(/^[:\-\s]+/, "")
    .replace(/[:\-\s]+$/, "")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Extract a field value using multiple pattern variations
 */
function extractField(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const value = cleanValue(match[1])
      if (value.length > 0) {
        return value
      }
    }
  }
  return undefined
}

/**
 * Extract multi-line field value (continues until next field or empty line)
 */
function extractMultilineField(text: string, fieldName: string): string | undefined {
  const patterns = FIELD_PATTERNS[fieldName]
  if (!patterns) return undefined

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const startIndex = match.index! + match[0].length
      const remainingText = text.slice(startIndex)
      
      // Find the end of this field (next field label or double newline)
      const nextFieldMatch = remainingText.match(/\n\s*(?:[A-Z][a-zA-Z\s]*:|•\s*[A-Z])/m)
      const endIndex = nextFieldMatch?.index ?? remainingText.length
      
      const value = remainingText.slice(0, endIndex).trim()
      if (value.length > 0) {
        return cleanValue(value.replace(/\n/g, " "))
      }
    }
  }
  return undefined
}

/**
 * Parse assistance type from text
 */
function parseAssistanceType(text?: string): AssistanceType | undefined {
  if (!text) return undefined
  
  const normalizedText = text.toLowerCase().trim()
  
  for (const [key, value] of Object.entries(ASSISTANCE_TYPE_MAP)) {
    if (normalizedText.includes(key)) {
      return value
    }
  }
  
  return "OTHER"
}

/**
 * Check if email appears to be a medical case
 */
export function isMedicalCase(text: string): boolean {
  const lowerText = text.toLowerCase()
  
  // Check for medical-related keywords
  const medicalKeywords = [
    "patient",
    "symptoms",
    "consultation",
    "medical",
    "doctor",
    "clinic",
    "appointment",
    "teleconsultation",
    "dob",
    "date of birth",
    "assistance",
    "complaint",
    "health",
    "treatment",
  ]
  
  const keywordCount = medicalKeywords.filter(keyword => 
    lowerText.includes(keyword)
  ).length
  
  // Check for structured field patterns
  const fieldPatterns = [
    /(?:name|patient)\s*[:\-]/i,
    /(?:dob|date\s*of\s*birth)\s*[:\-]/i,
    /(?:symptoms?|complaint)\s*[:\-]/i,
    /(?:address|location)\s*[:\-]/i,
    /(?:phone|telephone|contact)\s*[:\-]/i,
  ]
  
  const fieldCount = fieldPatterns.filter(pattern => pattern.test(text)).length
  
  // Consider it a medical case if:
  // - Has at least 2 medical keywords and 2 field patterns, or
  // - Has at least 3 field patterns
  return (keywordCount >= 2 && fieldCount >= 2) || fieldCount >= 3
}

/**
 * Parse email text and extract case data
 */
export function parseEmailForCase(emailText: string): ParsedCaseData | null {
  if (!isMedicalCase(emailText)) {
    return null
  }

  const data: ParsedCaseData = {}

  // Extract standard fields
  const standardFields: Array<keyof ParsedCaseData> = [
    "firstName",
    "lastName",
    "dob",
    "email",
    "referenceNumber",
    "nationality",
    "availability",
  ]

  for (const field of standardFields) {
    const patterns = FIELD_PATTERNS[field]
    if (patterns) {
      const value = extractField(emailText, patterns)
      if (value) {
        data[field] = value
      }
    }
  }

  // Extract name (might be combined or separate)
  if (!data.firstName && !data.lastName) {
    const fullName = extractField(emailText, FIELD_PATTERNS.name)
    if (fullName) {
      const nameParts = fullName.split(/\s+/)
      if (nameParts.length >= 2) {
        data.firstName = nameParts[0]
        data.lastName = nameParts.slice(1).join(" ")
      } else {
        data.patientName = fullName
      }
    }
  }

  // Extract phone (with validation)
  const phone = extractField(emailText, FIELD_PATTERNS.phone)
  if (phone) {
    // Basic phone validation - contains at least some digits
    const digitsOnly = phone.replace(/\D/g, "")
    if (digitsOnly.length >= 7) {
      data.phoneNumber = phone
    }
  }

  // Extract multi-line fields
  for (const field of MULTILINE_FIELDS) {
    if (MULTILINE_FIELDS.includes(field)) {
      const value = extractMultilineField(emailText, field)
      if (value) {
        (data as Record<string, string>)[field] = value
      }
    }
  }

  // Also try standard extraction for symptoms and address
  if (!data.symptoms) {
    data.symptoms = extractField(emailText, FIELD_PATTERNS.symptoms)
  }
  if (!data.address) {
    data.address = extractField(emailText, FIELD_PATTERNS.address)
  }

  // Parse assistance type
  const assistanceText = extractField(emailText, FIELD_PATTERNS.assistanceType)
  const assistanceType = parseAssistanceType(assistanceText)
  if (assistanceType) {
    data.assistanceType = assistanceType
  }

  // Validate that we have at least some meaningful data
  const hasPatientInfo = data.patientName || data.firstName || data.lastName
  const hasContactInfo = data.phoneNumber || data.email || data.address
  const hasMedicalInfo = data.symptoms || data.assistanceType

  if (!hasPatientInfo && !hasContactInfo && !hasMedicalInfo) {
    return null
  }

  return data
}

/**
 * Format parsed data for display
 */
export function formatParsedData(data: ParsedCaseData): string {
  const lines: string[] = []
  
  if (data.patientName) lines.push(`Patient: ${data.patientName}`)
  if (data.firstName) lines.push(`First Name: ${data.firstName}`)
  if (data.lastName) lines.push(`Last Name: ${data.lastName}`)
  if (data.dob) lines.push(`DOB: ${data.dob}`)
  if (data.address) lines.push(`Address: ${data.address}`)
  if (data.phoneNumber) lines.push(`Phone: ${data.phoneNumber}`)
  if (data.email) lines.push(`Email: ${data.email}`)
  if (data.nationality) lines.push(`Nationality: ${data.nationality}`)
  if (data.symptoms) lines.push(`Symptoms: ${data.symptoms}`)
  if (data.assistanceType) lines.push(`Type: ${data.assistanceType}`)
  if (data.referenceNumber) lines.push(`Reference: ${data.referenceNumber}`)
  if (data.availability) lines.push(`Availability: ${data.availability}`)
  
  return lines.join("\n")
}
