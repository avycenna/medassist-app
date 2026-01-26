import { NextResponse } from "next/server"
import { getUnreadMessageCount, getUnreadMessagesByCase } from "@/lib/actions/chat"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const byCase = searchParams.get("byCase") === "true"

    if (byCase) {
      const unreadByCase = await getUnreadMessagesByCase()
      return NextResponse.json({ unreadByCase })
    } else {
      const unreadCount = await getUnreadMessageCount()
      return NextResponse.json({ unreadCount })
    }
  } catch (error) {
    console.error("Failed to get unread messages:", error)
    return NextResponse.json(
      { error: "Failed to get unread messages" },
      { status: 500 }
    )
  }
}
