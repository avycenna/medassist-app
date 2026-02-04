"use client"

import { useState, useMemo } from "react"
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
import { 
  Eye, 
  Search, 
  Filter, 
  Link as LinkIcon, 
  Loader2, 
  Archive, 
  ArchiveRestore, 
  Trash2, 
  ArchiveX,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { assignCaseToProvider, updateCaseStatus, generateMagicLinkForCase, archiveCase, unarchiveCase, deleteCase } from "@/lib/actions/cases"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  isArchived: boolean
  deletedAt: Date | null
  assignedTo: {
    id: string
    name: string
    email: string
  } | null
  idAssist: number | null
  codeAssist: string | null
  clientName: string | null
  symptom: string | null
  symptomDetail: string | null
  isoCountry: string | null
  statusAssistLabel: string | null
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
  showArchived?: boolean
  onToggleArchived?: () => void
}

const statusOptions: CaseStatus[] = [
  "PENDING",
  "ASSIGNED", 
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]

type SortField = "patient" | "status" | "type" | "createdAt" | "provider"
type SortOrder = "asc" | "desc"

export function CasesTable({ cases, providers = [], isOwner = false, onRefresh, showArchived = false, onToggleArchived }: CasesTableProps) {
  const [filter, setFilter] = useState<CaseStatus | "ALL">("ALL")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [magicLinkDialog, setMagicLinkDialog] = useState<{ open: boolean; url: string }>({
    open: false,
    url: "",
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; caseId: string | null }>({
    open: false,
    caseId: null,
  })

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
    setPagination({ ...pagination, pageIndex: 0 })
  }

  const filteredAndSortedCases = useMemo(() => {
    let filtered = cases.filter((c) => {
      const matchesFilter = filter === "ALL" || c.status === filter
      const matchesSearch = 
        search === "" ||
        c.patientName?.toLowerCase().includes(search.toLowerCase()) ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.clientName?.toLowerCase().includes(search.toLowerCase()) ||
        c.idAssist?.toString().includes(search)
      return matchesFilter && matchesSearch
    })

    filtered.sort((a, b) => {
      let aVal: any, bVal: any
      
      switch (sortField) {
        case "patient":
          aVal = a.patientName || `${a.firstName} ${a.lastName}`.trim() || ""
          bVal = b.patientName || `${b.firstName} ${b.lastName}`.trim() || ""
          break
        case "status":
          aVal = a.status
          bVal = b.status
          break
        case "type":
          aVal = a.assistanceType || ""
          bVal = b.assistanceType || ""
          break
        case "createdAt":
          aVal = new Date(a.createdAt).getTime()
          bVal = new Date(b.createdAt).getTime()
          break
        case "provider":
          aVal = a.assignedTo?.name || ""
          bVal = b.assignedTo?.name || ""
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [cases, filter, search, sortField, sortOrder])

  const totalPages = Math.ceil(filteredAndSortedCases.length / pagination.pageSize)
  const startRow = pagination.pageIndex * pagination.pageSize + 1
  const endRow = Math.min(startRow + pagination.pageSize - 1, filteredAndSortedCases.length)
  
  const paginatedCases = filteredAndSortedCases.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize
  )

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
      onRefresh?.()
    } catch (error) {
      toast.error("Failed to generate magic link")
    } finally {
      setLoading(null)
    }
  }

  async function handleArchive(caseId: string) {
    setLoading(caseId)
    try {
      await archiveCase(caseId)
      toast.success("Case archived")
      onRefresh?.()
    } catch (error) {
      toast.error("Failed to archive case")
    } finally {
      setLoading(null)
    }
  }

  async function handleUnarchive(caseId: string) {
    setLoading(caseId)
    try {
      await unarchiveCase(caseId)
      toast.success("Case unarchived")
      onRefresh?.()
    } catch (error) {
      toast.error("Failed to unarchive case")
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.caseId) return
    setLoading(deleteDialog.caseId)
    try {
      await deleteCase(deleteDialog.caseId)
      toast.success("Case deleted")
      onRefresh?.()
    } catch (error) {
      toast.error("Failed to delete case")
    } finally {
      setLoading(null)
      setDeleteDialog({ open: false, caseId: null })
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
        {isOwner && onToggleArchived && (
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md">
            <ArchiveX className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Show Archived</span>
            <Switch
              checked={showArchived}
              onCheckedChange={onToggleArchived}
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 data-[state=open]:bg-accent"
                  onClick={() => toggleSort("patient")}
                >
                  Patient
                  {sortField === "patient" ? (
                    sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 data-[state=open]:bg-accent"
                  onClick={() => toggleSort("status")}
                >
                  Status
                  {sortField === "status" ? (
                    sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-foreground hidden md:table-cell">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 data-[state=open]:bg-accent"
                  onClick={() => toggleSort("type")}
                >
                  Type
                  {sortField === "type" ? (
                    sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-foreground hidden lg:table-cell">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 data-[state=open]:bg-accent"
                  onClick={() => toggleSort("createdAt")}
                >
                  Created
                  {sortField === "createdAt" ? (
                    sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              {isOwner && (
                <TableHead className="text-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 data-[state=open]:bg-accent"
                    onClick={() => toggleSort("provider")}
                  >
                    Provider
                    {sortField === "provider" ? (
                      sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
              )}
              <TableHead className="text-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isOwner ? 6 : 5} className="text-center py-8 text-muted-foreground">
                  No cases found
                </TableCell>
              </TableRow>
            ) : (
              paginatedCases.map((c) => (
                <TableRow key={c.id} className={`hover:bg-muted/30 ${c.isArchived ? "opacity-60 bg-muted/20" : ""}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-foreground">{getPatientName(c)}</p>
                        <p className="text-xs text-muted-foreground font-mono">{c.id.slice(0, 8)}...</p>
                      </div>
                      {c.isArchived && (
                        <Archive className="h-3 w-3 text-muted-foreground" />
                      )}
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
                    <div className="flex items-center justify-end gap-1">
                      {isOwner && (
                        <>
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
                          {c.isArchived ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUnarchive(c.id)}
                              disabled={loading === c.id}
                              title="Unarchive case"
                            >
                              <ArchiveRestore className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleArchive(c.id)}
                              disabled={loading === c.id}
                              title="Archive case"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialog({ open: true, caseId: c.id })}
                            disabled={loading === c.id}
                            title="Delete case"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
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

      {/* Pagination Controls */}
      {filteredAndSortedCases.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Showing {startRow} to {endRow} of {filteredAndSortedCases.length} results
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Rows per page</p>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) => {
                  setPagination({ pageIndex: 0, pageSize: Number(value) })
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Page {pagination.pageIndex + 1} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPagination({ ...pagination, pageIndex: 0 })}
                  disabled={pagination.pageIndex === 0}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPagination({ ...pagination, pageIndex: pagination.pageIndex - 1 })}
                  disabled={pagination.pageIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPagination({ ...pagination, pageIndex: pagination.pageIndex + 1 })}
                  disabled={pagination.pageIndex >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPagination({ ...pagination, pageIndex: totalPages - 1 })}
                  disabled={pagination.pageIndex >= totalPages - 1}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                toast.success("Link copied to clipboard")
              }}
              className="w-full"
            >
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Case</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this case? This action will soft-delete the case and it can be recovered from the database if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
