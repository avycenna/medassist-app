import React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard/nav"
import { SocketProvider } from "@/contexts/socket-context"
import { GlobalNotificationListener } from "@/components/dashboard/global-notification-listener"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }
  
  return (
    <SocketProvider>
      <GlobalNotificationListener />
      <div className="min-h-screen bg-background">
        <DashboardNav user={session.user} />
        <main className="container mx-auto px-4 py-6 max-w-[1620px]">
          {children}
        </main>
      </div>
    </SocketProvider>
  )
}
