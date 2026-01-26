import React from "react"
import { ClientSocketProvider } from "@/contexts/client-socket-context"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientSocketProvider>{children}</ClientSocketProvider>
}
