"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Loader2, User, MessageCircle, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSocket } from "@/contexts/socket-context"
import { toast } from "sonner"

interface UserInfo {
  id: string
  name: string
  email: string
  role: string
}

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: Date
  sender: {
    id: string
    name: string
    role: string
  }
}

interface MessagingInterfaceProps {
  users: UserInfo[]
  currentUser: { id: string; name: string; email: string; role: string }
  isOwner: boolean
}

export function MessagingInterface({ users, currentUser, isOwner }: MessagingInterfaceProps) {
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(users[0] || null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { isConnected, onMessage } = useSocket()

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id)
    }
  }, [selectedUser])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const unsubscribe = onMessage((data: any) => {
      if (data.type === "direct:message" && selectedUser) {
        if (
          (data.payload.senderId === selectedUser.id && data.payload.receiverId === currentUser.id) ||
          (data.payload.senderId === currentUser.id && data.payload.receiverId === selectedUser.id)
        ) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.payload.message.id)) {
              return prev
            }
            return [...prev, data.payload.message]
          })
        }
      }
    })

    return unsubscribe
  }, [onMessage, selectedUser, currentUser.id])

  async function loadMessages(userId: string) {
    setLoading(true)
    try {
      const response = await fetch(`/api/messages/direct?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        })))
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
      toast.error("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!newMessage.trim() || !selectedUser || sending) return

    setSending(true)
    try {
      const response = await fetch("/api/messages/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          content: newMessage.trim(),
        }),
      })

      if (response.ok) {
        setNewMessage("")
      } else {
        toast.error("Failed to send message")
      }
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

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      <Card className="bg-card md:col-span-1">
        <CardHeader>
          <CardTitle className="text-foreground">
            {isOwner ? "Providers" : "Admin"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="space-y-1 p-4">
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No {isOwner ? "providers" : "admin"} available
                </p>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                      selectedUser?.id === user.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="bg-card md:col-span-3 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedUser ? (
                <>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-foreground">{selectedUser.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </>
              ) : (
                <CardTitle className="text-foreground">Select a conversation</CardTitle>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-500" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center text-center p-4">
              <div>
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a {isOwner ? "provider" : "conversation"} to start messaging
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isCurrentUser = msg.senderId === currentUser.id

                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex flex-col max-w-[85%]",
                            isCurrentUser ? "ml-auto items-end" : "items-start"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-foreground">
                              {isCurrentUser ? "You" : msg.sender.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(msg.createdAt, "h:mm a")}
                            </span>
                          </div>
                          <div
                            className={cn(
                              "rounded-lg px-4 py-2 text-sm",
                              isCurrentUser
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

              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Textarea
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
