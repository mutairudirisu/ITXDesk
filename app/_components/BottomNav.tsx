"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, LayoutDashboard, Settings, Ticket } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/tickets", label: "Tickets", Icon: Ticket },
  { href: "/notifications", label: "Alerts", Icon: Bell },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
] as const

export default function BottomNav() {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const readUnread = () => {
      try {
        const raw = window.localStorage.getItem("itxdesk_notifications")
        const parsed = raw ? (JSON.parse(raw) as unknown) : []
        const list = Array.isArray(parsed) ? (parsed as Array<{ read?: boolean }>) : []
        setUnread(list.filter((n) => !n.read).length)
      } catch {
        setUnread(0)
      }
    }
    readUnread()
    window.addEventListener("itxdesk:notifications", readUnread)
    window.addEventListener("storage", readUnread)
    return () => {
      window.removeEventListener("itxdesk:notifications", readUnread)
      window.removeEventListener("storage", readUnread)
    }
  }, [])

  const hasUnread = useMemo(() => unread > 0, [unread])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="border-t border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <nav className="mx-auto grid max-w-md grid-cols-4 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {items.map(({ href, label, Icon }) => {
            const active = pathname === href
            const isNotifications = href === "/notifications"
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium",
                  active
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900/60 dark:text-zinc-50"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900/40"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5", active ? "text-[#0074de]" : "text-zinc-500 dark:text-zinc-400")} />
                  {isNotifications && hasUnread ? (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950" />
                  ) : null}
                </div>
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
