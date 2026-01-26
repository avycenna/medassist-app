"use client"

import React, { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2, Wifi, WifiOff } from "lucide-react"
import { getClientMessages } from "@/lib/actions/chat"
import { cn } from "@/lib/utils"
import { useClientSocket } from "@/contexts/client-socket-context"
import { toast } from "sonner"

interface Message {
  id: string
  content: string
  senderType: string
  createdAt: Date
  senderName?: string
  sender?: { id: string; name: string; role: string } | null
}

interface ClientChatProps {
  token: string
  clientName: string
  caseId: string
}

export function ClientChat({ token, clientName, caseId }: ClientChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isConnected, joinCase, leaveCase, sendMessage, onMessage } = useClientSocket()

  useEffect(() => {
    async function loadMessages() {
      try {
        const data = await getClientMessages(token)
        setMessages(data)
      } catch (error) {
        console.error("Failed to load messages:", error)
      } finally {
        setLoading(false)
      }
    }
    loadMessages()
  }, [token])

  useEffect(() => {
    if (scrollAreaRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }, [messages])

  useEffect(() => {
    joinCase(caseId, token)

    return () => {
      leaveCase(caseId)
    }
  }, [caseId, token, joinCase, leaveCase])

  useEffect(() => {
    const unsubscribe = onMessage((data: any) => {
      const { type, payload } = data

      switch (type) {
        case "message:new":
          if (payload.caseId === caseId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.message.id)) {
                return prev
              }
              return [...prev, payload.message]
            })
          }
          break

        case "joined:case":
          toast.success("Connected to chat")
          break

        case "error":
          toast.error(payload.message || "An error occurred")
          break
      }
    })

    return unsubscribe
  }, [caseId, onMessage])

  async function handleSend() {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      sendMessage(token, newMessage.trim())
      setNewMessage("")
      textareaRef.current?.focus()
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Connecting...</span>
            </>
          )}
        </div>
      </div>

      <ScrollArea className="h-[350px] pr-4" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-muted-foreground">
              No messages yet. Send a message to start the conversation with our medical team.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isClient = msg.senderType === "CLIENT"
              const senderName = isClient 
                ? "You" 
                : msg.senderName || msg.sender?.name || "Medical Team"

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    isClient ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-foreground">
                      {senderName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm",
                      isClient
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <div className="flex gap-2 pt-2 border-t border-border">
        <Textarea
          ref={textareaRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={2}
          className="bg-background resize-none"
          disabled={sending || !isConnected}
        />
        <Button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending || !isConnected}
          size="icon"
          className="h-auto"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  )
}
