"use client"

import { useCallback } from "react"
import { ProvidersTable } from "./providers-table"
import { useRealtime } from "@/hooks/use-realtime"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Provider {
  id: string
  name: string
  email: string
  username: string | null
  createdAt: Date
  _count: {
    assignedCases: number
  }
}

interface RealtimeProvidersTableProps {
  initialProviders: Provider[]
}

export function RealtimeProvidersTable({
  initialProviders,
}: RealtimeProvidersTableProps) {
  const fetcher = useCallback(async () => {
    const response = await fetch("/api/providers", { cache: "no-store" })
    if (!response.ok) {
      throw new Error("Failed to fetch providers")
    }
    const data = await response.json()
    return data.providers.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
    }))
  }, [])

  const { data, loading, refresh } = useRealtime({
    fetcher,
    interval: 5000, // Refresh every 5 seconds
  })

  const providers = data ?? initialProviders

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
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
      <ProvidersTable providers={providers} />
    </div>
  )
}
