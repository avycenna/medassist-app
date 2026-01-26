"use client"

import { useState, useEffect, useCallback } from "react"
import { useSocket } from "@/contexts/socket-context"
import { ProvidersTable } from "./providers-table"

interface Provider {
  id: string
  name: string
  email: string
  role: string
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
  const [providers, setProviders] = useState<Provider[]>(initialProviders)
  const { onMessage } = useSocket()

  const fetchLatestData = useCallback(async () => {
    try {
      const response = await fetch("/api/providers", { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        setProviders(data.providers.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        })))
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onMessage((data: any) => {
      if (data.type === "provider:updated" || data.type === "providers:updated" || data.type === "case:updated") {
        fetchLatestData()
      }
    })

    return unsubscribe
  }, [onMessage, fetchLatestData])

  return <ProvidersTable providers={providers} onRefresh={fetchLatestData} />
}
