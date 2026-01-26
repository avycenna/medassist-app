"use client"

import { useEffect, useState, useCallback, useRef } from "react"

interface UseRealtimeOptions<T> {
  fetcher: () => Promise<T>
  interval?: number // in milliseconds, default 3000 (3 seconds)
  enabled?: boolean
}

export function useRealtime<T>({
  fetcher,
  interval = 3000,
  enabled = true,
}: UseRealtimeOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    try {
      const result = await fetcher()
      if (isMountedRef.current) {
        setData(result)
        setError(null)
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error("Failed to fetch data"))
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [fetcher, enabled])

  // Manual refresh function
  const refresh = useCallback(() => {
    setLoading(true)
    return fetchData()
  }, [fetchData])

  useEffect(() => {
    isMountedRef.current = true

    if (!enabled) {
      setLoading(false)
      return
    }

    // Initial fetch
    fetchData()

    // Set up polling
    intervalRef.current = setInterval(fetchData, interval)

    return () => {
      isMountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchData, interval, enabled])

  return { data, loading, error, refresh }
}
