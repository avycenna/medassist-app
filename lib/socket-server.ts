import { Server as HTTPServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"

export type ServerToClientEvents = {
  "message:new": (message: {
    id: string
    caseId: string
    content: string
    senderType: string
    senderId: string | null
    createdAt: string
    sender: { id: string; name: string; role: string } | null
  }) => void
  "message:read": (data: { messageId: string; userId: string; caseId: string }) => void
  "case:updated": (data: { caseId: string }) => void
}

export type ClientToServerEvents = {
  "join:case": (caseId: string) => void
  "leave:case": (caseId: string) => void
  "message:send": (data: { caseId: string; content: string }) => void
  "message:markRead": (data: { messageId: string; caseId: string }) => void
}

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null = null

export function initSocketServer(httpServer: HTTPServer) {
  if (io) {
    console.log("Socket.IO server already initialized")
    return io
  }

  io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: "/api/socket",
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  io.on("connection", async (socket) => {
    console.log("Client connected:", socket.id)

    // Authenticate the connection
    const token = socket.handshake.auth.token
    if (!token) {
      socket.disconnect()
      return
    }

    // Join case room
    socket.on("join:case", (caseId) => {
      console.log(`Socket ${socket.id} joining case:${caseId}`)
      socket.join(`case:${caseId}`)
    })

    // Leave case room
    socket.on("leave:case", (caseId) => {
      console.log(`Socket ${socket.id} leaving case:${caseId}`)
      socket.leave(`case:${caseId}`)
    })

    // Handle sending messages
    socket.on("message:send", async ({ caseId, content }) => {
      try {
        // This will be handled by the API route
        // Just emit to the room
        console.log(`Message sent to case:${caseId}`)
      } catch (error) {
        console.error("Error handling message:", error)
      }
    })

    // Handle marking messages as read
    socket.on("message:markRead", async ({ messageId, caseId }) => {
      try {
        // This will be handled by the API route
        // Emit to the room
        io?.to(`case:${caseId}`).emit("message:read", {
          messageId,
          userId: socket.handshake.auth.userId,
          caseId,
        })
      } catch (error) {
        console.error("Error marking message as read:", error)
      }
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
    })
  })

  console.log("Socket.IO server initialized")
  return io
}

export function getSocketServer() {
  if (!io) {
    throw new Error("Socket.IO server not initialized")
  }
  return io
}

export function emitToCase(caseId: string, event: keyof ServerToClientEvents, data: any) {
  if (io) {
    io.to(`case:${caseId}`).emit(event, data)
  }
}
