import { requireRole } from "@/lib/auth"
import { getEmailStats } from "@/lib/email-ingestion"
import { SettingsPanel } from "@/components/dashboard/settings-panel"

export default async function SettingsPage() {
  await requireRole(["OWNER"])
  
  const emailStats = await getEmailStats()

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure email ingestion and system settings.
        </p>
      </div>

      <SettingsPanel emailStats={emailStats} />
    </div>
  )
}
