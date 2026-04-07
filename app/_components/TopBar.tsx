"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/_lib/supabase"
import ThemeToggle from "./ThemeToggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, Settings } from "lucide-react"
import Link from "next/link"

type UserInfo = {
  email?: string | null
  avatarUrl?: string | null
}

const initials = (text?: string | null) => {
  if (!text) return "U"
  const [a, b] = text.split("@")[0].split(/[.\s_-]+/)
  const first = a?.[0] ?? ""
  const second = b?.[0] ?? ""
  return (first + second).toUpperCase() || (text[0] ?? "U").toUpperCase()
}

type TopBarProps = {
  title: string
  subtitle?: string
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const [user, setUser] = useState<UserInfo>({})

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      const meta = (data.user?.user_metadata ?? {}) as Record<string, unknown>
      setUser({
        email: data.user?.email,
        avatarUrl: typeof meta.avatar_url === "string" ? meta.avatar_url : null,
      })
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const onSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <header className="z-40 py-4 md:py-6 flex flex-col md:flex-row gap-2 md:gap-0 md:justify-between md:items-center bg-white/70 dark:bg-[#0b0f14]/90 px-4 md:px-10 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur">
      <div className="space-y-0.5">
        <h1 className="text-base md:text-lg font-semibold">{title}</h1>
        {subtitle && <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-2 py-1.5 backdrop-blur hover:bg-white dark:border-zinc-800 dark:bg-[#0f1620] dark:hover:bg-[#111b26]">
            <Avatar className="h-8 w-8 ring-2 ring-zinc-200 dark:ring-zinc-800">
              {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="Profile" /> : null}
              <AvatarFallback className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                {initials(user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start leading-none">
              <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Account</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">{user.email ?? "Signed in"}</div>
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
    </header>
  )
}
