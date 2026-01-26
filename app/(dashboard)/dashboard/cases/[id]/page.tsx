import { notFound, redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getCaseById, getAllProviders } from "@/lib/actions/cases"
import { RealtimeCaseDetail } from "@/components/dashboard/realtime-case-detail"

interface CaseDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = await params
  const session = await getSession()
  if (!session) redirect("/login")
  
  try {
    const caseData = await getCaseById(id)
    const providers = session.user.role === "OWNER" ? await getAllProviders() : []
    
    return (
      <RealtimeCaseDetail 
        initialCaseData={caseData} 
        initialProviders={providers.map(p => ({ id: p.id, name: p.name, email: p.email }))}
        initialCurrentUser={session.user}
        caseId={id}
      />
    )
  } catch {
    notFound()
  }
}
