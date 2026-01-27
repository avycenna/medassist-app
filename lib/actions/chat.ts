"use server"

import prisma from "@/lib/prisma"
import { getSession, validateMagicLink, hashToken } from "@/lib/auth"
import { revalidateTag } from "next/cache"
import type { SenderType } from "@/lib/types"
import { broadcastToClients } from "@/lib/websocket-broadcast"
import crypto from "crypto"

const MESSAGE_SELECT = {
  id: true,
  content: true,
  senderType: true,
  createdAt: true,
  sender: {
    select: { id: true, name: true, role: true },
  },
  magicLinkId: true,
}

export async function sendMessage(caseId: string, content: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true },
  })

  if (!caseData) throw new Error("Case not found")

  if (session.user.role !== "OWNER") {
    throw new Error("Only administrators can send messages in cases")
  }
  
  const message = await prisma.message.create({
    data: {
      caseId,
      content,
      senderType: session.user.role as SenderType,
      senderId: session.user.id,
    },
    select: MESSAGE_SELECT,
  })

  await prisma.$executeRaw`
    INSERT INTO "MessageRead" ("id", "messageId", "userId", "readAt")
    SELECT ${crypto.randomUUID()}, ${message.id}, ${session.user.id}, NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM "MessageRead" 
      WHERE "messageId" = ${message.id} AND "userId" = ${session.user.id}
    )
  `
  
  revalidateTag("messages", "max")
  await broadcastToClients("message:new", { caseId, message })
  await broadcastToClients("unread:refresh", {})
  return message
}

export async function sendClientMessage(token: string, content: string) {
  const validation = await validateMagicLink(token)
  
  if (!validation.valid || !validation.magicLink) {
    throw new Error(validation.error || "Invalid link")
  }
  
  if (!validation.magicLink.intakeCompleted) {
    throw new Error("Please complete the intake form first")
  }
  
  const message = await prisma.message.create({
    data: {
      caseId: validation.magicLink.caseId,
      content,
      senderType: "CLIENT",
      magicLinkId: validation.magicLink.id,
    },
  })
  
  revalidateTag("messages", "max")
  return message
}

export async function getCaseMessages(caseId: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")
  
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true },
  })
  
  if (!caseData) throw new Error("Case not found")
  
  if (session.user.role !== "OWNER") {
    throw new Error("Only administrators can view case messages")
  }
  
  const messages = await prisma.message.findMany({
    where: { caseId },
    orderBy: { createdAt: "asc" },
    select: MESSAGE_SELECT,
  })
  
  return messages
}

export async function getClientMessages(token: string) {
  const validation = await validateMagicLink(token)
  
  if (!validation.valid || !validation.magicLink) {
    throw new Error(validation.error || "Invalid link")
  }
  
  const messages = await prisma.message.findMany({
    where: { caseId: validation.magicLink.caseId },
    orderBy: { createdAt: "asc" },
    select: MESSAGE_SELECT,
  })
  
  return messages
}

export async function getClientCaseInfo(token: string) {
  const hashedToken = await hashToken(token)
  
  const magicLink = await prisma.magicLink.findUnique({
    where: { tokenHash: hashedToken },
    select: {
      id: true,
      expiresAt: true,
      intakeCompleted: true,
      clientFirstName: true,
      clientLastName: true,
      case: {
        select: {
          id: true,
          status: true,
          assistanceType: true,
        },
      },
    },
  })
  
  if (!magicLink) {
    return { valid: false, error: "Link not found" }
  }
  
  if (magicLink.expiresAt && magicLink.expiresAt < new Date()) {
    return { valid: false, error: "Link has expired" }
  }
  
  return {
    valid: true,
    intakeCompleted: magicLink.intakeCompleted,
    case: magicLink.case,
    client: {
      firstName: magicLink.clientFirstName,
      lastName: magicLink.clientLastName,
    },
  }
}

