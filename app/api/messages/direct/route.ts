import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { broadcastToClients } from "@/lib/websocket-broadcast"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: userId },
          { senderId: userId, receiverId: session.user.id },
        ],
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    await prisma.directMessage.updateMany({
      where: {
        senderId: userId,
        receiverId: session.user.id,
        isRead: false,
      },
      data: { isRead: true },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Failed to fetch direct messages:", error)
    return NextResponse.json({ error: "Failed to fetch direct messages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { receiverId, content } = await request.json()

    if (!receiverId || !content) {
      return NextResponse.json({ error: "receiverId and content are required" }, { status: 400 })
    }

    const message = await prisma.directMessage.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
    })

    await broadcastToClients("direct:message", { 
      senderId: session.user.id, 
      receiverId, 
      message 
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Failed to send direct message:", error)
    return NextResponse.json({ error: "Failed to send direct message" }, { status: 500 })
  }
}
