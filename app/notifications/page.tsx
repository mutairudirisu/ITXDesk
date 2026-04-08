"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type StoredNotification = {
  id: string
  title: string
  description: string
  createdAt: string
  read: boolean
}

const loadNotifications = () => {
  if (typeof window === "undefined") return [] as StoredNotification[]
  try {
    const raw = window.localStorage.getItem("itxdesk_notifications")
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? (parsed as StoredNotification[]) : []
  } catch {
    return []
  }
}

export default function NotificationsPage() {
  const [items, setItems] = useState<StoredNotification[]>([])

  useEffect(() => {
    const refresh = () => setItems(loadNotifications())
    refresh()
    window.addEventListener("itxdesk:notifications", refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener("itxdesk:notifications", refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items])

  const markAllRead = () => {
    const next = items.map((n) => ({ ...n, read: true }))
    setItems(next)
    window.localStorage.setItem("itxdesk_notifications", JSON.stringify(next))
    window.dispatchEvent(new Event("itxdesk:notifications"))
  }

  const clearAll = () => {
    setItems([])
    window.localStorage.setItem("itxdesk_notifications", JSON.stringify([]))
    window.dispatchEvent(new Event("itxdesk:notifications"))
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-[#0f1620]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#0074de]" />
            Notifications
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={markAllRead} disabled={items.length === 0 || unread === 0} className="dark:bg-[#0b0f14] dark:border-zinc-800">
              Mark all read
            </Button>
            <Button variant="destructive" onClick={clearAll} disabled={items.length === 0}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">No notifications yet.</div>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-[#0b0f14]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">{n.title}</div>
                    {!n.read ? <span className="h-2 w-2 rounded-full bg-red-500" /> : null}
                  </div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300">{n.description}</div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

