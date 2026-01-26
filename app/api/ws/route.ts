import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashToken } from "@/lib/auth"
import type { SenderType } from "@/lib/types"
import type { WebSocket } from "ws"

interface WebSocketWithExtras extends WebSocket {
  userId?: string
  cases?: Set<string>
}

// Store active connections
const connections = new Map<string, Set<WebSocketWithExtras>>()

function broadcast(caseId: string, message: any, excludeWs?: WebSocketWithExtras) {
  const caseConnections = connections.get(caseId)
  if (!caseConnections) return

  const messageStr = JSON.stringify(message)
  caseConnections.forEach((ws) => {
    if (ws !== excludeWs && ws.readyState === 1) {
      // 1 = OPEN
      ws.send(messageStr)
    }
  })
}

export function SOCKET(
  client: WebSocketWithExtras,
  request: NextRequest,
  server: any
) {
  console.log("[*] WebSocket client connected")

  // Initialize client data
  client.userId = ""
  client.cases = new Set<string>()

  // Handle messages from client
  client.on("message", async (data) => {
    try {
      const message = JSON.parse(data.toString())
      const { type, payload } = message

      switch (type) {
        case "auth": {
          // Authenticate the user
          const { userId } = payload
          client.userId = userId
          console.log(`[*] User ${userId} authenticated`)
          break
        }

        case "join:case": {
          const { caseId } = payload
          const userId = client.userId

          if (!userId) {
            client.send(JSON.stringify({ type: "error", payload: { message: "Not authenticated" } }))
            break
          }

          // Add to case connections
          if (!connections.has(caseId)) {
            connections.set(caseId, new Set())
          }
          connections.get(caseId)!.add(client)
          client.cases!.add(caseId)

          console.log(`[*] User ${userId} joined case ${caseId}`)
          client.send(JSON.stringify({ type: "joined:case", payload: { caseId } }))
          break
        }

        case "leave:case": {
          const { caseId } = payload
          const userId = client.userId

          if (connections.has(caseId)) {
            connections.get(caseId)!.delete(client)
          }
          client.cases!.delete(caseId)

          console.log(`[*] User ${userId} left case ${caseId}`)
          break
        }

        case "message:send": {
          const { caseId, content } = payload
          const userId = client.userId

          if (!userId) {
            client.send(JSON.stringify({ type: "error", payload: { message: "Not authenticated" } }))
            break
          }

          // Get user details
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, role: true },
          })

          if (!user) {
            client.send(JSON.stringify({ type: "error", payload: { message: "User not found" } }))
            break
          }

          // Create message in database
          const dbMessage = await prisma.message.create({
            data: {
              caseId,
              content,
              senderType: user.role as SenderType,
              senderId: userId,
              readBy: {
                create: {
                  userId,
                },
              },
            },
            include: {
              sender: {
                select: { id: true, name: true, role: true },
              },
            },
          })

          console.log(`[*] Message sent in case ${caseId} by user ${userId}`)

          // Broadcast to all clients in the case
          broadcast(caseId, {
            type: "message:new",
            payload: { caseId, message: dbMessage },
          })

          break
        }

        case "message:markRead": {
          const { messageId, caseId } = payload
          const userId = client.userId

          if (!userId) {
            client.send(JSON.stringify({ type: "error", payload: { message: "Not authenticated" } }))
            break
          }

          await prisma.messageRead.upsert({
            where: {
              messageId_userId: {
                messageId,
                userId,
              },
            },
            update: { readAt: new Date() },
            create: {
              messageId,
              userId,
            },
          })

          broadcast(caseId, {
            type: "message:read",
            payload: { messageId, userId, caseId },
          })

          break
        }

        case "join:case:client": {
          const { caseId, token } = payload
          const hashedToken = await hashToken(token)

          const magicLink = await prisma.magicLink.findUnique({
            where: { tokenHash: hashedToken },
            select: { id: true, caseId: true, expiresAt: true },
          })

          if (!magicLink || (magicLink.expiresAt && magicLink.expiresAt < new Date()) || magicLink.caseId !== caseId) {
            client.send(JSON.stringify({ type: "error", payload: { message: "Invalid token" } }))
            break
          }

          if (!connections.has(caseId)) {
            connections.set(caseId, new Set())
          }
          connections.get(caseId)!.add(client)
          client.cases!.add(caseId)

          client.send(JSON.stringify({ type: "joined:case", payload: { caseId } }))
          break
        }

        case "message:send:client": {
          const { token, content } = payload
          const hashedToken = await hashToken(token)

          const magicLink = await prisma.magicLink.findUnique({
            where: { tokenHash: hashedToken },
            select: { 
              id: true, 
              caseId: true, 
              expiresAt: true,
            },
          })

          if (!magicLink || (magicLink.expiresAt && magicLink.expiresAt < new Date())) {
            client.send(JSON.stringify({ type: "error", payload: { message: "Invalid or expired token" } }))
            break
          }

          const dbMessage = await prisma.message.create({
            data: {
              caseId: magicLink.caseId,
              content,
              senderType: "CLIENT",
              magicLinkId: magicLink.id,
            },
            select: {
              id: true,
              content: true,
              senderType: true,
              createdAt: true,
              sender: {
                select: { id: true, name: true, role: true },
              },
            },
          })

          broadcast(magicLink.caseId, {
            type: "message:new",
            payload: { caseId: magicLink.caseId, message: dbMessage },
          })

          break
        }

        default:
          console.log(`[*] Unknown message type: ${type}`)
      }
    } catch (error) {
      console.error("[*] Error handling WebSocket message:", error)
      client.send(
        JSON.stringify({
          type: "error",
          payload: { message: "Internal server error" },
        })
      )
    }
  })

  // Handle disconnection
  client.on("close", () => {
    const userId = client.userId
    console.log(`[*] WebSocket client disconnected (user: ${userId})`)

    // Remove from all case connections
    if (client.cases) {
      client.cases.forEach((caseId) => {
        if (connections.has(caseId)) {
          connections.get(caseId)!.delete(client)
          if (connections.get(caseId)!.size === 0) {
            connections.delete(caseId)
          }
        }
      })
    }
  })

  client.on("error", (error) => {
    console.error("[*] WebSocket error:", error)
  })
}

export function GET() {
  return new NextResponse("WebSocket endpoint", { status: 426, statusText: "Upgrade Required" })
}
