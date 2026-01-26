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
  isOwner: boolean
  providerId?: string
}

export function RealtimeCasesTable({
  initialCases,
  initialProviders,
  isOwner,
  providerId,
}: RealtimeCasesTableProps) {
  const [cases, setCases] = useState<CaseWithProvider[]>(initialCases)
  const [providers, setProviders] = useState<Provider[]>(initialProviders)
  const { onMessage } = useSocket()

  const fetchLatestData = useCallback(async () => {
    try {
      const url = providerId 
        ? `/api/cases?providerId=${providerId}` 
        : "/api/cases"
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
      isOwner={isOwner}
      onRefresh={fetchLatestData}
    />
  )
}
