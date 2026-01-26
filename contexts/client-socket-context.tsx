"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"

interface ClientSocketContextType {
  isConnected: boolean
  joinCase: (caseId: string, token: string) => void
  leaveCase: (caseId: string) => void
  sendMessage: (token: string, content: string) => void
  onMessage: (callback: (data: any) => void) => () => void
}

const ClientSocketContext = createContext<ClientSocketContextType | null>(null)

export function ClientSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const messageHandlersRef = useRef<Set<(data: any) => void>>(new Set())
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    function connect() {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const wsUrl = `${protocol}//${window.location.host}/api/ws`

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.addEventListener("open", () => {
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
      })

      ws.addEventListener("close", () => {
        setIsConnected(false)

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
          reconnectTimeoutRef.current = setTimeout(connect, delay)
        }
      })

      ws.addEventListener("error", (error) => {
        console.error("WebSocket error:", error)
      })

      ws.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data)
          messageHandlersRef.current.forEach((handler) => handler(data))
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      })
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const send = useCallback(
    (data: any) => {
      if (wsRef.current && isConnected) {
        wsRef.current.send(JSON.stringify(data))
      }
    },
    [isConnected]
  )

  const joinCase = useCallback(
    (caseId: string, token: string) => {
      send({ type: "join:case:client", payload: { caseId, token } })
    },
    [send]
  )

  const leaveCase = useCallback(
    (caseId: string) => {
      send({ type: "leave:case", payload: { caseId } })
    },
    [send]
  )

  const sendMessage = useCallback(
    (token: string, content: string) => {
      send({ type: "message:send:client", payload: { token, content } })
    },
    [send]
  )

  const onMessage = useCallback((callback: (data: any) => void) => {
    messageHandlersRef.current.add(callback)
    return () => {
      messageHandlersRef.current.delete(callback)
    }
  }, [])

  return (
    <ClientSocketContext.Provider
      value={{
        isConnected,
        joinCase,
        leaveCase,
        sendMessage,
        onMessage,
      }}
    >
      {children}
    </ClientSocketContext.Provider>
  )
}

export function useClientSocket() {
  const context = useContext(ClientSocketContext)
  if (!context) {
    throw new Error("useClientSocket must be used within a ClientSocketProvider")
  }
  return context
}
