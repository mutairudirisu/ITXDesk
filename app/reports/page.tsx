"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar, CalendarProps } from "@/components/ui/calendar"
import { format, startOfMonth, endOfMonth, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import { cn } from "@/lib/utils"
import { getTickets, type Ticket } from "@/app/_lib/data-service"
import { useToast } from "@/hooks/use-toast"

type ViewType = "html" | "pdf" | "excel"
type DateRange = { from: Date | undefined; to?: Date | undefined }
type CalendarOnSelect = (range: DateRange | undefined) => void

const months = [
  { label: "January", value: "0" },
  { label: "February", value: "1" },
  { label: "March", value: "2" },
  { label: "April", value: "3" },
  { label: "May", value: "4" },
  { label: "June", value: "5" },
  { label: "July", value: "6" },
  { label: "August", value: "7" },
  { label: "September", value: "8" },
  { label: "October", value: "9" },
  { label: "November", value: "10" },
  { label: "December", value: "11" },
]

const years = ["2024", "2025", "2026"]

export default function ReportsPage() {
  const { toast } = useToast()
  const [selectionMode, setSelectionMode] = useState("month-year")
  const [month, setMonth] = useState(new Date().getMonth().toString())
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [viewType, setViewType] = useState<ViewType>("html")
  const [isGenerating, setIsGenerating] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true)
      const allTickets = await getTickets()
      
      let filtered: Ticket[] = []

      if (selectionMode === "month-year") {
        const targetDate = new Date(parseInt(year), parseInt(month), 1)
        const start = startOfMonth(targetDate)
        const end = endOfMonth(targetDate)
        
        filtered = allTickets.filter((t) => {
          const ticketDate = new Date(t.created_at)
          return isWithinInterval(ticketDate, { start, end })
        })
      } else {
        if (!dateRange.from || !dateRange.to) {
          toast({
            title: "Error",
            description: "Please select a valid date range.",
            variant: "destructive"
          })
          return
        }
        const start = startOfDay(dateRange.from)
        const end = endOfDay(dateRange.to)

        filtered = allTickets.filter((t) => {
          const ticketDate = new Date(t.created_at)
          return isWithinInterval(ticketDate, { start, end })
        })
      }

      if (filtered.length === 0) {
        toast({
          title: "No data",
          description: "No tickets found for the selected period.",
          variant: "destructive"
        })
        return
      }

      if (viewType === "html") {
        // For HTML, we'll just show a success message and log the count for now
        // In a real app, this might open a preview modal or new tab
        toast({
          title: "Report Ready",
          description: `Found ${filtered.length} tickets. Displaying as HTML is not yet implemented, please use PDF or Excel.`,
          variant: "success"
        })
      } else if (viewType === "excel") {
        const rows = filtered.map((t, idx) => ({
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
          ["ITX Helpdesk - Performance Report"],
          ["Generated", new Date().toLocaleString()],
          ["Period", selectionMode === "month-year" ? `${months[parseInt(month)].label} ${year}` : `${format(dateRange.from!, "PP")} - ${format(dateRange.to!, "PP")}`],
        ])
        xlsxModule.utils.sheet_add_json(ws, rows, { origin: "A5" })
        ws["!cols"] = [
          { wch: 6 }, { wch: 22 }, { wch: 36 }, { wch: 60 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 22 }, { wch: 26 },
        ]
        xlsxModule.utils.book_append_sheet(wb, ws, "Report")
        const array = xlsxModule.write(wb, { bookType: "xlsx", type: "array" })
        const blob = new Blob([array], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `itx-report-${new Date().toISOString().slice(0, 10)}.xlsx`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        
        toast({ title: "Success", description: "Excel report generated.", variant: "success" })
      } else if (viewType === "pdf") {
        const jspdfModule = (await import("jspdf")) as unknown as { jsPDF: any }
        const autotableModule = (await import("jspdf-autotable")) as unknown as { autoTable?: any; default?: any }
        const autoTable = (autotableModule.autoTable ?? autotableModule.default)
        
        const doc = new jspdfModule.jsPDF({ orientation: "landscape" })

        // Add Logo
        try {
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

          if (pngDataUrl) {
            doc.addImage(pngDataUrl, "PNG", 14, 10, 30, 30)
          }
        } catch (err) {
          console.error("Failed to add logo to PDF:", err)
        }
        
        doc.setFontSize(16)
        doc.text("ITX Helpdesk - Performance Report", 14, 45)
        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 53)
        doc.text(`Period: ${selectionMode === "month-year" ? `${months[parseInt(month)].label} ${year}` : `${format(dateRange.from!, "PP")} - ${format(dateRange.to!, "PP")}`}`, 14, 59)
        doc.setTextColor(0)

        const head = [["No.", "Date", "Title", "Description", "Status", "Priority", "Category", "Requester"]]
        const body = filtered.map((t, idx) => [
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
          startY: 65,
          margin: { left: 14, right: 14 },
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [0, 116, 222] },
        })

        doc.save(`itx-report-${new Date().toISOString().slice(0, 10)}.pdf`)
        toast({ title: "Success", description: "PDF report generated.", variant: "success" })
      }
    } catch (error) {
      console.error("Report generation error:", error)
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800">
        <CardContent className="pt-6 space-y-8">
          <div className="flex justify-center">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setSelectionMode("month-year")}
                className={`px-4 py-2 text-xs font-medium border border-zinc-200 rounded-l-md hover:bg-zinc-100 focus:z-10 focus:ring-2 focus:ring-[#0074de] transition-colors ${
                  selectionMode === "month-year" ? "bg-zinc-400 text-white border-zinc-400" : "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700"
                }`}
              >
                Month & Year
              </button>
              <button
                type="button"
                onClick={() => setSelectionMode("date-range")}
                className={`px-4 py-2 text-xs font-medium border border-zinc-200 rounded-r-md hover:bg-zinc-100 focus:z-10 focus:ring-2 focus:ring-[#0074de] transition-colors ${
                  selectionMode === "date-range" ? "bg-[#0074de] text-white border-[#0074de]" : "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700"
                }`}
              >
                Select Date Range
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selectionMode === "month-year" ? (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-center block">Month</Label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="w-full bg-white/70 dark:bg-[#0b0f14] dark:border-zinc-800">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-center block">Year</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="w-full bg-white/70 dark:bg-[#0b0f14] dark:border-zinc-800">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-medium text-center block">Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/70 dark:bg-[#0b0f14] dark:border-zinc-800",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
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
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-medium text-center block">View Type</Label>
              <Select value={viewType} onValueChange={(v: ViewType) => setViewType(v)}>
                <SelectTrigger className="w-full bg-white/70 dark:bg-[#0b0f14] dark:border-zinc-800">
                  <SelectValue placeholder="View Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">Display As HTML</SelectItem>
                  <SelectItem value="pdf">Download PDF</SelectItem>
                  <SelectItem value="excel">Download Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="bg-[#0074de] hover:bg-[#0074de]/90 text-white px-8 py-2 rounded-sm text-xs font-bold uppercase"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

