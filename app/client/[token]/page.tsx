import { getClientCaseInfo } from "@/lib/actions/chat"
import { ClientPortal } from "@/components/client/client-portal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Stethoscope } from "lucide-react"

interface ClientPageProps {
  params: Promise<{ token: string }>
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { token } = await params
  const result = await getClientCaseInfo(token)

  if (!result.valid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-foreground">Link Invalid</CardTitle>
            <CardDescription>
              {result.error || "This link is no longer valid. Please contact the clinic for a new link."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-md">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">MedSupportTravel</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <ClientPortal
          token={token}
          intakeCompleted={result.intakeCompleted || false}
          caseInfo={result.case}
          clientInfo={result.client}
        />
      </main>
    </div>
  )
}
