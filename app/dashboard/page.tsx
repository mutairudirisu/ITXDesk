"use client"

import useSWR from "swr"
import { BarChart3, CircleDashed, CircleDot, CheckCircle2 } from "lucide-react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

  const statusData = [
    { name: "Open", value: open },
    { name: "In Progress", value: inProgress },
    { name: "Resolved", value: resolved },
    { name: "Closed", value: tickets.filter((t) => t.status === "Closed").length },
  ].filter((d) => d.value > 0)

  const priorityData = [
    { name: "Low", value: tickets.filter((t) => t.priority === "Low").length },
    { name: "Medium", value: tickets.filter((t) => t.priority === "Medium").length },
    { name: "High", value: tickets.filter((t) => t.priority === "High").length },
    { name: "Urgent", value: tickets.filter((t) => t.priority === "Urgent").length },
  ].filter((d) => d.value > 0)

  const recentActivity = [...tickets]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  const pieColors = ["#0074de", "#f59e0b", "#10b981", "#71717a"]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-[#0f1620] lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ticket Status</CardTitle>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Distribution</div>
          </CardHeader>
          <CardContent className="h-[280px]">
            {error ? (
              <div className="h-full flex items-center justify-center text-sm text-red-600">Failed to load tickets.</div>
            ) : isLoading ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
            ) : statusData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No tickets yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={28} />
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100} paddingAngle={2}>
                    {statusData.map((_, idx) => (
                      <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-[#0f1620]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Latest</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {error ? (
              <div className="py-6 text-center text-sm text-red-600">Failed to load tickets.</div>
            ) : isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Loading...</div>
            ) : recentActivity.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No activity yet.</div>
            ) : (
              recentActivity.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-white/70 p-3 dark:border-zinc-800 dark:bg-[#0b0f14]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-xs text-zinc-600 dark:text-zinc-400">#{t.id}</div>
                      <Badge className={statusVariant(t.status)}>{t.status}</Badge>
                    </div>
                    <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{t.title}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      {t.created_at ? new Date(t.created_at).toLocaleString() : "—"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-[#0f1620]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Priority Breakdown</CardTitle>
          <div className="text-xs text-zinc-600 dark:text-zinc-400">Distribution</div>
        </CardHeader>
        <CardContent className="h-[260px]">
          {error ? (
            <div className="h-full flex items-center justify-center text-sm text-red-600">Failed to load tickets.</div>
          ) : isLoading ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
          ) : priorityData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No tickets yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend verticalAlign="bottom" height={28} />
                <Pie data={priorityData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={2}>
                  {priorityData.map((_, idx) => (
                    <Cell key={idx} fill={["#71717a", "#fbbf24", "#fb923c", "#ef4444"][idx % 4]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
