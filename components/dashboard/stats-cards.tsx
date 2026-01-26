import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Clock, 
  UserCheck, 
  Activity, 
  CheckCircle2, 
  XCircle,
  FileStack
} from "lucide-react"
import type { DashboardStats } from "@/lib/types"

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Cases",
      value: stats.total,
      icon: FileStack,
      description: "All cases in system",
      className: "text-foreground",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      description: "Awaiting assignment",
      className: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Assigned",
      value: stats.assigned,
      icon: UserCheck,
      description: "Assigned to providers",
      className: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: Activity,
      description: "Currently being handled",
      className: "text-cyan-600 dark:text-cyan-400",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      description: "Successfully resolved",
      className: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      description: "Cancelled cases",
      className: "text-red-600 dark:text-red-400",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.className}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.className}`}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
