import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getAllCases, getProviderCases, getAllProviders } from "@/lib/actions/cases"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeArchived = searchParams.get("includeArchived") === "true"

    const isOwner = session.user.role === "OWNER"
    const cases = isOwner 
      ? await getAllCases(includeArchived) 
      : await getProviderCases(includeArchived)
    
    const providers = isOwner ? await getAllProviders() : []

    return NextResponse.json({ 
      cases, 
      providers: providers.map(p => ({ id: p.id, name: p.name, email: p.email })),
      isOwner 
    })
  } catch (error) {
    console.error("Failed to fetch cases:", error)
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    )
  }
}
