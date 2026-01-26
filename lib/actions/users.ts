"use server"

import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { hash } from "bcryptjs"
import { revalidateTag } from "next/cache"
import { broadcastToClients } from "@/lib/websocket-broadcast"

export async function updateProvider(providerId: string, data: {
  name?: string
  email?: string
  username?: string
  password?: string
}) {
  await requireRole(["OWNER"])

  const updateData: any = {}
  
  if (data.name) updateData.name = data.name
  if (data.email) updateData.email = data.email
  if (data.username) updateData.username = data.username
  
  if (data.password) {
    updateData.passwordHash = await hash(data.password, 10)
  }

  const updatedProvider = await prisma.user.update({
    where: { id: providerId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
    },
  })

  revalidateTag("providers")
  broadcastToClients("providers:updated", { providerId })
  return updatedProvider
}

export async function deleteProvider(providerId: string) {
  await requireRole(["OWNER"])

  const provider = await prisma.user.findUnique({
    where: { id: providerId },
    include: {
      _count: {
        select: { assignedCases: true },
      },
    },
  })

  if (!provider) {
    throw new Error("Provider not found")
  }

  if (provider._count.assignedCases > 0) {
    throw new Error("Cannot delete provider with assigned cases. Please reassign or complete their cases first.")
  }

  await prisma.user.delete({
    where: { id: providerId },
  })

  revalidateTag("providers")
  broadcastToClients("providers:updated", {})
}
