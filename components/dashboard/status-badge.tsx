import type { CaseStatus } from "@/lib/types"
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/status"

interface StatusBadgeProps {
  status: CaseStatus
  className?: string
}

const statusConfig: Record<CaseStatus, { label: string; variant: "default" | "success" | "error" | "warning" | "info" }> = {
  PENDING: {
    label: "Pending",
    variant: "warning",
  },
  ASSIGNED: {
    label: "Assigned",
    variant: "info",
  },
  IN_PROGRESS: {
    label: "In Progress",
    variant: "info",
  },
  COMPLETED: {
    label: "Completed",
    variant: "success",
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "error",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Status variant={config.variant} className={className}>
      <StatusIndicator />
      <StatusLabel>{config.label}</StatusLabel>
    </Status>
  )
}
