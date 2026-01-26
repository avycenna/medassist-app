import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getCaseById, getAllProviders } from "@/lib/actions/cases"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const caseData = await getCaseById(id)
    const providers = session.user.role === "OWNER" ? await getAllProviders() : []

    return NextResponse.json({ 
      caseData, 
      providers,
      currentUser: session.user 
    })
  } catch (error) {
    console.error("Failed to fetch case:", error)
    return NextResponse.json(
      { error: "Failed to fetch case" },
      { status: 500 }
    )
  }
}
