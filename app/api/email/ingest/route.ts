import { NextResponse } from "next/server"
import { runEmailIngestion, createCaseFromEmailText } from "@/lib/email-ingestion"
import { getSession } from "@/lib/auth"

/**
 * GET /api/email/ingest
 * Triggers email ingestion - protected, only for authenticated owners
 */
export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const result = await runEmailIngestion()
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("[*] Email ingestion API error:", error)
    return NextResponse.json({
      success: false,
      processed: 0,
      created: 0,
      errors: 1,
      message: "Failed to run email ingestion",
      errorDetails: [error instanceof Error ? error.message : "Unknown error"],
    }, { status: 500 })
  }
}

/**
 * POST /api/email/ingest
 * Create a case from raw email text - for testing/manual import
 */
export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const { emailText, subject, from } = body
    
    if (!emailText) {
      return NextResponse.json(
        { error: "emailText is required" },
        { status: 400 }
      )
    }
    
    const result = await createCaseFromEmailText(emailText, { subject, from })
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        caseId: result.caseId,
      })
    }
    
    return NextResponse.json(
      { error: result.error || "Failed to create case" },
      { status: 400 }
    )
  } catch (error) {
    console.error("[*] Email import API error:", error)
    return NextResponse.json(
      { error: "Failed to import email" },
      { status: 500 }
    )
  }
}
