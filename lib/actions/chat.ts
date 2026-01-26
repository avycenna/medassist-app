"use server"

import prisma from "@/lib/prisma"
import { getSession, validateMagicLink, hashToken } from "@/lib/auth"
import { revalidateTag } from "next/cache"
import type { SenderType } from "@/lib/types"

// Send message as authenticated user (Owner/Provider)
export async function sendMessage(caseId: string, content: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")
  
  // Verify access to case
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
  })
  
  if (!caseData) {
    throw new Error("Case not found")
  }
  
  // Provider can only message on assigned cases
  if (session.user.role === "PROVIDER" && caseData.assignedToId !== session.user.id) {
    throw new Error("Unauthorized")
  }
  
  const message = await prisma.message.create({
    data: {
      caseId,
      content,
      senderType: session.user.role as SenderType,
      senderId: session.user.id,
    },
    include: {
      sender: {
        select: { id: true, name: true, role: true },
      },
    },
  })
  
  revalidateTag("messages", "max")
  return message
}

// Send message as client via magic link
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

// Get messages for a case (authenticated user)
export async function getCaseMessages(caseId: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")
  
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
  })
  
  if (!caseData) {
    throw new Error("Case not found")
  }
  
  if (session.user.role === "PROVIDER" && caseData.assignedToId !== session.user.id) {
    throw new Error("Unauthorized")
  }
  
  const messages = await prisma.message.findMany({
    where: { caseId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: { id: true, name: true, role: true },
      },
    },
  })
  
  return messages
}

// Get messages for client via magic link
export async function getClientMessages(token: string) {
  const validation = await validateMagicLink(token)
  
  if (!validation.valid || !validation.magicLink) {
    throw new Error(validation.error || "Invalid link")
  }
  
  const messages = await prisma.message.findMany({
    where: { caseId: validation.magicLink.caseId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: { id: true, name: true, role: true },
      },
    },
  })
  
  // Add client name for client messages
  return messages.map(msg => ({
    ...msg,
    senderName: msg.senderType === "CLIENT" 
      ? `${validation.magicLink!.clientFirstName} ${validation.magicLink!.clientLastName}`
      : msg.sender?.name || "Staff",
  }))
}

// Complete intake form
export async function completeIntakeForm(
  token: string,
  data: { firstName: string; lastName: string; email: string; phone: string }
) {
  const tokenHash = await hashToken(token)
  
  const magicLink = await prisma.magicLink.findUnique({
    where: { tokenHash },
    include: { case: true },
  })
  
  if (!magicLink) {
    throw new Error("Invalid link")
  }
  
  if (magicLink.revokedAt) {
    throw new Error("This link has been revoked")
  }
  
  if (magicLink.expiresAt && magicLink.expiresAt < new Date()) {
    throw new Error("This link has expired")
  }
  
  // Update magic link with client info
  await prisma.magicLink.update({
    where: { id: magicLink.id },
    data: {
      clientFirstName: data.firstName,
      clientLastName: data.lastName,
      clientEmail: data.email,
      clientPhone: data.phone,
      intakeCompleted: true,
      usedAt: new Date(),
    },
  })
  
  // Update case with client info if not already set
  if (!magicLink.case.firstName) {
    await prisma.case.update({
      where: { id: magicLink.caseId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phone,
        patientName: `${data.firstName} ${data.lastName}`,
      },
    })
  }
  
  revalidateTag("cases", "max")
  return { success: true }
}

// Get case info for client
export async function getClientCaseInfo(token: string) {
  const validation = await validateMagicLink(token)
  
  if (!validation.valid || !validation.magicLink) {
    return { valid: false, error: validation.error }
  }
  
  return {
    valid: true,
    intakeCompleted: validation.magicLink.intakeCompleted,
    case: {
      id: validation.case!.id,
      status: validation.case!.status,
      assistanceType: validation.case!.assistanceType,
    },
    client: validation.magicLink.intakeCompleted ? {
      firstName: validation.magicLink.clientFirstName,
      lastName: validation.magicLink.clientLastName,
    } : null,
  }
}

// Mark message as read
export async function markMessageAsRead(messageId: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  // Check if already read
  const existingRead = await prisma.messageRead.findUnique({
    where: {
      messageId_userId: {
        messageId,
        userId: session.user.id,
      },
    },
  })

  if (existingRead) {
    return { success: true, alreadyRead: true }
  }

  await prisma.messageRead.create({
    data: {
      messageId,
      userId: session.user.id,
    },
  })

  return { success: true, alreadyRead: false }
}

// Mark all messages in a case as read
export async function markCaseMessagesAsRead(caseId: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const messages = await prisma.message.findMany({
    where: { caseId },
    select: { id: true },
  })

  for (const message of messages) {
    await prisma.messageRead.upsert({
      where: {
        messageId_userId: {
          messageId: message.id,
          userId: session.user.id,
        },
      },
      create: {
        messageId: message.id,
        userId: session.user.id,
      },
      update: {},
    })
  }

  return { success: true, count: messages.length }
}

// Get unread message count for user
export async function getUnreadMessageCount() {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  // Get all cases the user has access to
  const cases = session.user.role === "OWNER"
    ? await prisma.case.findMany({ select: { id: true } })
    : await prisma.case.findMany({
        where: { assignedToId: session.user.id },
        select: { id: true },
      })

  const caseIds = cases.map(c => c.id)

  // Count messages in these cases that user hasn't read
  const unreadCount = await prisma.message.count({
    where: {
      caseId: { in: caseIds },
      senderId: { not: session.user.id }, // Don't count own messages
      readBy: {
        none: {
          userId: session.user.id,
        },
      },
    },
  })

  return unreadCount
}

// Get unread message count per case
export async function getUnreadMessagesByCase() {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const cases = session.user.role === "OWNER"
    ? await prisma.case.findMany({ select: { id: true } })
    : await prisma.case.findMany({
        where: { assignedToId: session.user.id },
        select: { id: true },
      })

  const caseIds = cases.map(c => c.id)

  const unreadByCaseRaw = await prisma.message.groupBy({
    by: ['caseId'],
    where: {
      caseId: { in: caseIds },
      senderId: { not: session.user.id },
      readBy: {
        none: {
          userId: session.user.id,
        },
      },
    },
    _count: {
      id: true,
    },
  })

  const unreadByCase: Record<string, number> = {}
  unreadByCaseRaw.forEach(item => {
    unreadByCase[item.caseId] = item._count.id
  })

  return unreadByCase
}
