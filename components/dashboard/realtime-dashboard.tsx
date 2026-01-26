"use client"

import { useCallback } from "react"
import { useRealtime } from "@/hooks/use-realtime"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { CasesTable } from "@/components/dashboard/cases-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CaseStatus } from "@/lib/types"

interface DashboardStats {
  pending: number
  assigned: number
  inProgress: number
  completed: number
  cancelled: number
  total: number
}

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

interface RealtimeDashboardProps {
  initialStats: DashboardStats
  initialCases: CaseWithProvider[]
  initialProviders: Provider[]
  isOwner: boolean
}

export function RealtimeDashboard({
  initialStats,
  initialCases,
  initialProviders,
  isOwner,
}: RealtimeDashboardProps) {
  const fetchDashboardData = useCallback(async () => {
    const response = await fetch("/api/dashboard", { cache: "no-store" })
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data")
    }
    const data = await response.json()
    return {
      stats: data.stats,
      cases: data.cases.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
      })),
      providers: data.providers || [],
    }
  }, [])

  const { data, loading, refresh } = useRealtime({
    fetcher: fetchDashboardData,
    interval: 3000, // Refresh every 3 seconds
  })

  const stats = data?.stats ?? initialStats
  const cases = data?.cases ?? initialCases
  const providers = data?.providers ?? initialProviders

  // Get recent cases (last 10)
  const recentCases = cases.slice(0, 10)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isOwner ? "Dashboard Overview" : "My Cases"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isOwner 
              ? "Monitor cases, manage providers, and track system activity." 
              : "View and manage your assigned cases."}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Recent Cases */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Cases</CardTitle>
          <CardDescription>
            {isOwner 
              ? "Latest cases from all sources" 
              : "Your most recently assigned cases"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CasesTable 
            cases={recentCases} 
            providers={providers.map(p => ({ id: p.id, name: p.name, email: p.email }))}
            isOwner={isOwner}
            onRefresh={refresh}
          />
        </CardContent>
      </Card>
    </div>
  )
}
