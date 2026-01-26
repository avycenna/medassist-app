"use client"

import { useState, useEffect, useCallback } from "react"
import { useSocket } from "@/contexts/socket-context"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { CasesTable } from "@/components/dashboard/cases-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wifi, WifiOff } from "lucide-react"
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
  isArchived: boolean
  deletedAt: Date | null
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
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [cases, setCases] = useState<CaseWithProvider[]>(initialCases)
  const [providers, setProviders] = useState<Provider[]>(initialProviders)
  const { isConnected, onMessage } = useSocket()

  const fetchLatestData = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard", { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setCases(data.cases.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
        })))
        setProviders(data.providers || [])
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onMessage((data: any) => {
      if (data.type === "dashboard:updated" || data.type === "case:updated") {
        fetchLatestData()
      }
    })

    return unsubscribe
  }, [onMessage, fetchLatestData])

  const recentCases = cases.slice(0, 10)

  return (
    <div className="space-y-8">
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span>Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span>Connecting...</span>
            </>
          )}
        </div>
      </div>

      <StatsCards stats={stats} />

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
            onRefresh={fetchLatestData}
          />
        </CardContent>
      </Card>
    </div>
  )
}
