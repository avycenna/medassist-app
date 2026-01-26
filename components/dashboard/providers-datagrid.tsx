"use client"

import { useMemo } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { User, Mail, Briefcase } from "lucide-react"
import { DataGrid } from "@/components/data-grid/data-grid"
import { useDataGrid } from "@/hooks/use-data-grid"
import { Status, StatusLabel } from "@/components/ui/status"

interface Provider {
  id: string
  name: string
  email: string
  username: string | null
  createdAt: Date
  _count: {
    assignedCases: number
  }
}

interface ProvidersDataGridProps {
  providers: Provider[]
}

export function ProvidersDataGrid({ providers }: ProvidersDataGridProps) {
  const columns = useMemo<ColumnDef<Provider>[]>(() => [
    {
      id: "provider",
      accessorKey: "name",
      header: "Provider",
      size: 250,
      cell: ({ row }) => {
        const provider = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{provider.name}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                {provider.email}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      id: "username",
      accessorKey: "username",
      header: "Username",
      size: 150,
      cell: ({ row }) => {
        const value = row.original.username
        return (
          <span className="text-muted-foreground">{value || "—"}</span>
        )
      },
    },
    {
      id: "assignedCases",
      accessorFn: (row) => row._count.assignedCases,
      header: "Assigned Cases",
      size: 150,
      cell: ({ row }) => {
        const count = row.original._count.assignedCases
        return (
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <Status variant="default">
              <StatusLabel>
                {count} case{count !== 1 ? "s" : ""}
              </StatusLabel>
            </Status>
          </div>
        )
      },
    },
    {
      id: "createdAt",
      accessorFn: (row) => row.createdAt ? new Date(row.createdAt).getTime() : 0,
      header: "Joined",
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
  ], [])

  const dataGridProps = useDataGrid({
    data: providers,
    columns,
    enableSearch: true,
    enableColumnSelection: false,
    readOnly: true,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
    },
  })

  return <DataGrid {...dataGridProps} height={600} stretchColumns />
}
