"use client"

import { useCallback } from "react"
import { CasesTable } from "./cases-table"
import { useRealtime } from "@/hooks/use-realtime"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CaseStatus } from "@/lib/types"

interface CaseWithProvider {
  id: string
  patientName: string | null
  firstName: string | null
  lastName: string | null
  status: CaseStatus
  assistanceType: string | null
  createdAt: Date
  assignedTo: {
    id: string
    name: string
    email: string
  } | null
}

interface Provider {
  id: string
  name: string
  email: string
}

interface RealtimeCasesTableProps {
  initialCases: CaseWithProvider[]
  initialProviders: Provider[]
  initialIsOwner: boolean
}

export function RealtimeCasesTable({
  initialCases,
  initialProviders,
  initialIsOwner,
}: RealtimeCasesTableProps) {
  const fetcher = useCallback(async () => {
    const response = await fetch("/api/cases", { cache: "no-store" })
    if (!response.ok) {
      throw new Error("Failed to fetch cases")
    }
    const data = await response.json()
    return {
      cases: data.cases.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
      })),
      isOwner: data.isOwner,
    }
  }, [])

  const fetchProviders = useCallback(async () => {
    const response = await fetch("/api/providers", { cache: "no-store" })
    if (!response.ok) {
      if (response.status === 403) {
        // Not an owner, return empty array
        return []
      }
      throw new Error("Failed to fetch providers")
    }
    const data = await response.json()
    return data.providers
  }, [])

  const { data: casesData, loading: casesLoading, refresh: refreshCases } = useRealtime({
    fetcher,
    interval: 3000, // Refresh every 3 seconds
  })

  const { data: providersData, refresh: refreshProviders } = useRealtime({
    fetcher: fetchProviders,
    interval: 5000, // Refresh providers every 5 seconds
    enabled: initialIsOwner,
  })

  const cases = casesData?.cases ?? initialCases
  const isOwner = casesData?.isOwner ?? initialIsOwner
  const providers = providersData ?? initialProviders

  // Trigger immediate refresh on user actions
  const handleRefresh = useCallback(() => {
    refreshCases()
    if (initialIsOwner) {
      refreshProviders()
    }
  }, [refreshCases, refreshProviders, initialIsOwner])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center text-sm text-muted-foreground">
          {casesLoading ? (
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
          onClick={handleRefresh}
          disabled={casesLoading}
          title="Refresh now"
        >
          <RefreshCw className={`h-4 w-4 ${casesLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <CasesTable 
        cases={cases} 
        providers={providers} 
        isOwner={isOwner}
        onRefresh={handleRefresh}
      />
    </div>
  )
}
