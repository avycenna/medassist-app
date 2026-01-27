import { getSession } from "@/lib/auth"
import { getAllProviders } from "@/lib/actions/cases"
import { MessagingInterface } from "@/components/dashboard/messaging-interface"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function MessagesPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  
  const isOwner = session.user.role === "OWNER"
  
  let users = []
  
  if (isOwner) {
    const providers = await getAllProviders()
    users = providers.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      role: "PROVIDER" as const,
    }))
  } else {
    const owner = await prisma.user.findFirst({
      where: { role: "OWNER" },
      select: { id: true, name: true, email: true, role: true },
    })
    if (owner) {
      users = [owner]
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {isOwner ? "Messages - Team Communication" : "Messages - Admin Communication"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isOwner 
            ? "Communicate with your providers" 
            : "Communicate with your admin"}
        </p>
      </div>

      <MessagingInterface 
        users={users}
        currentUser={session.user}
        isOwner={isOwner}
      />
    </div>
  )
}
