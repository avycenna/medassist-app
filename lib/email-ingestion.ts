/**
 * Email Ingestion Service
 * 
 * Connects to an IMAP inbox and processes incoming medical case emails.
 * This service can be run as a background job or called periodically.
 */

import prisma from "./prisma"
import { parseEmailForCase } from "./email-parser"
import type { AssistanceType } from "./types"

// Email data interface
interface EmailData {
  messageId: string
  subject: string
  from: string
  date: Date
  text: string
}

// Mock email fetcher for demonstration
// In production, you would use a library like 'imap' or 'imapflow'
async function fetchNewEmails(): Promise<EmailData[]> {
  // This is a placeholder that would be replaced with actual IMAP logic
  // Using environment variables:
  // - IMAP_HOST
  // - IMAP_PORT
  // - IMAP_USER
  // - IMAP_PASSWORD
  // - IMAP_TLS
  
  console.log("[*] Email ingestion: Would connect to IMAP server")
  console.log("[*] IMAP_HOST:", process.env.IMAP_HOST)
  
  // Return empty array - in production this would fetch real emails
  return []
}

/**
 * Process a single email and create a case if it's a medical case
 */
async function processEmail(email: EmailData): Promise<{ created: boolean; caseId?: string; error?: string }> {
  try {
    // Check if we've already processed this email
    const existing = await prisma.processedEmail.findUnique({
      where: { messageId: email.messageId },
    })

    if (existing) {
      return { created: false, error: "Email already processed" }
    }

    // Parse the email for case data
    const parsedData = parseEmailForCase(email.text)

    if (!parsedData) {
      // Not a medical case - mark as processed but don't create a case
      await prisma.processedEmail.create({
        data: {
          messageId: email.messageId,
          subject: email.subject,
          from: email.from,
          receivedAt: email.date,
          processed: true,
          error: "Not identified as a medical case",
        },
      })
      return { created: false, error: "Not a medical case" }
    }

    // Parse date of birth if present
    let dob: Date | undefined
    if (parsedData.dob) {
      const parsed = new Date(parsedData.dob)
      if (!Number.isNaN(parsed.getTime())) {
        dob = parsed
      }
    }

    // Map assistance type
    const assistanceType = parsedData.assistanceType as AssistanceType | undefined

    // Create the case
    const newCase = await prisma.case.create({
      data: {
        patientName: parsedData.patientName || 
          (parsedData.firstName && parsedData.lastName 
            ? `${parsedData.firstName} ${parsedData.lastName}` 
            : undefined),
        firstName: parsedData.firstName,
        lastName: parsedData.lastName,
        dob,
        address: parsedData.address,
        phoneNumber: parsedData.phoneNumber,
        email: parsedData.email,
        nationality: parsedData.nationality,
        symptoms: parsedData.symptoms,
        symptomsRaw: parsedData.symptoms,
        assistanceType,
        referenceNumber: parsedData.referenceNumber,
        availability: parsedData.availability,
        status: "PENDING",
        source: "EMAIL",
        rawEmailContent: email.text,
        emailSubject: email.subject,
        emailFrom: email.from,
        emailReceivedAt: email.date,
      },
    })

    // Create status history entry
    await prisma.statusHistory.create({
      data: {
        caseId: newCase.id,
        toStatus: "PENDING",
        note: `Case created from email: ${email.subject}`,
      },
    })

    // Mark email as processed
    await prisma.processedEmail.create({
      data: {
        messageId: email.messageId,
        subject: email.subject,
        from: email.from,
        receivedAt: email.date,
        processed: true,
        caseId: newCase.id,
      },
    })

    return { created: true, caseId: newCase.id }
  } catch (error) {
    console.error("[*] Error processing email:", error)
    
    // Mark email as processed with error
    await prisma.processedEmail.create({
      data: {
        messageId: email.messageId,
        subject: email.subject,
        from: email.from,
        receivedAt: email.date,
        processed: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    })
    
    return { created: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * Main ingestion function - fetches and processes new emails
 */
export async function runEmailIngestion(): Promise<{
  processed: number
  created: number
  errors: number
}> {
  console.log("[*] Starting email ingestion...")
  
  const emails = await fetchNewEmails()
  
  let processed = 0
  let created = 0
  let errors = 0
  
  for (const email of emails) {
    const result = await processEmail(email)
    processed++
    
    if (result.created) {
      created++
      console.log("[*] Created case from email:", result.caseId)
    } else if (result.error) {
      if (result.error !== "Not a medical case" && result.error !== "Email already processed") {
        errors++
      }
    }
  }
  
  console.log(`[*] Email ingestion complete: ${processed} processed, ${created} created, ${errors} errors`)
  
  return { processed, created, errors }
}

/**
 * Create a case from raw email text (for manual testing or API)
 */
export async function createCaseFromEmailText(
  emailText: string,
  metadata?: {
    subject?: string
    from?: string
    messageId?: string
  }
): Promise<{ success: boolean; caseId?: string; error?: string }> {
  const messageId = metadata?.messageId || `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`
  
  const email: EmailData = {
    messageId,
    subject: metadata?.subject || "Manual Email Import",
    from: metadata?.from || "manual@import",
    date: new Date(),
    text: emailText,
  }
  
  const result = await processEmail(email)
  
  if (result.created) {
    return { success: true, caseId: result.caseId }
  }
  
  return { success: false, error: result.error }
}

/**
 * Get email processing statistics
 */
export async function getEmailStats() {
  const [total, processed, withCases, withErrors] = await Promise.all([
    prisma.processedEmail.count(),
    prisma.processedEmail.count({ where: { processed: true } }),
    prisma.processedEmail.count({ where: { caseId: { not: null } } }),
    prisma.processedEmail.count({ where: { error: { not: null } } }),
  ])
  
  return {
    total,
    processed,
    withCases,
    withErrors,
    pending: total - processed,
  }
}
