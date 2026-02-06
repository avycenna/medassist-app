"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Pencil, Check, X, Loader2 } from "lucide-react"
import { updateCaseField } from "@/lib/actions/cases"
import { toast } from "sonner"

interface EditableFieldProps {
  caseId: string
  field: string
  value: string | number | Date | null
  label: string
  type?: "text" | "email" | "tel" | "date" | "textarea" | "number"
  placeholder?: string
  className?: string
  onUpdate?: () => void
  disabled?: boolean
}

export function EditableField({
  caseId,
  field,
  value,
  label,
  type = "text",
  placeholder,
  className,
  onUpdate,
  disabled = false,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(
    value instanceof Date 
      ? value.toISOString().split('T')[0]
      : value?.toString() || ""
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setEditValue(
      value instanceof Date 
        ? value.toISOString().split('T')[0]
        : value?.toString() || ""
    )
  }, [value])

  async function handleSave() {
    setLoading(true)
    try {
      await updateCaseField(caseId, field, editValue || null)
      toast.success(`${label} updated successfully`)
      setIsEditing(false)
      onUpdate?.()
    } catch (error) {
      toast.error(`Failed to update ${label}`)
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    setEditValue(
      value instanceof Date 
        ? value.toISOString().split('T')[0]
        : value?.toString() || ""
    )
    setIsEditing(false)
  }

  if (disabled) {
    return (
      <div className={className}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
        <p className="text-sm text-foreground">
          {value instanceof Date 
            ? value.toLocaleDateString()
            : value?.toString() || "—"}
        </p>
      </div>
    )
  }

  if (!isEditing) {
    return (
      <div className={`group relative ${className}`}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <p className={`text-sm flex-1 ${!value ? "text-muted-foreground italic" : "text-foreground"}`}>
            {value instanceof Date 
              ? value.toLocaleDateString()
              : value?.toString() || "Click to add"}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {type === "textarea" ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 min-h-[80px]"
            autoFocus
          />
        ) : (
          <Input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
            autoFocus
          />
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCancel}
            disabled={loading}
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>
    </div>
  )
}
