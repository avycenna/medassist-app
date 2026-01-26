"use client"

import { useState } from "react"
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
import { Status, StatusLabel } from "@/components/ui/status"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Briefcase, Pencil, Trash2, Loader2 } from "lucide-react"
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

export function ProvidersTable({ providers, onRefresh }: ProvidersTableProps) {
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
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-foreground">Provider</TableHead>
            <TableHead className="text-foreground">Username</TableHead>
            <TableHead className="text-foreground hidden md:table-cell">Assigned Cases</TableHead>
            <TableHead className="text-foreground hidden lg:table-cell">Joined</TableHead>
            <TableHead className="text-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
