import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    let settings = await prisma.emailSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.emailSettings.create({
        data: {
          isActive: true,
          checkInterval: 60,
          messagesToCheck: 50,
        },
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error("[*] Email settings GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch email settings" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const { messagesToCheck, isActive, checkInterval } = body
    
    let settings = await prisma.emailSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.emailSettings.create({
        data: {
          isActive: isActive !== undefined ? isActive : true,
          checkInterval: checkInterval !== undefined ? checkInterval : 60,
          messagesToCheck: messagesToCheck !== undefined ? messagesToCheck : 50,
        },
      })
    } else {
      settings = await prisma.emailSettings.update({
        where: { id: settings.id },
        data: {
          ...(messagesToCheck !== undefined && { messagesToCheck }),
          ...(isActive !== undefined && { isActive }),
          ...(checkInterval !== undefined && { checkInterval }),
        },
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error("[*] Email settings PATCH error:", error)
    return NextResponse.json(
      { error: "Failed to update email settings" },
      { status: 500 }
    )
  }
}
