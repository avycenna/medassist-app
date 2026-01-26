import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cases = session.user.role === "OWNER"
      ? await prisma.case.findMany({ select: { id: true } })
      : await prisma.case.findMany({
          where: { assignedToId: session.user.id },
          select: { id: true },
        })

    const caseIds = cases.map(c => c.id)

    const messages = await prisma.message.findMany({
      where: {
        caseId: { in: caseIds },
        senderId: { not: session.user.id },
        readBy: {
          none: {
            userId: session.user.id,
          },
        },
      },
      select: {
        id: true,
        content: true,
        caseId: true,
        createdAt: true,
        sender: {
          select: {
            name: true,
          },
        },
        case: {
          select: {
            patientName: true,
            reference: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    })

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      caseId: msg.caseId,
      caseName: msg.case.patientName || msg.case.reference,
      senderName: msg.sender?.name || "Medical Team",
      createdAt: msg.createdAt,
    }))

    return NextResponse.json({ messages: formattedMessages })
  } catch (error) {
    console.error("Failed to fetch unread messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch unread messages" },
      { status: 500 }
    )
  }
}
