"use client"

import { useState, useEffect, useCallback } from "react"
import { useSocket } from "@/contexts/socket-context"
import { CasesTable } from "./cases-table"
import type { CaseStatus } from "@/lib/types"

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

interface RealtimeCasesTableProps {
  initialCases: CaseWithProvider[]
  initialProviders: Provider[]
  initialIsOwner: boolean
  providerId?: string
}

export function RealtimeCasesTable({
  initialCases,
  initialProviders,
  initialIsOwner,
  providerId,
}: RealtimeCasesTableProps) {
  const [cases, setCases] = useState<CaseWithProvider[]>(initialCases)
  const [providers, setProviders] = useState<Provider[]>(initialProviders)
  const [showArchived, setShowArchived] = useState(false)
  const { onMessage } = useSocket()

  const fetchLatestData = useCallback(async (includeArchived = false) => {
    try {
      const params = new URLSearchParams()
      if (providerId) params.append("providerId", providerId)
      if (includeArchived) params.append("includeArchived", "true")
      
      const url = `/api/cases?${params.toString()}`
      const response = await fetch(url, { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        setCases(data.cases.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
        })))
        setProviders(data.providers || [])
      }
    } catch (error) {
      console.error("Failed to fetch cases:", error)
    }
  }, [providerId])

  useEffect(() => {
    fetchLatestData(showArchived)
  }, [showArchived, fetchLatestData])

  useEffect(() => {
    const unsubscribe = onMessage((data: any) => {
      if (data.type === "case:updated" || data.type === "dashboard:updated") {
        fetchLatestData()
      }
    })

    return unsubscribe
  }, [onMessage, fetchLatestData])

  return (
    <CasesTable 
      cases={cases}
      providers={providers}
      isOwner={initialIsOwner}
      onRefresh={() => fetchLatestData(showArchived)}
      showArchived={showArchived}
      onToggleArchived={() => setShowArchived(!showArchived)}
    />
  )
}
