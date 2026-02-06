"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "./status-badge"
import { ChatPanel } from "./chat-panel"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
  Activity,
  Building,
  Globe,
  Plane,
  Shield,
  Hash,
  AlertCircle,
  Stethoscope,
  Info,
  CreditCard,
  CheckCircle2,
  XCircle,
  Timer,
  Flag
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
import { toast } from "sonner"

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
    idAssist: number | null
    codeAssist: string | null
    codigo: string | null
    prefijo: string | null
    passport: string | null
    isoCountry: string | null
    origin: string | null
    isoCountrySource: string | null
    descAssistanceType: string | null
    idAssistanceType: number | null
    canCancelVoucher: string | null
    clientName: string | null
    symptom: string | null
    symptomDetail: string | null
    idUsersCreated: number | null
    reportedDate: Date | null
    registeredDate: Date | null
    triageStatus: string | null
    triageColor: string | null
    triageLabel: string | null
    refund: string | null
    voucherIsManual: string | null
    specialityLocation: string | null
    approvedStatus: number | null
    assignedToAssistance: string | null
    statusAssistStatus: string | null
    statusAssistIcon: string | null
    statusAssistLabel: string | null
    view: string | null
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

function getCountryFlagUrl(countryCode: string | null): string | null {
  if (!countryCode) return null
  const code = countryCode.toLowerCase()
  return `https://flagcdn.com/w20/${code}.png`
}

