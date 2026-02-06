import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getRecentLogs } from "@/lib/email-logs"

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const logs = getRecentLogs(200)
    
    return NextResponse.json({ logs })
  } catch (error) {
    console.error("[*] Email logs API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    )
  }
}
