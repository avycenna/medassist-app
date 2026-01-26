"use client"

import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Status, StatusLabel } from "@/components/ui/status"
import { User, Mail, Briefcase } from "lucide-react"

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

interface ProvidersTableProps {
  providers: Provider[]
}

export function ProvidersTable({ providers }: ProvidersTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-foreground">Provider</TableHead>
            <TableHead className="text-foreground">Username</TableHead>
            <TableHead className="text-foreground hidden md:table-cell">Assigned Cases</TableHead>
            <TableHead className="text-foreground hidden lg:table-cell">Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                No providers registered yet. Create your first provider to get started.
              </TableCell>
            </TableRow>
          ) : (
            providers.map((provider) => (
              <TableRow key={provider.id} className="hover:bg-muted/30">
                <TableCell>
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
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {provider.username || "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <Status variant="default">
                      <StatusLabel>
                        {provider._count.assignedCases} case{provider._count.assignedCases !== 1 ? "s" : ""}
                      </StatusLabel>
                    </Status>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {format(new Date(provider.createdAt), "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
