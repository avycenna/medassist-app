import { requireRole } from "@/lib/auth"
import { getAllProviders } from "@/lib/actions/cases"
import { RealtimeProvidersTable } from "@/components/dashboard/realtime-providers-table"
import { CreateProviderDialog } from "@/components/dashboard/create-provider-dialog"

export default async function ProvidersPage() {
  await requireRole(["OWNER"])
  
  const providers = await getAllProviders()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Provider Management</h1>
          <p className="text-muted-foreground mt-1">
            {providers.length} provider{providers.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <CreateProviderDialog />
      </div>

      {/* Realtime Providers Table */}
      <RealtimeProvidersTable initialProviders={providers} />
    </div>
  )
}
