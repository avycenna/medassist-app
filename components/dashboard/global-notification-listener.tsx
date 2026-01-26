"use client"

import { useEffect, useState } from "react"
import { useSocket } from "@/contexts/socket-context"
import { useNotification } from "@/hooks/use-notification"

export function GlobalNotificationListener() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const { onMessage } = useSocket()
  const { showNotification } = useNotification()

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
    const unsubscribe = onMessage((data: any) => {
      if (data.type === "message:new") {
        const { message, caseId } = data.payload
        
        if (message.sender?.id !== currentUserId && message.senderId !== currentUserId) {
          const senderName = message.sender?.name || message.senderType === "CLIENT" ? "Client" : "Someone"
          const caseName = message.case?.patientName || `Case ${caseId.substring(0, 8)}`
          
          showNotification(`${senderName} sent a message`, {
            body: message.content.substring(0, 100),
            tag: `case-${caseId}`,
            data: { caseId },
          })
        }
      }
    })

    return unsubscribe
  }, [onMessage, currentUserId, showNotification])

  return null
}
