"use client"

import { useState, useMemo } from "react"
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
import { Status, StatusLabel } from "@/components/ui/status"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  User, 
  Mail, 
  Briefcase, 
  Pencil, 
  Trash2, 
  Loader2, 
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { updateProvider, deleteProvider } from "@/lib/actions/users"

interface Provider {
  id: string
  name: string
  email: string
  role?: string
  username: string | null
  createdAt: Date
  _count: {
    assignedCases: number
  }
}

interface ProvidersTableProps {
  providers: Provider[]
  onRefresh?: () => void
}

type SortField = "name" | "email" | "username" | "assignedCases" | "createdAt"
type SortOrder = "asc" | "desc"

export function ProvidersTable({ providers, onRefresh }: ProvidersTableProps) {
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [editDialog, setEditDialog] = useState<{ open: boolean; provider: Provider | null }>({
    open: false,
    provider: null,
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; providerId: string | null }>({
    open: false,
    providerId: null,
  })
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
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

  const filteredAndSortedProviders = useMemo(() => {
    let filtered = providers.filter((p) => {
      if (search === "") return true
      const searchLower = search.toLowerCase()
      return (
        p.name.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower) ||
        p.username?.toLowerCase().includes(searchLower) ||
        p.id.toLowerCase().includes(searchLower)
      )
    })

    filtered.sort((a, b) => {
      let aVal: any, bVal: any
      
      switch (sortField) {
        case "name":
          aVal = a.name
          bVal = b.name
          break
        case "email":
          aVal = a.email
          bVal = b.email
          break
        case "username":
          aVal = a.username || ""
          bVal = b.username || ""
          break
        case "assignedCases":
          aVal = a._count.assignedCases
          bVal = b._count.assignedCases
          break
        case "createdAt":
          aVal = new Date(a.createdAt).getTime()
          bVal = new Date(b.createdAt).getTime()
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [providers, search, sortField, sortOrder])

  const totalPages = Math.ceil(filteredAndSortedProviders.length / pagination.pageSize)
  const startRow = pagination.pageIndex * pagination.pageSize + 1
  const endRow = Math.min(startRow + pagination.pageSize - 1, filteredAndSortedProviders.length)
  
  const paginatedProviders = filteredAndSortedProviders.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize
  )

  function openEditDialog(provider: Provider) {
    setFormData({
      name: provider.name,
      email: provider.email,
      username: provider.username || "",
      password: "",
    })
    setEditDialog({ open: true, provider })
  }

  function closeEditDialog() {
    setEditDialog({ open: false, provider: null })
    setFormData({ name: "", email: "", username: "", password: "" })
  }

  async function handleUpdate() {
    if (!editDialog.provider) return
    
    setLoading(true)
    try {
      const updateData: any = {}
      if (formData.name !== editDialog.provider.name) updateData.name = formData.name
      if (formData.email !== editDialog.provider.email) updateData.email = formData.email
      if (formData.username !== editDialog.provider.username) updateData.username = formData.username
      if (formData.password) updateData.password = formData.password

      await updateProvider(editDialog.provider.id, updateData)
      toast.success("Provider updated successfully")
      closeEditDialog()
      onRefresh?.()
    } catch (error: any) {
      toast.error(error.message || "Failed to update provider")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog.providerId) return
    
    setLoading(true)
    try {
      await deleteProvider(deleteDialog.providerId)
      toast.success("Provider deleted successfully")
      setDeleteDialog({ open: false, providerId: null })
      onRefresh?.()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete provider")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search providers by name, email, or username..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPagination({ ...pagination, pageIndex: 0 })
          }}
          className="pl-9 bg-background"
        />
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 data-[state=open]:bg-accent"
                  onClick={() => toggleSort("name")}
                >
                  Provider
                  {sortField === "name" ? (
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
                  onClick={() => toggleSort("username")}
                >
                  Username
                  {sortField === "username" ? (
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
                  onClick={() => toggleSort("assignedCases")}
                >
                  Assigned Cases
                  {sortField === "assignedCases" ? (
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
                  Joined
                  {sortField === "createdAt" ? (
                    sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProviders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {search ? "No providers found matching your search." : "No providers registered yet. Create your first provider to get started."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedProviders.map((provider) => (
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
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(provider)}
                      title="Edit provider"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDialog({ open: true, providerId: provider.id })}
                      title="Delete provider"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
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
      {filteredAndSortedProviders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Showing {startRow} to {endRow} of {filteredAndSortedProviders.length} results
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

      <Dialog open={editDialog.open} onOpenChange={(open) => !loading && (open ? null : closeEditDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Provider</DialogTitle>
            <DialogDescription>
              Update provider information. Leave password blank to keep current password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New Password (optional)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave blank to keep current"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !loading && setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Provider</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this provider? This action cannot be undone. Providers with assigned cases cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
