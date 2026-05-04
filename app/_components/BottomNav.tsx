"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, LayoutDashboard, Settings, Ticket, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/tickets", label: "Tickets", Icon: Ticket },
  { href: "/reports", label: "Reports", Icon: BarChart3 },
  { href: "/notifications", label: "Alerts", Icon: Bell },
  { href: "/admin/settings", label: "Profile", Icon: Settings },
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
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="w-full rounded-t-3xl border-t border-zinc-200 bg-white/90 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
        <nav className="grid grid-cols-5 gap-1 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {items.map(({ href, label, Icon }) => {
            const active = pathname === href
            const isNotifications = href === "/notifications"
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[10px] font-semibold transition-all duration-200 active:scale-95",
                  active
                    ? "text-[#0074de]"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-6 w-6 transition-transform duration-200", active && "scale-110")} />
                  {isNotifications && hasUnread ? (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950" />
                  ) : null}
                </div>
                <span className={cn("tracking-tight", active ? "font-bold" : "font-medium")}>{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
