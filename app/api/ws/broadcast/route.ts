import { NextResponse } from "next/server"

const broadcasts: Array<{ event: string; data: any; timestamp: number }> = []

export async function POST(request: Request) {
  try {
    const { event, data } = await request.json()
    
    broadcasts.push({
      event,
      data,
      timestamp: Date.now(),
    })

    if (broadcasts.length > 100) {
      broadcasts.splice(0, broadcasts.length - 100)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to broadcast" }, { status: 500 })
  }
}

export async function GET() {
  const recent = broadcasts.filter(b => Date.now() - b.timestamp < 5000)
  return NextResponse.json({ broadcasts: recent })
}
