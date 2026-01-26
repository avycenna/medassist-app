"use client"

import { useMemo, useCallback, useState } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"
import { Eye, Link as LinkIcon, Loader2 } from "lucide-react"
import { DataGrid } from "@/components/data-grid/data-grid"
import { useDataGrid } from "@/hooks/use-data-grid"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import { assignCaseToProvider, updateCaseStatus, generateMagicLinkForCase } from "@/lib/actions/cases"
import type { CaseStatus } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

interface CasesDataGridProps {
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

export function CasesDataGrid({ cases, providers = [], isOwner = false, onRefresh }: CasesDataGridProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [magicLinkDialog, setMagicLinkDialog] = useState<{ open: boolean; url: string }>({
    open: false,
    url: "",
  })

  const getPatientName = useCallback((c: CaseWithProvider) => {
    if (c.patientName) return c.patientName
    if (c.firstName || c.lastName) return `${c.firstName || ""} ${c.lastName || ""}`.trim()
    return "Unknown Patient"
  }, [])

  const handleAssignProvider = useCallback(async (caseId: string, providerId: string) => {
    setLoading(caseId)
    try {
      await assignCaseToProvider(caseId, providerId === "unassign" ? null : providerId)
      onRefresh?.()
    } finally {
      setLoading(null)
    }
  }, [onRefresh])

  const handleStatusChange = useCallback(async (caseId: string, status: CaseStatus) => {
    setLoading(caseId)
    try {
      await updateCaseStatus(caseId, status)
      onRefresh?.()
    } finally {
      setLoading(null)
    }
  }, [onRefresh])

  const handleGenerateMagicLink = useCallback(async (caseId: string) => {
    setLoading(caseId)
    try {
      const result = await generateMagicLinkForCase(caseId)
      setMagicLinkDialog({ open: true, url: result.url })
    } finally {
      setLoading(null)
    }
  }, [])

  const columns = useMemo<ColumnDef<CaseWithProvider>[]>(() => {
    const cols: ColumnDef<CaseWithProvider>[] = [
      {
        id: "patient",
        accessorFn: (row) => getPatientName(row),
        header: "Patient",
        size: 200,
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">{getPatientName(row.original)}</p>
            <p className="text-xs text-muted-foreground font-mono">{row.original.id.slice(0, 8)}...</p>
          </div>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        size: 150,
        cell: ({ row }) => {
          const c = row.original
          return isOwner ? (
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
          )
        },
      },
      {
        id: "assistanceType",
        accessorKey: "assistanceType",
        header: "Type",
        size: 150,
        cell: ({ row }) => {
          const value = row.original.assistanceType
          return (
            <span className="text-muted-foreground">
              {value ? value.replace("_", " ") : "—"}
            </span>
          )
        },
      },
      {
        id: "createdAt",
        accessorFn: (row) => row.createdAt ? new Date(row.createdAt).getTime() : 0,
        header: "Created",
        size: 120,
        cell: ({ row }) => {
          const date = row.original.createdAt
          return (
            <span className="text-muted-foreground">
              {date ? format(new Date(date), "MMM d, yyyy") : "—"}
            </span>
          )
        },
      },
    ]

    if (isOwner) {
      cols.push({
        id: "assignedTo",
        accessorFn: (row) => row.assignedTo?.name || "Unassigned",
        header: "Provider",
        size: 180,
        cell: ({ row }) => {
          const c = row.original
          return (
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
          )
        },
      })
    }

    cols.push({
      id: "actions",
      header: "Actions",
      size: 120,
      cell: ({ row }) => {
        const c = row.original
        return (
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
        )
      },
    })

    return cols
  }, [isOwner, providers, loading, getPatientName, handleStatusChange, handleAssignProvider, handleGenerateMagicLink])

  const dataGridProps = useDataGrid({
    data: cases,
    columns,
    enableSearch: true,
    enableColumnSelection: false,
    readOnly: true,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
    },
  })

  return (
    <>
      <DataGrid {...dataGridProps} height={600} stretchColumns />
      
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
    </>
  )
}
