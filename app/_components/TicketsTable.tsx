"use client"

import { useMemo, useState } from "react"
import useSWR, { mutate } from "swr"
import { MoreHorizontal, Download, Loader2, Calendar as CalendarIcon } from "lucide-react"
import { 
  startOfWeek, 
  startOfMonth, 
  startOfQuarter, 
  startOfYear, 
  isWithinInterval, 
  endOfDay,
  startOfDay,
  format
} from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar, CalendarProps } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

import {
  getTickets,
  ticketsToCsv,
  updateTicketStatus,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from "@/app/_lib/data-service"
import TicketForm from "./TicketForm"
import TicketModalButton from "./TicketModalButton"

type DateRange = { from: Date | undefined; to?: Date | undefined }
type CalendarOnSelect = (range: DateRange | undefined) => void

const statusOptions: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"]
const priorityOptions: TicketPriority[] = ["Low", "Medium", "High", "Urgent"]

type ExportFormat = "csv" | "xlsx" | "pdf"
type SortOption = "created_desc" | "created_asc"
type TimeRange = "All" | "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "Custom"

const descriptionPreview = (description: string | null) => {
  const v = (description ?? "").trim().replaceAll(/\s+/g, " ")
  if (!v) return "—"
  return v.length > 90 ? `${v.slice(0, 90)}…` : v
}

const isTicketStatus = (value: string): value is TicketStatus => {
  return (statusOptions as readonly string[]).includes(value)
}

const isTicketPriority = (value: string): value is TicketPriority => {
  return (priorityOptions as readonly string[]).includes(value)
}

const statusBadgeClass = (status: TicketStatus) => {
  if (status === "Open") return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
  if (status === "In Progress") return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200"
  if (status === "Resolved") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
  return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
}

const priorityBadgeClass = (priority: TicketPriority) => {
  if (priority === "Urgent") return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200"
  if (priority === "High") return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-200"
  if (priority === "Medium") return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200"
  return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
}

export default function TicketsTable() {
  const { toast } = useToast()
  const { data, error, isLoading } = useSWR<Ticket[]>("tickets", getTickets)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "All">("All")
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "All">("All")
  const [timeRange, setTimeRange] = useState<TimeRange>("All")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })
  const [sortBy, setSortBy] = useState<SortOption>("created_desc")
  const [createOpen, setCreateOpen] = useState(false)
  const [exporting, setExporting] = useState<ExportFormat | null>(null)

  const filtered = useMemo(() => {
    const all = data ?? []
    const q = query.trim().toLowerCase()
    const now = new Date()

    return all.filter((t) => {
      if (statusFilter !== "All" && t.status !== statusFilter) return false
      if (priorityFilter !== "All" && t.priority !== priorityFilter) return false

      // Time range filter
      if (timeRange !== "All") {
        const ticketDate = new Date(t.created_at)
        let start: Date | undefined
        let end: Date = endOfDay(now)

        if (timeRange === "Weekly") {
          start = startOfWeek(now, { weekStartsOn: 1 }) // Monday
          // Monday - Friday check
          const day = ticketDate.getDay()
          if (day === 0 || day === 6) return false // Skip Sat/Sun
        } else if (timeRange === "Monthly") {
          start = startOfMonth(now)
        } else if (timeRange === "Quarterly") {
          start = startOfQuarter(now)
        } else if (timeRange === "Yearly") {
          start = startOfYear(now)
        } else if (timeRange === "Custom" && dateRange.from && dateRange.to) {
          start = startOfDay(dateRange.from)
          end = endOfDay(dateRange.to)
        }

        if (start && !isWithinInterval(ticketDate, { start, end })) return false
      }

      if (!q) return true

      const haystack = [
        t.title,
        t.description ?? "",
        t.category,
        t.status,
        t.priority,
        t.requester_name ?? "",
        t.requester_email ?? "",
      ]
        .join(" ")
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [data, priorityFilter, query, statusFilter, timeRange, dateRange])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0
      const db = b.created_at ? new Date(b.created_at).getTime() : 0
      return sortBy === "created_desc" ? db - da : da - db
    })
    return copy
  }, [filtered, sortBy])

  const onUpdateStatus = async (id: number, next: TicketStatus) => {
    try {
      await updateTicketStatus(id, next)
      await mutate("tickets")
      toast({
        title: "Updated",
        description: `Ticket marked as ${next}.`,
        variant: "success",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const onCopyDetails = async (ticket: Ticket) => {
    const lines = [
      `Title: ${ticket.title}`,
      `Status: ${ticket.status}`,
      `Priority: ${ticket.priority}`,
      `Category: ${ticket.category}`,
      `Date: ${ticket.created_at ? new Date(ticket.created_at).toLocaleString() : "—"}`,
      `Requester: ${[ticket.requester_name, ticket.requester_email].filter(Boolean).join(" / ") || "—"}`,
      "",
      (ticket.description ?? "").trim(),
    ].filter(Boolean)

    try {
      await navigator.clipboard.writeText(lines.join("\n"))
      toast({ title: "Copied", description: "Ticket details copied to clipboard.", variant: "success" })
    } catch {
      toast({ title: "Error", description: "Failed to copy ticket details.", variant: "destructive" })
    }
  }

  const onExport = async () => {
    try {
      setExporting("csv")
      const tickets = sorted
      const csv = ticketsToCsv(tickets)
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `itx-helpdesk-tickets-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(null)
    }
  }

  const onExportExcel = async () => {
    try {
      setExporting("xlsx")
      const tickets = sorted
      const rows = tickets.map((t, idx) => ({
        no: idx + 1,
        date: t.created_at ? new Date(t.created_at) : "",
        title: t.title,
        description: t.description ?? "",
        status: t.status,
        priority: t.priority,
        category: t.category,
        requester_name: t.requester_name ?? "",
        requester_email: t.requester_email ?? "",
      }))

      const xlsxModule = await import("xlsx")
      const wb = xlsxModule.utils.book_new()
      const ws = xlsxModule.utils.aoa_to_sheet([
        ["ITX Helpdesk"],
        ["ITX Helpdesk - Tickets Export"],
        ["Generated", new Date().toLocaleString()],
      ])
      xlsxModule.utils.sheet_add_json(ws, rows, { origin: "A4" })
      ws["!cols"] = [
        { wch: 6 }, // no
        { wch: 22 }, // date
        { wch: 36 }, // title
        { wch: 60 }, // description
        { wch: 14 }, // status
        { wch: 14 }, // priority
        { wch: 16 }, // category
        { wch: 22 }, // requester_name
        { wch: 26 }, // requester_email
      ]
      ws["!rows"] = [{ hpt: 30 }, { hpt: 18 }, { hpt: 18 }]
      xlsxModule.utils.book_append_sheet(wb, ws, "Tickets")
      const array = xlsxModule.write(wb, { bookType: "xlsx", type: "array" })

      const blob = new Blob([array], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `itx-helpdesk-tickets-${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(null)
    }
  }

  const onExportPdf = async () => {
    type JsPdfInstance = {
      save: (filename: string) => void
      setFontSize: (size: number) => void
      text: (text: string, x: number, y: number) => void
      addImage?: (imageData: string, format: "PNG" | "JPEG", x: number, y: number, w: number, h: number) => void
    }
    type JsPdfCtor = new (options?: Record<string, unknown>) => JsPdfInstance
    type AutoTable = (
      doc: JsPdfInstance,
      options: {
        head: string[][]
        body: (string | number)[][]
        startY?: number
        margin?: { left: number; right: number }
        styles?: Record<string, unknown>
        headStyles?: Record<string, unknown>
        columnStyles?: Record<number, Record<string, unknown>>
      }
    ) => void

    try {
      setExporting("pdf")
      const tickets = sorted

      const jspdfModule = (await import("jspdf")) as unknown as { jsPDF: JsPdfCtor }
      const autotableModule = (await import("jspdf-autotable")) as unknown as Record<string, unknown>
      const autoTable = (autotableModule.autoTable ?? autotableModule.default) as AutoTable | undefined
      if (!autoTable) throw new Error("PDF export is unavailable")

      const doc = new jspdfModule.jsPDF({ orientation: "landscape" })
      const svgText = await fetch("/ITXDesk.svg").then((r) => r.text())
      const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`
      const pngDataUrl = await new Promise<string>((resolve) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const scale = 2
          canvas.width = Math.max(1, Math.floor(img.width * scale))
          canvas.height = Math.max(1, Math.floor(img.height * scale))
          const ctx = canvas.getContext("2d")
          if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL("image/png"))
        }
        img.onerror = () => resolve("")
        img.src = svgDataUrl
      })

      if (doc.addImage && pngDataUrl) {
        doc.addImage(pngDataUrl, "PNG", 14, 8, 26, 26)
      }

      doc.setFontSize(14)
      doc.text("ITX Helpdesk", 14, 40)
      doc.setFontSize(11)
      doc.text("Tickets Export", 14, 47)
      doc.setFontSize(9)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 53)

      const head = [["No.", "Date", "Title", "Description", "Status", "Priority", "Category", "Requester"]]
      const body = tickets.map((t, idx) => [
        idx + 1,
        t.created_at ? new Date(t.created_at).toLocaleString() : "—",
        t.title,
        (t.description ?? "").trim() || "—",
        t.status,
        t.priority,
        t.category,
        [t.requester_name, t.requester_email].filter(Boolean).join(" / ") || "—",
      ])

      autoTable(doc, {
        head,
        body,
        startY: 58,
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8, cellPadding: 2, valign: "middle", overflow: "linebreak", cellWidth: "wrap" },
        headStyles: { fillColor: [0, 116, 222] },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 30 },
          2: { cellWidth: 40 },
          3: { cellWidth: 70 },
          4: { cellWidth: 18 },
          5: { cellWidth: 18 },
          6: { cellWidth: 22 },
          7: { cellWidth: 55 },
        },
      })

      doc.save(`itx-helpdesk-tickets-${new Date().toISOString().slice(0, 10)}.pdf`)
    } finally {
      setExporting(null)
    }
  }

  if (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return (
      <div className="rounded-xl border bg-white/80 p-6 backdrop-blur dark:bg-zinc-950/60">
        <p className="text-sm text-red-600">Failed to load tickets.</p>
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-white/80 p-4 backdrop-blur dark:border-zinc-800 dark:bg-[#0f1620] md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <Input
            placeholder="Search tickets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full lg:max-w-[280px] bg-white/70 dark:bg-[#0b0f14] dark:text-zinc-50 dark:border-zinc-800"
          />
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                if (v === "All" || isTicketStatus(v)) setStatusFilter(v)
              }}
            >
              <SelectTrigger className="w-full sm:w-[130px] bg-white/70 dark:bg-[#0b0f14] dark:border-zinc-800">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter}
              onValueChange={(v) => {
                if (v === "All" || isTicketPriority(v)) setPriorityFilter(v)
              }}
            >
              <SelectTrigger className="w-full sm:w-[130px] bg-white/70 dark:bg-[#0b0f14] dark:border-zinc-800">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Priority</SelectItem>
                {priorityOptions.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-full sm:w-[140px] bg-white/70 dark:bg-[#0b0f14] dark:border-zinc-800">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Time</SelectItem>
                <SelectItem value="Weekly">Weekly (Mon-Fri)</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Yearly">Yearly</SelectItem>
                <SelectItem value="Custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {timeRange === "Custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 justify-start text-left font-normal bg-white/70 dark:bg-[#0b0f14] dark:border-zinc-800 sm:w-[220px]",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd")
                      )
                    ) : (
                      <span>Pick a range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange((range as DateRange) || { from: undefined, to: undefined })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}

            <Select
              value={sortBy}
              onValueChange={(v) => {
                if (v === "created_desc" || v === "created_asc") setSortBy(v)
              }}
            >
              <SelectTrigger className="w-full sm:w-[140px] bg-white/70 dark:bg-[#0b0f14] dark:border-zinc-800">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_desc">Newest first</SelectItem>
                <SelectItem value="created_asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={!!exporting || isLoading} className="dark:bg-[#0b0f14] dark:border-zinc-800">
                {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExport} disabled={!!exporting || isLoading}>
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportExcel} disabled={!!exporting || isLoading}>
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportPdf} disabled={!!exporting || isLoading}>
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <TicketModalButton open={createOpen} onOpenChange={setCreateOpen} label="New Ticket" labelHeader="Create Ticket">
            <TicketForm onClose={() => setCreateOpen(false)} />
          </TicketModalButton>
        </div>
      </div>

      <div className="rounded-xl border bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-[#0f1620] overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-50/70 dark:bg-[#0b0f14]">
            <TableRow>
              <TableHead className="w-[70px]">No.</TableHead>
              <TableHead className="w-[190px]">Date</TableHead>
              <TableHead className="min-w-[200px]">Title</TableHead>
              <TableHead className="min-w-[240px]">Description</TableHead>
              <TableHead className="w-[140px]">Status</TableHead>
              <TableHead className="w-[140px]">Priority</TableHead>
              <TableHead className="w-[160px]">Category</TableHead>
              <TableHead className="w-[220px]">Requester</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading tickets...
                  </span>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                  No tickets found.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((t, idx) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs text-zinc-600 dark:text-zinc-400">{idx + 1}</TableCell>
                  <TableCell className="text-sm text-zinc-700 dark:text-zinc-300">
                    {t.created_at ? new Date(t.created_at).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell className="text-sm text-zinc-700 dark:text-zinc-300">
                    <span title={t.description ?? ""}>{descriptionPreview(t.description)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusBadgeClass(t.status)}>{t.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityBadgeClass(t.priority)}>{t.priority}</Badge>
                  </TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell className="text-sm text-zinc-700 dark:text-zinc-300">
                    {(t.requester_name || t.requester_email) ? (
                      <div className="space-y-0.5">
                        <div className="font-medium">{t.requester_name ?? "—"}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{t.requester_email ?? ""}</div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => void onCopyDetails(t)}>
                          Copy details
                        </DropdownMenuItem>
                        {statusOptions.map((s) => (
                          <DropdownMenuItem
                            key={s}
                            onClick={() => onUpdateStatus(t.id, s)}
                            disabled={t.status === s}
                          >
                            Mark as {s}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
