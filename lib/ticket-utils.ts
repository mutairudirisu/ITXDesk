import type { TicketStatus, TicketPriority } from "@/app/_lib/data-service"

export const STATUS_OPTIONS: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"]
export const PRIORITY_OPTIONS: TicketPriority[] = ["Low", "Medium", "High", "Urgent"]

export const getStatusBadgeClass = (status: TicketStatus) => {
  if (status === "Open") return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
  if (status === "In Progress") return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200"
  if (status === "Resolved") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
  return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
}

export const getPriorityBadgeClass = (priority: TicketPriority) => {
  if (priority === "Urgent") return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200"
  if (priority === "High") return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-200"
  if (priority === "Medium") return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200"
  return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
}

export const isTicketStatus = (value: string): value is TicketStatus => {
  return (STATUS_OPTIONS as readonly string[]).includes(value)
}

export const isTicketPriority = (value: string): value is TicketPriority => {
  return (PRIORITY_OPTIONS as readonly string[]).includes(value)
}

export const getDescriptionPreview = (description: string | null) => {
  const v = (description ?? "").trim().replaceAll(/\s+/g, " ")
  if (!v) return "—"
  return v.length > 90 ? `${v.slice(0, 90)}…` : v
}
