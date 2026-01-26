"use server"

import prisma from "@/lib/prisma"
import { getSession, requireRole, createMagicLink } from "@/lib/auth"
import { revalidateTag } from "next/cache"
import type { CaseStatus, AssistanceType } from "@/lib/types"

// Get all cases (for owner)
export async function getAllCases() {
  await requireRole(["OWNER"])
  
  const cases = await prisma.case.findMany({
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  
  return cases
}

// Get cases for provider (only assigned)
export async function getProviderCases() {
  const session = await getSession()
  if (!session || session.user.role !== "PROVIDER") {
    throw new Error("Unauthorized")
  }
  
  const cases = await prisma.case.findMany({
    where: { assignedToId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
  
  return cases
}

// Get single case with full details
export async function getCaseById(caseId: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")
  
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: { id: true, name: true, role: true },
          },
        },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
      magicLinks: {
        select: {
          id: true,
          intakeCompleted: true,
          clientFirstName: true,
          clientLastName: true,
          createdAt: true,
          expiresAt: true,
          revokedAt: true,
        },
      },
    },
  })
  
  if (!caseData) {
    throw new Error("Case not found")
  }
  
  // Provider can only view assigned cases
  if (session.user.role === "PROVIDER" && caseData.assignedToId !== session.user.id) {
    throw new Error("Unauthorized")
  }
  
  return caseData
}

// Update case status
export async function updateCaseStatus(caseId: string, newStatus: CaseStatus, note?: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")
  
  const existingCase = await prisma.case.findUnique({
    where: { id: caseId },
  })
  
  if (!existingCase) {
    throw new Error("Case not found")
  }
  
  // Provider can only update their assigned cases
  if (session.user.role === "PROVIDER" && existingCase.assignedToId !== session.user.id) {
    throw new Error("Unauthorized")
  }
  
  const [updatedCase] = await prisma.$transaction([
    prisma.case.update({
      where: { id: caseId },
      data: { status: newStatus },
    }),
    prisma.statusHistory.create({
      data: {
        caseId,
        fromStatus: existingCase.status,
        toStatus: newStatus,
        changedBy: session.user.id,
        note,
      },
    }),
  ])
  
  revalidateTag("cases", "max")
  return updatedCase
}

// Assign case to provider
export async function assignCaseToProvider(caseId: string, providerId: string | null) {
  await requireRole(["OWNER"])
  
  const [updatedCase] = await prisma.$transaction([
    prisma.case.update({
      where: { id: caseId },
      data: {
        assignedToId: providerId,
        status: providerId ? "ASSIGNED" : "PENDING",
      },
    }),
    ...(providerId
      ? [
          prisma.statusHistory.create({
            data: {
              caseId,
              fromStatus: "PENDING",
              toStatus: "ASSIGNED",
              note: `Assigned to provider`,
            },
          }),
        ]
      : []),
  ])
  
  revalidateTag("cases", "max")
  return updatedCase
}

// Generate magic link for a case
export async function generateMagicLinkForCase(caseId: string) {
  await requireRole(["OWNER"])
  
  const magicLinkUrl = await createMagicLink(caseId)
  
  return { url: magicLinkUrl }
}

// Get dashboard stats
export async function getDashboardStats() {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")
  
  const whereClause = session.user.role === "PROVIDER" 
    ? { assignedToId: session.user.id }
    : {}
  
  const [pending, assigned, inProgress, completed, cancelled, total] = await Promise.all([
    prisma.case.count({ where: { ...whereClause, status: "PENDING" } }),
    prisma.case.count({ where: { ...whereClause, status: "ASSIGNED" } }),
    prisma.case.count({ where: { ...whereClause, status: "IN_PROGRESS" } }),
    prisma.case.count({ where: { ...whereClause, status: "COMPLETED" } }),
    prisma.case.count({ where: { ...whereClause, status: "CANCELLED" } }),
    prisma.case.count({ where: whereClause }),
  ])
  
  return { pending, assigned, inProgress, completed, cancelled, total }
}

// Create a case manually
export async function createCase(data: {
  patientName?: string
  firstName?: string
  lastName?: string
  dob?: Date
  address?: string
  phoneNumber?: string
  email?: string
  symptoms?: string
  assistanceType?: AssistanceType
}) {
  await requireRole(["OWNER"])
  
  const newCase = await prisma.case.create({
    data: {
      ...data,
      source: "MANUAL",
      status: "PENDING",
    },
  })
  
  await prisma.statusHistory.create({
    data: {
      caseId: newCase.id,
      toStatus: "PENDING",
      note: "Case created manually",
    },
  })
  
  revalidateTag("cases", "max")
  return newCase
}

// Get all providers
export async function getAllProviders() {
  await requireRole(["OWNER"])
  
  const providers = await prisma.user.findMany({
    where: { role: "PROVIDER" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      createdAt: true,
      _count: {
        select: { assignedCases: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  
  return providers
}

// Revoke magic link
export async function revokeMagicLink(magicLinkId: string) {
  await requireRole(["OWNER"])
  
  await prisma.magicLink.update({
    where: { id: magicLinkId },
    data: { revokedAt: new Date() },
  })
  
  revalidateTag("cases", "max")
}
