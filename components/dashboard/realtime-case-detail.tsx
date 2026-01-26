"use client"

import { useCallback } from "react"
import { CaseDetail } from "./case-detail"
import { useRealtime } from "@/hooks/use-realtime"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CaseStatus, User as UserType, SenderType } from "@/lib/types"

interface CaseData {
  id: string
  patientName: string | null
  firstName: string | null
  lastName: string | null
  dob: Date | null
  address: string | null
  phoneNumber: string | null
  email: string | null
  nationality: string | null
  symptoms: string | null
  symptomsRaw: string | null
  assistanceType: string | null
  referenceNumber: string | null
  availability: string | null
  status: CaseStatus
  assignedToId: string | null
  source: string
  rawEmailContent: string | null
  emailSubject: string | null
  emailFrom: string | null
  emailReceivedAt: Date | null
  createdAt: Date
  updatedAt: Date
  assignedTo: { id: string; name: string; email: string } | null
  messages: Array<{
    id: string
    content: string
    senderType: SenderType
    createdAt: Date
    sender: { id: string; name: string; role: string } | null
  }>
  statusHistory: Array<{
    id: string
    fromStatus: CaseStatus | null
    toStatus: CaseStatus
    note: string | null
    createdAt: Date
  }>
  magicLinks: Array<{
    id: string
    intakeCompleted: boolean
    clientFirstName: string | null
    clientLastName: string | null
    createdAt: Date
    expiresAt: Date | null
    revokedAt: Date | null
  }>
}

interface Provider {
  id: string
  name: string
  email: string
}

interface RealtimeCaseDetailProps {
  initialCaseData: CaseData
  initialProviders: Provider[]
  initialCurrentUser: UserType
  caseId: string
}

export function RealtimeCaseDetail({
  initialCaseData,
  initialProviders,
  initialCurrentUser,
  caseId,
}: RealtimeCaseDetailProps) {
  const fetcher = useCallback(async () => {
    const response = await fetch(`/api/cases/${caseId}`, { cache: "no-store" })
    if (!response.ok) {
      throw new Error("Failed to fetch case")
    }
    const data = await response.json()
    
    // Convert date strings back to Date objects
    return {
      caseData: {
        ...data.caseData,
        dob: data.caseData.dob ? new Date(data.caseData.dob) : null,
        emailReceivedAt: data.caseData.emailReceivedAt ? new Date(data.caseData.emailReceivedAt) : null,
        createdAt: new Date(data.caseData.createdAt),
        updatedAt: new Date(data.caseData.updatedAt),
        messages: data.caseData.messages.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        })),
        statusHistory: data.caseData.statusHistory.map((h: any) => ({
          ...h,
          createdAt: new Date(h.createdAt),
        })),
        magicLinks: data.caseData.magicLinks.map((l: any) => ({
          ...l,
          createdAt: new Date(l.createdAt),
          expiresAt: l.expiresAt ? new Date(l.expiresAt) : null,
          revokedAt: l.revokedAt ? new Date(l.revokedAt) : null,
        })),
      },
      providers: data.providers,
      currentUser: data.currentUser,
    }
  }, [caseId])

  const { data, loading, refresh } = useRealtime({
    fetcher,
    interval: 3000, // Refresh every 3 seconds
  })

  const caseData = data?.caseData ?? initialCaseData
  const providers = data?.providers ?? initialProviders
  const currentUser = data?.currentUser ?? initialCurrentUser

  return (
    <div className="relative">
      {/* Realtime Indicator */}
      <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center text-sm text-muted-foreground">
          {loading ? (
            <>
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 mr-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Live</span>
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refresh()}
          disabled={loading}
          title="Refresh now"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <CaseDetail 
        caseData={caseData} 
        providers={providers}
        currentUser={currentUser}
        onRefresh={refresh}
      />
    </div>
  )
}
