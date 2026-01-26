"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IntakeForm } from "./intake-form"
import { ClientChat } from "./client-chat"
import { Status, StatusLabel, StatusIndicator } from "@/components/ui/status"
import { CheckCircle2, MessageCircle, ClipboardList } from "lucide-react"

interface ClientPortalProps {
  token: string
  intakeCompleted: boolean
  caseInfo?: {
    id: string
    status: string
    assistanceType: string | null
  }
  clientInfo?: {
    firstName: string | null
    lastName: string | null
  } | null
}

export function ClientPortal({ token, intakeCompleted, caseInfo, clientInfo }: ClientPortalProps) {
  const [completed, setCompleted] = useState(intakeCompleted)
  const [client, setClient] = useState(clientInfo)

  function handleIntakeComplete(data: { firstName: string; lastName: string }) {
    setCompleted(true)
    setClient({ firstName: data.firstName, lastName: data.lastName })
  }

  if (!completed) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">Patient Intake Form</CardTitle>
              <CardDescription>
                Please provide your information to continue
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <IntakeForm token={token} onComplete={handleIntakeComplete} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-card border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">
                Welcome, {client?.firstName || "Patient"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Your information has been received. You can now communicate with our medical team about your case.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {caseInfo?.status && (
                  <Status variant={
                    caseInfo.status === "COMPLETED" ? "success" :
                    caseInfo.status === "CANCELLED" ? "error" :
                    caseInfo.status === "IN_PROGRESS" ? "info" :
                    caseInfo.status === "ASSIGNED" ? "info" :
                    "warning"
                  }>
                    <StatusIndicator />
                    <StatusLabel>Status: {caseInfo.status.replace("_", " ")}</StatusLabel>
                  </Status>
                )}
                {caseInfo?.assistanceType && (
                  <Status variant="default">
                    <StatusLabel>{caseInfo.assistanceType.replace("_", " ")}</StatusLabel>
                  </Status>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">Messages</CardTitle>
          </div>
          <CardDescription>
            Communicate with our medical team about your case
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientChat token={token} clientName={`${client?.firstName || ""} ${client?.lastName || ""}`} />
        </CardContent>
      </Card>
    </div>
  )
}