function getTriageBadgeColor(color: string | null): string {
  if (!color) return "bg-gray-500"
  const colorMap: Record<string, string> = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500",
    blue: "bg-blue-500",
  }
  return colorMap[color.toLowerCase()] || "bg-gray-500"
}

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
      toast.success("Provider assignment updated")
      onRefresh?.()
    } catch (error) {
      toast.error("Failed to update provider assignment")
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(status: CaseStatus) {
    setLoading(true)
    try {
      await updateCaseStatus(caseData.id, status)
      toast.success("Case status updated")
      onRefresh?.()
    } catch (error) {
      toast.error("Failed to update case status")
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateMagicLink() {
    setLoading(true)
    try {
      const result = await generateMagicLinkForCase(caseData.id)
      setMagicLinkDialog({ open: true, url: result.url })
      toast.success("Magic link generated")
      onRefresh?.()
    } catch (error) {
      toast.error("Failed to generate magic link")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/cases">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{getPatientName()}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground font-mono">{caseData.id.slice(0, 12)}...</p>
              {caseData.codeAssist && (
                <Badge variant="outline" className="text-xs">
                  {caseData.codeAssist}
                </Badge>
              )}
              {caseData.source && (
                <Badge variant="secondary" className="text-xs">
                  {caseData.source}
                </Badge>
              )}
            </div>
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

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assistance">Assistance</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="communication">Messages</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {caseData.dob && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date of Birth</p>
                          <p className="text-sm text-foreground mt-1">
                            {format(new Date(caseData.dob), "MMMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    )}
                    {caseData.phoneNumber && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</p>
                          <p className="text-sm text-foreground mt-1">{caseData.phoneNumber}</p>
                        </div>
                      </div>
                    )}
                    {caseData.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
                          <p className="text-sm text-foreground mt-1 break-all">{caseData.email}</p>
                        </div>
                      </div>
                    )}
                    {caseData.address && (
                      <div className="flex items-start gap-3 sm:col-span-2">
                        <MapPin className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Address</p>
                          <p className="text-sm text-foreground mt-1">{caseData.address}</p>
                        </div>
                      </div>
                    )}
                    {(caseData.isoCountry || caseData.nationality) && (
                      <div className="flex items-start gap-3 sm:col-span-2">
                        <Globe className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Country & Nationality</p>
                          <div className="flex items-center gap-3 flex-wrap">
                            {caseData.isoCountry && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-2">
                                    {getCountryFlagUrl(caseData.isoCountry) && (
                                      <img 
                                        src={getCountryFlagUrl(caseData.isoCountry)!} 
                                        alt={caseData.isoCountry}
                                        className="w-5 h-3 object-cover rounded"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none'
                                        }}
                                      />
                                    )}
                                    <span className="text-sm font-medium text-foreground">
                                      {caseData.isoCountry.toUpperCase()}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Destination Country</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {caseData.nationality && (
                              <Badge variant="outline" className="text-xs">
                                {caseData.nationality}
                              </Badge>
                            )}
                            {caseData.isoCountrySource && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-2">
                                    {getCountryFlagUrl(caseData.isoCountrySource) && (
                                      <img 
                                        src={getCountryFlagUrl(caseData.isoCountrySource)!} 
                                        alt={caseData.isoCountrySource}
                                        className="w-5 h-3 object-cover rounded"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none'
                                        }}
                                      />
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      From {caseData.isoCountrySource.toUpperCase()}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Source Country</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {(caseData.symptoms || caseData.symptom) && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      Symptoms & Complaint
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {caseData.symptom && caseData.symptomDetail ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Symptom</p>
                          <p className="text-sm text-foreground font-medium">{caseData.symptom}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Details</p>
                          <p className="text-sm text-foreground">{caseData.symptomDetail}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground whitespace-pre-wrap bg-muted p-4 rounded-md">
                        {caseData.symptoms}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Case Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {caseData.assistanceType && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Assistance Type</p>
                        <Badge variant="outline" className="mt-1">
                          {caseData.assistanceType.replace("_", " ")}
                        </Badge>
                        {caseData.descAssistanceType && (
                          <p className="text-sm text-muted-foreground mt-1">{caseData.descAssistanceType}</p>
                        )}
                      </div>
                    )}
                    {caseData.referenceNumber && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Reference Number</p>
                        <p className="text-sm text-foreground font-mono">{caseData.referenceNumber}</p>
                      </div>
                    )}
                    {caseData.availability && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Availability</p>
                        <p className="text-sm text-foreground">{caseData.availability}</p>
                      </div>
                    )}
                    {(caseData.triageStatus || caseData.triageLabel) && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Triage</p>
                        <div className="flex items-center gap-2 mt-1">
                          {caseData.triageColor && (
                            <div className={`w-3 h-3 rounded-full ${getTriageBadgeColor(caseData.triageColor)}`} />
                          )}
                          <span className="text-sm text-foreground">
                            {caseData.triageLabel || caseData.triageStatus || "—"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

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
            </TabsContent>

            <TabsContent value="assistance" className="space-y-6 mt-6">
              {(caseData.idAssist || caseData.codeAssist || caseData.clientName) && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Assistance Information
                    </CardTitle>
                    <CardDescription>Insurance and assistance provider details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2">
                      {caseData.idAssist && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Assistance ID</p>
                          <p className="text-sm text-foreground font-mono font-semibold">{caseData.idAssist}</p>
                        </div>
                      )}
                      {caseData.codeAssist && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Assistance Code</p>
                          <p className="text-sm text-foreground font-mono font-semibold">{caseData.codeAssist}</p>
                        </div>
                      )}
                      {caseData.clientName && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Insurance Provider</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-foreground font-medium">{caseData.clientName}</p>
                          </div>
                        </div>
                      )}
                      {caseData.descAssistanceType && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Assistance Type Description</p>
                          <p className="text-sm text-foreground">{caseData.descAssistanceType}</p>
                        </div>
                      )}
                      {caseData.statusAssistLabel && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Assistance Status</p>
                          <Badge variant="outline" className="mt-1">
                            {caseData.statusAssistLabel}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {(caseData.passport || caseData.isoCountry || caseData.isoCountrySource || caseData.origin) && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Plane className="h-5 w-5" />
                      Travel Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2">
                      {caseData.passport && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Passport/Document</p>
                          <p className="text-sm text-foreground font-mono">{caseData.passport}</p>
                        </div>
                      )}
                      {caseData.origin && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Contact Origin</p>
                          <p className="text-sm text-foreground">{caseData.origin}</p>
                        </div>
                      )}
                      {caseData.isoCountrySource && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">From Country</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getCountryFlagUrl(caseData.isoCountrySource) && (
                              <img 
                                src={getCountryFlagUrl(caseData.isoCountrySource)!} 
                                alt={caseData.isoCountrySource}
                                className="w-5 h-3 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            )}
                            <span className="text-sm text-foreground font-medium">
                              {caseData.isoCountrySource.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      )}
                      {caseData.isoCountry && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Destination Country</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getCountryFlagUrl(caseData.isoCountry) && (
                              <img 
                                src={getCountryFlagUrl(caseData.isoCountry)!} 
                                alt={caseData.isoCountry}
                                className="w-5 h-3 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            )}
                            <span className="text-sm text-foreground font-medium">
                              {caseData.isoCountry.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Voucher & Billing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {caseData.codigo && (
                      <Badge variant="outline">
                        Code: {caseData.codigo}
                      </Badge>
                    )}
                    {caseData.prefijo && (
                      <Badge variant="outline">
                        Prefix: {caseData.prefijo}
                      </Badge>
                    )}
                    {caseData.refund === 'Y' && (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Refund Eligible
                      </Badge>
                    )}
                    {caseData.voucherIsManual === 'Y' && (
                      <Badge variant="default" className="bg-amber-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Manual Voucher
                      </Badge>
                    )}
                    {caseData.canCancelVoucher && (
                      <Badge variant="outline">
                        Cancel: {caseData.canCancelVoucher}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {(caseData.specialityLocation || caseData.assignedToAssistance) && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Service Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {caseData.specialityLocation && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Specialty/Location</p>
                          <p className="text-sm text-foreground">{caseData.specialityLocation}</p>
                        </div>
                      )}
                      {caseData.assignedToAssistance && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Assigned To Assistance</p>
                          <p className="text-sm text-foreground">{caseData.assignedToAssistance}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="medical" className="space-y-6 mt-6">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {(caseData.symptom || caseData.symptomDetail) && (
                      <div className="sm:col-span-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Symptoms</p>
                        {caseData.symptom && (
                          <p className="text-sm text-foreground font-medium mb-1">{caseData.symptom}</p>
                        )}
                        {caseData.symptomDetail && (
                          <p className="text-sm text-muted-foreground">{caseData.symptomDetail}</p>
                        )}
                      </div>
                    )}
                    {caseData.specialityLocation && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Specialty</p>
                        <p className="text-sm text-foreground">{caseData.specialityLocation}</p>
                      </div>
                    )}
                    {caseData.triageLabel && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Triage Level</p>
                        <div className="flex items-center gap-2 mt-1">
                          {caseData.triageColor && (
                            <div className={`w-3 h-3 rounded-full ${getTriageBadgeColor(caseData.triageColor)}`} />
                          )}
                          <span className="text-sm text-foreground">{caseData.triageLabel}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Important Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Case Created</p>
                      <p className="text-sm text-foreground">{format(new Date(caseData.createdAt), "PPpp")}</p>
                    </div>
                    {caseData.reportedDate && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Reported Date</p>
                        <p className="text-sm text-foreground">{format(new Date(caseData.reportedDate), "PPpp")}</p>
                      </div>
                    )}
                    {caseData.registeredDate && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Registered Date</p>
                        <p className="text-sm text-foreground">{format(new Date(caseData.registeredDate), "PPpp")}</p>
                      </div>
                    )}
                    {caseData.emailReceivedAt && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Email Received</p>
                        <p className="text-sm text-foreground">{format(new Date(caseData.emailReceivedAt), "PPpp")}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communication" className="mt-6">
              <ChatPanel 
                caseId={caseData.id} 
                messages={caseData.messages}
                currentUser={currentUser}
                onRefresh={onRefresh}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {isOwner && (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
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
                          <StatusBadge status={status} />
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

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Status Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {caseData.statusHistory.length > 0 ? (
                  caseData.statusHistory.map((entry, index) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        {index < caseData.statusHistory.length - 1 && (
                          <div className="w-px h-full bg-border min-h-[40px]" />
                        )}
                      </div>
                      <div className="pb-4 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
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
                          <p className="text-xs text-muted-foreground mt-1 italic">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No status history available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {isOwner && caseData.magicLinks.length > 0 && (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Client Links</CardTitle>
                <CardDescription>Magic links generated for this case</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {caseData.magicLinks.map((link) => (
                    <div key={link.id} className="p-3 bg-muted rounded-md border">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(link.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {link.intakeCompleted ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed by {link.clientFirstName} {link.clientLastName}
                          </Badge>
                        ) : link.revokedAt ? (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Revoked
                          </Badge>
                        ) : link.expiresAt && new Date(link.expiresAt) < new Date() ? (
                          <Badge variant="default" className="bg-amber-600">
                            <Timer className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Timer className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
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
              onClick={() => {
                navigator.clipboard.writeText(magicLinkDialog.url)
                toast.success("Link copied to clipboard")
              }}
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
