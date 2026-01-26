import { getSession } from "@/lib/auth"
import { getAllCases, getProviderCases, getAllProviders } from "@/lib/actions/cases"
import { RealtimeCasesTable } from "@/components/dashboard/realtime-cases-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function CasesPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  
  const isOwner = session.user.role === "OWNER"
  
  const cases = isOwner 
    ? await getAllCases() 
    : await getProviderCases()
  
  const providers = isOwner ? await getAllProviders() : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isOwner ? "All Cases" : "My Cases"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isOwner 
              ? `${cases.length} total cases in the system` 
              : `${cases.length} cases assigned to you`}
          </p>
        </div>
        {isOwner && (
          <Button asChild>
            <Link href="/dashboard/cases/new">
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Link>
          </Button>
        )}
      </div>

      {/* Realtime Cases Table */}
      <RealtimeCasesTable 
        initialCases={cases} 
        initialProviders={providers.map(p => ({ id: p.id, name: p.name, email: p.email }))}
        initialIsOwner={isOwner} 
      />
    </div>
  )
}
