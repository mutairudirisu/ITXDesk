"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/app/_lib/supabase"
import ThemeToggle from "./ThemeToggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import itxDesk from "@/public/ITXDesk.svg"

type UserInfo = {
  email?: string | null
  avatarUrl?: string | null
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
}

const initials = (text?: string | null) => {
  if (!text) return "U"
  const [a, b] = text.split("@")[0].split(/[.\s_-]+/)
  const first = a?.[0] ?? ""
  const second = b?.[0] ?? ""
  return (first + second).toUpperCase() || (text[0] ?? "U").toUpperCase()
}

type TopBarProps = {
  title?: string
  subtitle?: string
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const [user, setUser] = useState<UserInfo>({})
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null)

  const derived = (() => {
    if (pathname === "/dashboard") return { title: "Dashboard", subtitle: "Overview of tickets and activity." }
    if (pathname === "/tickets") return { title: "Tickets", subtitle: "Log requests, track progress, and export data." }
    if (pathname === "/notifications") return { title: "Notifications", subtitle: "Updates from ticket activity." }
    if (pathname === "/admin/settings") return { title: "Settings", subtitle: "Manage your session and application preferences." }
    if (pathname?.startsWith("/admin")) return { title: "Admin", subtitle: "Manage ITX Helpdesk." }
    return { title: "ITX Helpdesk", subtitle: undefined }
  })()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      const meta = (data.user?.user_metadata ?? {}) as Record<string, unknown>
      const firstName = typeof meta.first_name === "string" ? meta.first_name : null
      const lastName = typeof meta.last_name === "string" ? meta.last_name : null
      const fullName = typeof meta.full_name === "string" ? meta.full_name : null
      setUser({
        email: data.user?.email,
        avatarUrl: typeof meta.avatar_url === "string" ? meta.avatar_url : null,
        firstName,
        lastName,
        fullName,
      })
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

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

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault?.()
      setInstallPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    }
  }, [])

  const hasUnread = useMemo(() => unread > 0, [unread])

  const onInstall = async () => {
    const p = installPrompt as unknown as { prompt?: () => Promise<void>; userChoice?: Promise<unknown> } | null
    if (!p?.prompt) return
    await p.prompt()
    try {
      await p.userChoice
    } finally {
      setInstallPrompt(null)
    }
  }

  const displayName = (() => {
    const n = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
    if (n) return n
    if (user.fullName?.trim()) return user.fullName.trim()
    const e = user.email?.trim() ?? ""
    if (!e) return "Signed in"
    return e.split("@")[0] || e
  })()

  const onSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#0b0f14]/90 px-4 md:px-10 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur">
      <div className="py-4 md:py-6 flex items-start sm:items-center justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <h1 className="text-base md:text-lg font-semibold truncate">{title ?? derived.title}</h1>
          {(subtitle ?? derived.subtitle) ? (
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{subtitle ?? derived.subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/notifications"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/70 backdrop-blur hover:bg-white dark:border-zinc-800 dark:bg-[#0f1620] dark:hover:bg-[#111b26]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
          {hasUnread ? (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0b0f14]" />
          ) : null}
        </Link>
        {installPrompt ? (
          <button
            type="button"
            onClick={() => void onInstall()}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/70 backdrop-blur hover:bg-white dark:border-zinc-800 dark:bg-[#0f1620] dark:hover:bg-[#111b26]"
            aria-label="Install app"
          >
            <Image src={itxDesk} alt="Install" width={18} height={18} />
            {hasUnread ? (
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0b0f14]" />
            ) : null}
          </button>
        ) : null}
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-2 py-1.5 backdrop-blur hover:bg-white dark:border-zinc-800 dark:bg-[#0f1620] dark:hover:bg-[#111b26]">
            <Avatar className="h-8 w-8 ring-2 ring-zinc-200 dark:ring-zinc-800">
              {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="Profile" /> : null}
              <AvatarFallback className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                {initials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start leading-none">
              <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{displayName}</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">{user.email ?? ""}</div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSignOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </div>
    </header>
  )
}
