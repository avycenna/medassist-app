import { NextResponse } from "next/server"
import { testEmailConnection } from "@/lib/email-ingestion"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const result = await testEmailConnection()
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("[*] Connection test error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to test connection",
      errors: [error instanceof Error ? error.message : "Unknown error"],
    }, { status: 500 })
  }
}
