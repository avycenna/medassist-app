import { getSession } from "@/lib/auth"
import { getDashboardStats, getAllCases, getProviderCases, getAllProviders } from "@/lib/actions/cases"
import { RealtimeDashboard } from "@/components/dashboard/realtime-dashboard"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  
  const stats = await getDashboardStats()
  const isOwner = session.user.role === "OWNER"
  
  const cases = isOwner 
    ? await getAllCases() 
    : await getProviderCases()
  
  const providers = isOwner ? await getAllProviders() : []

  return (
    <RealtimeDashboard
      initialStats={stats}
      initialCases={cases}
      initialProviders={providers.map(p => ({ id: p.id, name: p.name, email: p.email }))}
      isOwner={isOwner}
    />
  )
}
