"use client"

import { useState, useEffect } from "react"
import { useSocket } from "@/contexts/socket-context"

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const { onMessage } = useSocket()

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const data = await response.json()
          setCurrentUserId(data.user?.id || null)
        }
      } catch (error) {
        console.error("Failed to fetch session:", error)
      }
    }
    fetchSession()
  }, [])

  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const response = await fetch("/api/messages/unread")
        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error)
      }
    }

    fetchUnreadCount()
  }, [])

  useEffect(() => {
    const unsubscribe = onMessage((data: any) => {
      const { type, payload } = data

      switch (type) {
        case "message:new":
          if (payload.message.sender?.id !== currentUserId && payload.message.senderId !== currentUserId) {
            fetch("/api/messages/unread")
              .then((res) => res.json())
              .then((data) => setUnreadCount(data.unreadCount || 0))
              .catch(console.error)
          }
          break

        case "message:read":
          fetch("/api/messages/unread")
            .then((res) => res.json())
            .then((data) => setUnreadCount(data.unreadCount || 0))
            .catch(console.error)
          break
      }
    })

    return unsubscribe
  }, [onMessage, currentUserId])

  const refreshCount = async () => {
    try {
      const response = await fetch("/api/messages/unread")
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("Failed to refresh unread count:", error)
    }
  }

  return { unreadCount, refreshCount }
}
