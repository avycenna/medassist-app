export async function broadcastToClients(event: string, data: any) {
  if (typeof window !== "undefined") return

  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ws/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data }),
    })
  } catch (error) {
    console.error("Failed to broadcast WebSocket event:", error)
  }
}
