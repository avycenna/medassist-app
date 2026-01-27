import { type NextRequest } from "next/server"
import type { WebSocket as WSWebSocket } from "ws"
import { hashToken } from "@/lib/auth"
import prisma from "@/lib/prisma"
import type { SenderType } from "@/lib/types"
import { broadcastToClients } from "@/lib/websocket-broadcast"

interface CustomWebSocket extends WSWebSocket {
  userId?: string
  magicLinkId?: string
  cases?: Set<string>
}

const connections = new Map<string, Set<CustomWebSocket>>()

function broadcast(caseId: string, data: any) {
  if (connections.has(caseId)) {
    connections.get(caseId)!.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(data))
      }
    })
  }
}

export function UPGRADE(client: CustomWebSocket, server: any, request: NextRequest) {
  client.on("message", async (message) => {
    try {
      const parsed = JSON.parse(String(message))
      const { type, payload } = parsed

      switch (type) {
        case "auth": {
          const { userId, token } = payload
          if (userId) {
            client.userId = userId
            console.log(`[*] User ${userId} authenticated`)
          } else if (token) {
            const hashedToken = await hashToken(token)
            const magicLink = await prisma.magicLink.findUnique({
              where: { tokenHash: hashedToken },
              select: { id: true, caseId: true },
            })
            if (magicLink) {
              client.magicLinkId = magicLink.id
              client.cases = new Set([magicLink.caseId])
              if (!connections.has(magicLink.caseId)) {
                connections.set(magicLink.caseId, new Set())
              }
              connections.get(magicLink.caseId)!.add(client)
              console.log(`[*] Client ${magicLink.id} authenticated for case ${magicLink.caseId}`)
            } else {
              client.send(JSON.stringify({ type: "error", payload: { message: "Invalid magic link" } }))
              client.close()
            }
          } else {
            client.send(JSON.stringify({ type: "error", payload: { message: "Authentication required" } }))
            client.close()
          }
          break
        }

        case "join:case": {
          const { caseId } = payload
          const userId = client.userId

          if (!userId) {
            client.send(JSON.stringify({ type: "error", payload: { message: "Not authenticated" } }))
            break
          }

          if (!client.cases) {
            client.cases = new Set()
          }
          client.cases.add(caseId)

          if (!connections.has(caseId)) {
            connections.set(caseId, new Set())
          }
          connections.get(caseId)!.add(client)

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

          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, role: true },
          })

          if (!user) {
            client.send(JSON.stringify({ type: "error", payload: { message: "User not found" } }))
            break
          }

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

          broadcast(caseId, {
            type: "message:new",
            payload: { caseId, message: dbMessage },
          })
          broadcastToClients("unread:refresh", {})

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
          broadcastToClients("unread:refresh", {})

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
            include: {
              magicLink: {
                select: { clientFirstName: true },
              },
            },
          })

          console.log(`[*] Message sent in case ${magicLink.caseId} by client ${magicLink.id}`)

          broadcast(magicLink.caseId, {
            type: "message:new",
            payload: { caseId: magicLink.caseId, message: dbMessage },
          })
          broadcastToClients("unread:refresh", {})

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

  client.on("close", () => {
    const identifier = client.userId || client.magicLinkId
    console.log(`[*] WebSocket client disconnected (identifier: ${identifier})`)

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
    console.error(`[*] WebSocket error for client ${client.userId || client.magicLinkId}:`, error)
  })
}
