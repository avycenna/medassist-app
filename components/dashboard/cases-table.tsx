"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "./status-badge"
import { Eye, Search, Filter, Link as LinkIcon, Loader2 } from "lucide-react"
import { assignCaseToProvider, updateCaseStatus, generateMagicLinkForCase } from "@/lib/actions/cases"
import type { CaseStatus } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CaseWithProvider {
  id: string
  patientName: string | null
  firstName: string | null
  lastName: string | null
  status: CaseStatus
  assistanceType: string | null
  createdAt: Date
  assignedTo: {
    id: string
    name: string
    email: string
  } | null
}

interface Provider {
  id: string
  name: string
  email: string
}

interface CasesTableProps {
  cases: CaseWithProvider[]
  providers?: Provider[]
  isOwner?: boolean
  onRefresh?: () => void
}

const statusOptions: CaseStatus[] = [
  "PENDING",
  "ASSIGNED", 
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]

export function CasesTable({ cases, providers = [], isOwner = false, onRefresh }: CasesTableProps) {
  const [filter, setFilter] = useState<CaseStatus | "ALL">("ALL")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState<string | null>(null)
  const [magicLinkDialog, setMagicLinkDialog] = useState<{ open: boolean; url: string }>({
    open: false,
    url: "",
  })

  const filteredCases = cases.filter((c) => {
    const matchesFilter = filter === "ALL" || c.status === filter
    const matchesSearch = 
      search === "" ||
      c.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  async function handleAssignProvider(caseId: string, providerId: string) {
    setLoading(caseId)
    try {
      await assignCaseToProvider(caseId, providerId === "unassign" ? null : providerId)
      toast.success("Provider assignment updated")
      // Trigger realtime refresh
      onRefresh?.()
    } catch (error) {
      toast.error("Failed to update provider assignment")
    } finally {
      setLoading(null)
    }
  }

  async function handleStatusChange(caseId: string, status: CaseStatus) {
    setLoading(caseId)
    try {
      await updateCaseStatus(caseId, status)
      toast.success("Case status updated")
      // Trigger realtime refresh
      onRefresh?.()
    } catch (error) {
      toast.error("Failed to update case status")
    } finally {
      setLoading(null)
    }
  }

  async function handleGenerateMagicLink(caseId: string) {
    setLoading(caseId)
    try {
      const result = await generateMagicLinkForCase(caseId)
      setMagicLinkDialog({ open: true, url: result.url })
      toast.success("Magic link generated")
      // Trigger realtime refresh
      onRefresh?.()
    } catch (error) {
      toast.error("Failed to generate magic link")
    } finally {
      setLoading(null)
    }
  }

  function getPatientName(c: CaseWithProvider) {
    if (c.patientName) return c.patientName
    if (c.firstName || c.lastName) return `${c.firstName || ""} ${c.lastName || ""}`.trim()
    return "Unknown Patient"
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(v) => setFilter(v as CaseStatus | "ALL")}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-foreground">Patient</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-foreground hidden md:table-cell">Type</TableHead>
              <TableHead className="text-foreground hidden lg:table-cell">Created</TableHead>
              {isOwner && <TableHead className="text-foreground">Provider</TableHead>}
              <TableHead className="text-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isOwner ? 6 : 5} className="text-center py-8 text-muted-foreground">
                  No cases found
                </TableCell>
              </TableRow>
            ) : (
              filteredCases.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{getPatientName(c)}</p>
                      <p className="text-xs text-muted-foreground font-mono">{c.id.slice(0, 8)}...</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isOwner ? (
                      <Select
                        value={c.status}
                        onValueChange={(v) => handleStatusChange(c.id, v as CaseStatus)}
                        disabled={loading === c.id}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <StatusBadge status={c.status} />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              <StatusBadge status={status} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge status={c.status} />
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {c.assistanceType?.replace("_", " ") || "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {format(new Date(c.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  {isOwner && (
                    <TableCell>
                      <Select
                        value={c.assignedTo?.id || "unassign"}
                        onValueChange={(v) => handleAssignProvider(c.id, v)}
                        disabled={loading === c.id}
                      >
                        <SelectTrigger className="w-[150px] h-8 text-xs">
                          <SelectValue placeholder="Assign..." />
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
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleGenerateMagicLink(c.id)}
                          disabled={loading === c.id}
                          title="Generate magic link"
                        >
                          {loading === c.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <LinkIcon className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/cases/${c.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View case</span>
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Magic Link Dialog */}
      <Dialog open={magicLinkDialog.open} onOpenChange={(open) => setMagicLinkDialog({ ...magicLinkDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">Magic Link Generated</DialogTitle>
            <DialogDescription>
              Share this link with the client. They can use it to fill out their intake form and communicate about this case.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <code className="text-sm break-all text-foreground">{magicLinkDialog.url}</code>
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(magicLinkDialog.url)
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
