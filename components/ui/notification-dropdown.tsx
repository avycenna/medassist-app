"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Bell, MessageSquare, CheckCheck } from "lucide-react"
import { useSocket } from "@/contexts/socket-context"
import { markCaseMessagesAsRead } from "@/lib/actions/chat"
import { toast } from "sonner"

interface UnreadMessage {
  id: string
  content: string
  caseId: string
  caseName: string
  senderName: string
  createdAt: Date
}

interface NotificationDropdownProps {
  unreadCount: number
  onCountChange?: (count: number) => void
}

export function NotificationDropdown({ unreadCount, onCountChange }: NotificationDropdownProps) {
  const [messages, setMessages] = useState<UnreadMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { onMessage, isConnected } = useSocket()

  useEffect(() => {
    if (open) {
      fetchMessages()
    }
  }, [open])

  useEffect(() => {
    const unsubscribe = onMessage((data: any) => {
      if (data.type === "message:new") {
        fetchMessages()
      }
    })

    return unsubscribe
  }, [onMessage])

  async function fetchMessages() {
    setLoading(true)
    try {
      const response = await fetch("/api/messages/unread-list")
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAsRead(caseId: string) {
    try {
      await markCaseMessagesAsRead(caseId)
      setMessages(prev => prev.filter(m => m.caseId !== caseId))
      onCountChange?.(unreadCount - messages.filter(m => m.caseId === caseId).length)
      toast.success("Messages marked as read")
    } catch (error) {
      toast.error("Failed to mark as read")
    }
  }

  async function handleMarkAllAsRead() {
    try {
      const uniqueCaseIds = [...new Set(messages.map(m => m.caseId))]
      await Promise.all(uniqueCaseIds.map(caseId => markCaseMessagesAsRead(caseId)))
      setMessages([])
      onCountChange?.(0)
      toast.success("All messages marked as read")
    } catch (error) {
      toast.error("Failed to mark all as read")
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">{unreadCount} unread messages</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : messages.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No new notifications
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="p-3 hover:bg-accent rounded-md cursor-pointer group"
                >
                  <Link href={`/dashboard/cases/${message.caseId}`} onClick={() => setOpen(false)}>
                    <div className="flex gap-3">
                      <MessageSquare className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-sm font-medium leading-none">
                          {message.senderName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {message.caseName}
                        </p>
                        <p className="text-sm text-foreground line-clamp-2">
                          {message.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(message.createdAt), "MMM d, h:mm a")}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.preventDefault()
                              handleMarkAsRead(message.caseId)
                            }}
                          >
                            Mark read
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