export async function submitIntakeForm(token: string, data: {
  firstName: string
  lastName: string
  dob: string
  address: string
  phone: string
  email: string
  symptoms: string
  medications: string
}) {
  const hashedToken = await hashToken(token)
  
  const magicLink = await prisma.magicLink.findUnique({
    where: { tokenHash: hashedToken },
    select: { id: true, expiresAt: true, intakeCompleted: true, caseId: true },
  })
  
  if (!magicLink) throw new Error("Link not found")
  if (magicLink.expiresAt && magicLink.expiresAt < new Date()) throw new Error("Link has expired")
  if (magicLink.intakeCompleted) throw new Error("Intake already completed")
  
  await prisma.$transaction([
    prisma.magicLink.update({
      where: { id: magicLink.id },
      data: {
        intakeCompleted: true,
        clientFirstName: data.firstName,
        clientLastName: data.lastName,
        clientEmail: data.email,
        clientPhone: data.phone,
      },
    }),
    prisma.case.update({
      where: { id: magicLink.caseId },
      data: {
        patientName: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        dob: new Date(data.dob),
        address: data.address,
        phoneNumber: data.phone,
        email: data.email,
        rawEmailContent: `Symptoms: ${data.symptoms}\n\nMedications: ${data.medications}`,
        status: "PENDING",
      },
    }),
  ])
  
  revalidateTag("cases", "max")
  await broadcastToClients("case:updated", { caseId: magicLink.caseId })
  await broadcastToClients("dashboard:updated", {})
  return { success: true }
}

export async function markMessageAsRead(messageId: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const existing = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT "id" FROM "MessageRead" 
    WHERE "messageId" = ${messageId} AND "userId" = ${session.user.id}
  `

  if (!existing || existing.length === 0) {
    await prisma.$executeRaw`
      INSERT INTO "MessageRead" ("id", "messageId", "userId", "readAt")
      VALUES (${crypto.randomUUID()}, ${messageId}, ${session.user.id}, NOW())
    `
  } else {
    await prisma.$executeRaw`
      UPDATE "MessageRead" SET "readAt" = NOW()
      WHERE "messageId" = ${messageId} AND "userId" = ${session.user.id}
    `
  }
  
  revalidateTag("unread-messages", "max")
  return { success: true }
}

export async function markCaseMessagesAsRead(caseId: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const messages = await prisma.message.findMany({
    where: { caseId },
    select: { id: true },
  })

  if (messages.length === 0) {
    return { success: true }
  }

  for (const message of messages) {
    await prisma.$executeRaw`
      INSERT INTO "MessageRead" ("id", "messageId", "userId", "readAt")
      SELECT ${crypto.randomUUID()}, ${message.id}, ${session.user.id}, NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM "MessageRead" 
        WHERE "messageId" = ${message.id} AND "userId" = ${session.user.id}
      )
    `
  }

  revalidateTag("unread-messages", "max")
  return { success: true }
}

export async function getUnreadMessageCount() {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const result = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(DISTINCT m."id")::int as count
    FROM "Message" m
    INNER JOIN "Case" c ON c."id" = m."caseId"
    LEFT JOIN "MessageRead" mr ON mr."messageId" = m."id" AND mr."userId" = ${session.user.id}
    WHERE 
      (${session.user.role === "OWNER"} OR c."assignedToId" = ${session.user.id})
      AND m."senderId" != ${session.user.id}
      AND mr."id" IS NULL
  `

  return Number(result[0]?.count || 0)
}

export async function getUnreadMessagesByCase() {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const result = await prisma.$queryRaw<Array<{ caseId: string; count: bigint }>>`
    SELECT m."caseId", COUNT(DISTINCT m."id")::int as count
    FROM "Message" m
    INNER JOIN "Case" c ON c."id" = m."caseId"
    LEFT JOIN "MessageRead" mr ON mr."messageId" = m."id" AND mr."userId" = ${session.user.id}
    WHERE 
      (${session.user.role === "OWNER"} OR c."assignedToId" = ${session.user.id})
      AND m."senderId" != ${session.user.id}
      AND mr."id" IS NULL
    GROUP BY m."caseId"
  `

  const unreadByCase: Record<string, number> = {}
  result.forEach(item => {
    unreadByCase[item.caseId] = Number(item.count)
  })

  return unreadByCase
}
