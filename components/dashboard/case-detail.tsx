"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Status, StatusLabel } from "@/components/ui/status"
import { StatusBadge } from "./status-badge"
import { ChatPanel } from "./chat-panel"
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  FileText,
  ChevronDown,
  Link as LinkIcon,
  Loader2,
  Clock,
  Activity
} from "lucide-react"
import { assignCaseToProvider, updateCaseStatus, generateMagicLinkForCase } from "@/lib/actions/cases"
import type { CaseStatus, User as UserType, SenderType } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CaseDetailProps {
  caseData: {
    id: string
    patientName: string | null
    firstName: string | null
    lastName: string | null
    dob: Date | null
    address: string | null
    phoneNumber: string | null
    email: string | null
    nationality: string | null
    symptoms: string | null
    symptomsRaw: string | null
    assistanceType: string | null
    referenceNumber: string | null
    availability: string | null
    status: CaseStatus
    assignedToId: string | null
    source: string
    rawEmailContent: string | null
    emailSubject: string | null
    emailFrom: string | null
    emailReceivedAt: Date | null
    createdAt: Date
    updatedAt: Date
    assignedTo: { id: string; name: string; email: string } | null
    messages: Array<{
      id: string
      content: string
      senderType: SenderType
      createdAt: Date
      sender: { id: string; name: string; role: string } | null
    }>
    statusHistory: Array<{
      id: string
      fromStatus: CaseStatus | null
      toStatus: CaseStatus
      note: string | null
      createdAt: Date
    }>
    magicLinks: Array<{
      id: string
      intakeCompleted: boolean
      clientFirstName: string | null
      clientLastName: string | null
      createdAt: Date
      expiresAt: Date | null
      revokedAt: Date | null
    }>
  }
  providers: Array<{ id: string; name: string; email: string }>
  currentUser: UserType
  onRefresh?: () => void
}

const statusOptions: CaseStatus[] = [
  "PENDING",
  "ASSIGNED", 
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]

