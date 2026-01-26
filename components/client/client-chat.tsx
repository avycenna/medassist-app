"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2 } from "lucide-react"
import { sendClientMessage, getClientMessages } from "@/lib/actions/chat"
import { cn } from "@/lib/utils"

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
}

export function ClientChat({ token, clientName }: ClientChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load initial messages
  useEffect(() => {
    async function loadMessages() {
      try {
        const data = await getClientMessages(token)
        setMessages(data)
      } catch (error) {
        console.error("[*] Failed to load messages:", error)
      } finally {
        setLoading(false)
      }
    }
    loadMessages()
  }, [token])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!refreshing && !sending) {
        setRefreshing(true)
        try {
          const data = await getClientMessages(token)
          setMessages(data)
        } catch {
          // Silently fail
        } finally {
          setRefreshing(false)
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [token, refreshing, sending])

  async function handleSend() {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const message = await sendClientMessage(token, newMessage.trim())
      setMessages((prev) => [...prev, { ...message, senderName: clientName }])
      setNewMessage("")
      textareaRef.current?.focus()
    } catch (error) {
      console.error("[*] Failed to send message:", error)
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
      {/* Messages */}
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
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Textarea
          ref={textareaRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={2}
          className="bg-background resize-none"
          disabled={sending}
        />
        <Button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
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
      
      {refreshing && (
        <p className="text-xs text-muted-foreground text-center">
          Checking for new messages...
        </p>
      )}
    </div>
  )
}
