import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getDashboardStats, getAllCases, getProviderCases, getAllProviders } from "@/lib/actions/cases"

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isOwner = session.user.role === "OWNER"
    
    const [stats, cases, providers] = await Promise.all([
      getDashboardStats(),
      isOwner ? getAllCases() : getProviderCases(),
      isOwner ? getAllProviders() : Promise.resolve([]),
    ])

    return NextResponse.json({ stats, cases, providers })
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
