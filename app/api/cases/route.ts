import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getAllCases, getProviderCases } from "@/lib/actions/cases"

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isOwner = session.user.role === "OWNER"
    const cases = isOwner ? await getAllCases() : await getProviderCases()

    return NextResponse.json({ cases, isOwner })
  } catch (error) {
    console.error("Failed to fetch cases:", error)
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    )
  }
}
