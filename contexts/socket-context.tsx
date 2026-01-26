"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { useSession } from "@/hooks/use-session"
import type { ServerToClientEvents, ClientToServerEvents } from "@/lib/socket-server"

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>

interface SocketContextType {
  socket: SocketType | null
  isConnected: boolean
  joinCase: (caseId: string) => void
  leaveCase: (caseId: string) => void
  sendMessage: (caseId: string, content: string) => void
  markMessageAsRead: (messageId: string, caseId: string) => void
}

const SocketContext = createContext<SocketContextType | null>(null)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<SocketType | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [session, setSession] = useState<any>(null)

  // Get session on mount
  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch("/api/auth/session")
        if (response.ok) {
          const data = await response.json()
          setSession(data)
        }
      } catch (error) {
        console.error("Failed to fetch session:", error)
      }
    }
    fetchSession()
  }, [])

  useEffect(() => {
    if (!session?.user) return

    const socketInstance: SocketType = io({
      path: "/api/socket",
      auth: {
        token: session.token || "temp-token",
        userId: session.user.id,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id)
      setIsConnected(true)
    })

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected")
      setIsConnected(false)
    })

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      setIsConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [session])

  const joinCase = useCallback(
    (caseId: string) => {
      if (socket && isConnected) {
        socket.emit("join:case", caseId)
      }
    },
    [socket, isConnected]
  )

  const leaveCase = useCallback(
    (caseId: string) => {
      if (socket && isConnected) {
        socket.emit("leave:case", caseId)
      }
    },
    [socket, isConnected]
  )

  const sendMessage = useCallback(
    (caseId: string, content: string) => {
      if (socket && isConnected) {
        socket.emit("message:send", { caseId, content })
      }
    },
    [socket, isConnected]
  )

  const markMessageAsRead = useCallback(
    (messageId: string, caseId: string) => {
      if (socket && isConnected) {
        socket.emit("message:markRead", { messageId, caseId })
      }
    },
    [socket, isConnected]
  )

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinCase,
        leaveCase,
        sendMessage,
        markMessageAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}
