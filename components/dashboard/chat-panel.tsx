"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2, MessageCircle } from "lucide-react"
import { sendMessage, getCaseMessages } from "@/lib/actions/chat"
import { cn } from "@/lib/utils"
import type { User, SenderType } from "@/lib/types"

interface Message {
  id: string
  content: string
  senderType: SenderType
  createdAt: Date
  sender: { id: string; name: string; role: string } | null
  senderName?: string
}

interface ChatPanelProps {
  caseId: string
  messages: Message[]
  currentUser: User
  isClient?: boolean
  token?: string
  onRefresh?: () => void
}

export function ChatPanel({ caseId, messages: initialMessages, currentUser, isClient = false, onRefresh }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
          const newMessages = await getCaseMessages(caseId)
          setMessages(newMessages)
        } catch {
          // Silently fail - user might have navigated away
        } finally {
          setRefreshing(false)
        }
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [caseId, refreshing, sending])

  async function handleSend() {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const message = await sendMessage(caseId, newMessage.trim())
      setMessages((prev) => [...prev, message])
      setNewMessage("")
      textareaRef.current?.focus()
      // Trigger parent refresh to update case data
      onRefresh?.()
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

  function getSenderInfo(msg: Message) {
    if (msg.senderType === "CLIENT") {
      return { name: msg.senderName || "Client", isCurrentUser: isClient }
    }
    
    const isCurrentUser = msg.sender?.id === currentUser.id
    const name = msg.sender?.name || (msg.senderType === "OWNER" ? "Admin" : "Provider")
    return { name, isCurrentUser }
  }

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-foreground">Case Communication</CardTitle>
        </div>
        {refreshing && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <ScrollArea className="h-[300px] pr-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No messages yet. Start the conversation.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const { name, isCurrentUser } = getSenderInfo(msg)
                
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[80%]",
                      isCurrentUser ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">
                        {isCurrentUser ? "You" : name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.createdAt), "h:mm a")}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        isCurrentUser
                          ? "bg-primary text-primary-foreground"
                          : msg.senderType === "CLIENT"
                          ? "bg-accent text-accent-foreground"
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
        <div className="flex gap-2">
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
      </CardContent>
    </Card>
  )
}