export function CaseDetail({ caseData, providers, currentUser, onRefresh }: CaseDetailProps) {
  const [loading, setLoading] = useState(false)
  const [rawEmailOpen, setRawEmailOpen] = useState(false)
  const [magicLinkDialog, setMagicLinkDialog] = useState<{ open: boolean; url: string }>({
    open: false,
    url: "",
  })
  
  const isOwner = currentUser.role === "OWNER"
  
  function getPatientName() {
    if (caseData.patientName) return caseData.patientName
    if (caseData.firstName || caseData.lastName) {
      return `${caseData.firstName || ""} ${caseData.lastName || ""}`.trim()
    }
    return "Unknown Patient"
  }

  async function handleAssignProvider(providerId: string) {
    setLoading(true)
    try {
      await assignCaseToProvider(caseData.id, providerId === "unassign" ? null : providerId)
      onRefresh?.()
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(status: CaseStatus) {
    setLoading(true)
    try {
      await updateCaseStatus(caseData.id, status)
      onRefresh?.()
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateMagicLink() {
    setLoading(true)
    try {
      const result = await generateMagicLinkForCase(caseData.id)
      setMagicLinkDialog({ open: true, url: result.url })
      onRefresh?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/cases">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{getPatientName()}</h1>
            <p className="text-sm text-muted-foreground font-mono">{caseData.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={caseData.status} />
          {isOwner && (
            <Button onClick={handleGenerateMagicLink} disabled={loading} variant="outline">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LinkIcon className="h-4 w-4 mr-2" />
              )}
              Generate Link
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Info */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Case Information</CardTitle>
              <CardDescription>Patient details and case data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Patient Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                {caseData.dob && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Date of Birth</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(caseData.dob), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                )}
                {caseData.phoneNumber && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Phone</p>
                      <p className="text-sm text-muted-foreground">{caseData.phoneNumber}</p>
                    </div>
                  </div>
                )}
                {caseData.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">{caseData.email}</p>
                    </div>
                  </div>
                )}
                {caseData.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Address</p>
                      <p className="text-sm text-muted-foreground">{caseData.address}</p>
                    </div>
                  </div>
                )}
                {caseData.nationality && (
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Nationality</p>
                      <p className="text-sm text-muted-foreground">{caseData.nationality}</p>
                    </div>
                  </div>
                )}
                {caseData.assistanceType && (
                  <div className="flex items-start gap-3">
                    <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Type of Assistance</p>
                      <p className="text-sm text-muted-foreground">
                        {caseData.assistanceType.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Symptoms */}
              {caseData.symptoms && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Symptoms / Complaint</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {caseData.symptoms}
                  </p>
                </div>
              )}

              {/* Reference & Availability */}
              <div className="flex flex-wrap gap-4">
                {caseData.referenceNumber && (
                  <Status variant="default">
                    <StatusLabel>Ref: {caseData.referenceNumber}</StatusLabel>
                  </Status>
                )}
                {caseData.availability && (
                  <Status variant="default">
                    <StatusLabel>Available: {caseData.availability}</StatusLabel>
                  </Status>
                )}
                <Status variant="default">
                  <StatusLabel>Source: {caseData.source}</StatusLabel>
                </Status>
              </div>
            </CardContent>
          </Card>

          {/* Raw Email */}
          {caseData.rawEmailContent && (
            <Collapsible open={rawEmailOpen} onOpenChange={setRawEmailOpen}>
              <Card className="bg-card">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-foreground">Original Email</CardTitle>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${rawEmailOpen ? "rotate-180" : ""}`} />
                    </div>
                    {caseData.emailSubject && (
                      <CardDescription>{caseData.emailSubject}</CardDescription>
                    )}
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      {caseData.emailFrom && <p><strong>From:</strong> {caseData.emailFrom}</p>}
                      {caseData.emailReceivedAt && (
                        <p><strong>Received:</strong> {format(new Date(caseData.emailReceivedAt), "PPpp")}</p>
                      )}
                    </div>
                    <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap font-mono text-foreground">
                      {caseData.rawEmailContent}
                    </pre>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {isOwner && (
            <ChatPanel 
              caseId={caseData.id} 
              messages={caseData.messages}
              currentUser={currentUser}
              onRefresh={onRefresh}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {isOwner && (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <Select
                    value={caseData.status}
                    onValueChange={(v) => handleStatusChange(v as CaseStatus)}
                    disabled={loading}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Assigned Provider</label>
                  <Select
                    value={caseData.assignedTo?.id || "unassign"}
                    onValueChange={handleAssignProvider}
                    disabled={loading}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Assign provider..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassign">Unassigned</SelectItem>
                      {providers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {caseData.statusHistory.map((entry, index) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {index < caseData.statusHistory.length - 1 && (
                        <div className="w-px h-full bg-border" />
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2">
                        {entry.fromStatus && (
                          <>
                            <StatusBadge status={entry.fromStatus} className="text-xs" />
                            <span className="text-muted-foreground">→</span>
                          </>
                        )}
                        <StatusBadge status={entry.toStatus} className="text-xs" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(entry.createdAt), "MMM d, yyyy h:mm a")}
                      </p>
                      {entry.note && (
                        <p className="text-xs text-muted-foreground mt-1">{entry.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Magic Links */}
          {isOwner && caseData.magicLinks.length > 0 && (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Client Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {caseData.magicLinks.map((link) => (
                    <div key={link.id} className="text-sm p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {format(new Date(link.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {link.intakeCompleted ? (
                          <Status variant="success">
                            <StatusLabel>
                              Completed by {link.clientFirstName} {link.clientLastName}
                            </StatusLabel>
                          </Status>
                        ) : link.revokedAt ? (
                          <Status variant="error">
                            <StatusLabel>Revoked</StatusLabel>
                          </Status>
                        ) : link.expiresAt && new Date(link.expiresAt) < new Date() ? (
                          <Status variant="warning">
                            <StatusLabel>Expired</StatusLabel>
                          </Status>
                        ) : (
                          <Status variant="info">
                            <StatusLabel>Pending</StatusLabel>
                          </Status>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Magic Link Dialog */}
      <Dialog open={magicLinkDialog.open} onOpenChange={(open) => setMagicLinkDialog({ ...magicLinkDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Magic Link Generated</DialogTitle>
            <DialogDescription>
              Share this link with the client for intake and communication.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <code className="text-sm break-all text-foreground">{magicLinkDialog.url}</code>
            </div>
            <Button
              onClick={() => navigator.clipboard.writeText(magicLinkDialog.url)}
              className="w-full"
            >
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
