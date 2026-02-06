/**
 * Email Ingestion Service
 * 
 * Connects to an IMAP inbox and processes incoming medical case emails.
 * This service can be run as a background job or called periodically.
 */

import prisma from "./prisma"
import { parseEmailForCase } from "./email-parser"
import type { AssistanceType } from "./types"
import { ImapFlow } from "imapflow"
import { addLog, clearLogs } from "./email-logs"

interface EmailData {
  messageId: string
  subject: string
  from: string
  date: Date
  text: string
}

export interface ConnectionTestResult {
  success: boolean
  message: string
  details?: {
    host?: string
    port?: number
    user?: string
    tlsEnabled?: boolean
    configured?: boolean
  }
  errors?: string[]
}

function validateEmailConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!process.env.IMAP_HOST) {
    errors.push("IMAP_HOST environment variable is not set")
  }
  if (!process.env.IMAP_PORT) {
    errors.push("IMAP_PORT environment variable is not set")
  }
  if (!process.env.IMAP_USER) {
    errors.push("IMAP_USER environment variable is not set")
  }
  if (!process.env.IMAP_PASSWORD) {
    errors.push("IMAP_PASSWORD environment variable is not set")
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

export async function testEmailConnection(): Promise<ConnectionTestResult> {
  const validation = validateEmailConfig()
  
  if (!validation.valid) {
    return {
      success: false,
      message: "Email configuration is incomplete",
      errors: validation.errors,
      details: {
        configured: false,
      },
    }
  }
  
  const host = process.env.IMAP_HOST!
  const port = parseInt(process.env.IMAP_PORT || "993")
  const user = process.env.IMAP_USER!
  const password = process.env.IMAP_PASSWORD!
  const tlsEnabled = process.env.IMAP_TLS !== "false"
  
  const client = new ImapFlow({
    host,
    port,
    secure: tlsEnabled,
    auth: {
      user,
      pass: password,
    },
    logger: false,
  })
  
  try {
    await client.connect()
    
    const mailboxInfo = await client.mailboxOpen("INBOX")
    
    await client.logout()
    
    return {
      success: true,
      message: `Successfully connected to IMAP server. Mailbox has ${mailboxInfo.exists} messages.`,
      details: {
        host,
        port,
        user,
        tlsEnabled,
        configured: true,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to connect to IMAP server",
      errors: [error instanceof Error ? error.message : "Unknown connection error"],
      details: {
        host,
        port,
        user,
        tlsEnabled,
        configured: true,
      },
    }
  }
}

async function fetchNewEmails(): Promise<EmailData[]> {
  const validation = validateEmailConfig()
  
  if (!validation.valid) {
    throw new Error(`Email configuration error: ${validation.errors.join(", ")}`)
  }
  
  let settings = await prisma.emailSettings.findFirst()
  if (!settings) {
    settings = await prisma.emailSettings.create({
      data: {
        isActive: true,
        checkInterval: 60,
        messagesToCheck: 50,
      },
    })
  }
  
  const messagesLimit = settings.messagesToCheck || 50
  
  const host = process.env.IMAP_HOST!
  const port = parseInt(process.env.IMAP_PORT || "993")
  const user = process.env.IMAP_USER!
  const password = process.env.IMAP_PASSWORD!
  const tlsEnabled = process.env.IMAP_TLS !== "false"
  
  addLog("Connecting to IMAP server...")
  addLog(`IMAP_HOST: ${host}`)
  addLog(`IMAP_PORT: ${port}`)
  addLog(`IMAP_USER: ${user}`)
  addLog(`IMAP_TLS: ${tlsEnabled}`)
  addLog(`Messages to check limit: ${messagesLimit}`)
  
  console.log("[*] Connecting to IMAP server...")
  console.log("[*] IMAP_HOST:", host)
  console.log("[*] IMAP_PORT:", port)
  console.log("[*] IMAP_USER:", user)
  console.log("[*] IMAP_TLS:", tlsEnabled)
  console.log(`[*] Messages to check limit: ${messagesLimit}`)
  
  const client = new ImapFlow({
    host,
    port,
    secure: tlsEnabled,
    auth: {
      user,
      pass: password,
    },
    logger: false,
  })
  
  try {
    await client.connect()
    addLog("Connected to IMAP server")
    console.log("[*] Connected to IMAP server")
    
    await client.mailboxOpen("INBOX")
    addLog("Opened INBOX")
    console.log("[*] Opened INBOX")
    
    const searchCriteria = { 
      seen: false
    }
    
    addLog("Searching for unread emails")
    console.log("[*] Searching for unread emails")
    
    const messages: EmailData[] = []
    let messageCount = 0
    
    for await (let message of client.fetch(searchCriteria, { 
      envelope: true, 
      source: true,
      uid: true 
    })) {
      if (messageCount >= messagesLimit) {
        addLog(`Reached limit of ${messagesLimit} messages, stopping fetch`)
        console.log(`[*] Reached limit of ${messagesLimit} messages, stopping fetch`)
        break
      }
      
      try {
        if (!message.envelope) {
          addLog("Skipping message without envelope")
          console.log("[*] Skipping message without envelope")
          continue
        }
        
        const messageId = message.envelope.messageId || `${message.uid}@${host}`
        const subject = message.envelope.subject || "(No Subject)"
        const from = message.envelope.from?.[0]?.address || "unknown@sender.com"
        const date = message.envelope.date || new Date()
        
        const decoder = new TextDecoder("utf-8")
        const sourceText = decoder.decode(message.source)
        
        let emailBody = ""
        
        const plainTextMatch = sourceText.match(/Content-Type: text\/plain[\s\S]*?\n\n([\s\S]*?)(?=\n--|\n\r\n--|\Z)/i)
        if (plainTextMatch) {
          emailBody = plainTextMatch[1].trim()
        } else {
          const lines = sourceText.split("\n")
          let inBody = false
          for (const line of lines) {
            if (inBody) {
              emailBody += line + "\n"
            }
            if (line.trim() === "") {
              inBody = true
            }
          }
        }
        
        messages.push({
          messageId,
          subject,
          from,
          date: new Date(date),
          text: emailBody.trim(),
        })
        
        messageCount++
        addLog(`Fetched email: ${subject} from ${from}`)
        console.log(`[*] Fetched email: ${subject} from ${from}`)
      } catch (error) {
        addLog(`Error processing email message: ${error instanceof Error ? error.message : "Unknown error"}`)
        console.error("[*] Error processing email message:", error)
      }
    }
    
    await client.logout()
    addLog(`Disconnected from IMAP server. Fetched ${messages.length} unread emails.`)
    console.log(`[*] Disconnected from IMAP server. Fetched ${messages.length} unread emails.`)
    
    return messages
  } catch (error) {
    addLog(`IMAP connection error: ${error instanceof Error ? error.message : "Unknown error"}`)
    console.error("[*] IMAP connection error:", error)
    throw error
  }
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
  success: boolean
  processed: number
  created: number
  errors: number
  message?: string
  errorDetails?: string[]
}> {
  clearLogs()
  addLog("Starting email ingestion...")
  console.log("[*] Starting email ingestion...")
  
  const validation = validateEmailConfig()
  if (!validation.valid) {
    addLog("Email configuration incomplete")
    return {
      success: false,
      processed: 0,
      created: 0,
      errors: validation.errors.length,
      message: "Email configuration incomplete",
      errorDetails: validation.errors,
    }
  }
  
  try {
    const emails = await fetchNewEmails()
    addLog(`Found ${emails.length} emails to process`)
    
    let processed = 0
    let created = 0
    let errors = 0
    const errorDetails: string[] = []
    
    for (const email of emails) {
      try {
        const result = await processEmail(email)
        processed++
        
        if (result.created) {
          created++
          addLog(`Created case from email: ${result.caseId}`)
          console.log("[*] Created case from email:", result.caseId)
        } else if (result.error) {
          if (result.error !== "Not a medical case" && result.error !== "Email already processed") {
            errors++
            errorDetails.push(`${email.subject}: ${result.error}`)
            addLog(`Error processing ${email.subject}: ${result.error}`)
          }
        }
      } catch (error) {
        errors++
        const errorMsg = error instanceof Error ? error.message : "Unknown error"
        errorDetails.push(`${email.subject}: ${errorMsg}`)
        addLog(`Error processing ${email.subject}: ${errorMsg}`)
        console.error("[*] Error processing email:", error)
      }
    }
    
    addLog(`Email ingestion complete: ${processed} processed, ${created} created, ${errors} errors`)
    console.log(`[*] Email ingestion complete: ${processed} processed, ${created} created, ${errors} errors`)
    
    return {
      success: true,
      processed,
      created,
      errors,
      message: emails.length === 0 ? "No new emails found" : undefined,
      errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    addLog(`Fatal error during email ingestion: ${errorMsg}`)
    console.error("[*] Fatal error during email ingestion:", error)
    
    return {
      success: false,
      processed: 0,
      created: 0,
      errors: 1,
      message: "Failed to fetch emails from server",
      errorDetails: [errorMsg],
    }
  }
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
