"use client"

import useSWR from "swr"
import { BarChart3, CircleDashed, CircleDot, CheckCircle2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import TopBar from "../_components/TopBar"

import { getTickets, type Ticket } from "@/app/_lib/data-service"

const statusVariant = (status: Ticket["status"]) => {
  if (status === "Open") return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
  if (status === "In Progress") return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200"
  if (status === "Resolved") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
  return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
}

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR<Ticket[]>("tickets", getTickets)
  const tickets = data ?? []

  const total = tickets.length
  const open = tickets.filter((t) => t.status === "Open").length
  const inProgress = tickets.filter((t) => t.status === "In Progress").length
  const resolved = tickets.filter((t) => t.status === "Resolved").length

  const recent = tickets.slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3ff] via-white to-white dark:bg-[#0b0f14] dark:bg-none">
      <TopBar title="Dashboard" subtitle="Overview of tickets and activity." />

      <div className="p-2 md:p-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-sky-50 to-white dark:from-zinc-900 dark:to-zinc-950">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Total Tickets</CardTitle>
                <div className="h-9 w-9 rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{isLoading ? "—" : total}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-zinc-900 dark:to-zinc-950">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Open</CardTitle>
                <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200 flex items-center justify-center">
                  <CircleDashed className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{isLoading ? "—" : open}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-zinc-900 dark:to-zinc-950">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>In Progress</CardTitle>
                <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200 flex items-center justify-center">
                  <CircleDot className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{isLoading ? "—" : inProgress}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-zinc-900 dark:to-zinc-950">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Resolved</CardTitle>
                <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{isLoading ? "—" : resolved}</div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-xl border bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-[#0f1620] overflow-x-auto">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
            <h2 className="text-sm font-semibold">Recent Tickets</h2>
          </div>
          <Table>
            <TableHeader className="bg-zinc-50/70 dark:bg-[#0b0f14]">
              <TableRow>
                <TableHead className="w-[90px]">ID</TableHead>
                <TableHead className="w-[190px]">Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-red-600">
                    Failed to load tickets.
                  </TableCell>
                </TableRow>
              ) : isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : recent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    No tickets yet.
                  </TableCell>
                </TableRow>
              ) : (
                recent.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell className="text-sm text-zinc-700 dark:text-zinc-300">
                      {t.created_at ? new Date(t.created_at).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell>
                      <Badge className={statusVariant(t.status)}>{t.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
