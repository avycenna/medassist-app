import { requireRole } from "@/lib/auth"
import { getEmailStats } from "@/lib/email-ingestion"
import { SettingsPanel } from "@/components/dashboard/settings-panel"

export default async function SettingsPage() {
  await requireRole(["OWNER"])
  
  const emailStats = await getEmailStats()

  return (
    <div className="space-y-6 w-full">
      <SettingsPanel emailStats={emailStats} />
    </div>
  )
}
