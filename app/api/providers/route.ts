import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getAllProviders } from "@/lib/actions/cases"

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const providers = await getAllProviders()

    return NextResponse.json({ providers })
  } catch (error) {
    console.error("Failed to fetch providers:", error)
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    )
  }
}
