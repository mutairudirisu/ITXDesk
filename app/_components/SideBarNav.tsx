'use client'

import { useEffect, useMemo, useState } from 'react'
import { LayoutDashboard, Settings, Ticket, PanelLeft, PanelRight, BarChart3 } from 'lucide-react'
import { Bell } from 'lucide-react'
import Image from "next/image"

import { cn } from "@/lib/utils";
import { usePathname } from 'next/navigation';
import NavLink from './NavLink';
import { supabase } from '../_lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import itxDesk from "@/public/ITXDesk.svg"

type SidebarUser = {
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

export default function SideBarNav() {
    const pathname = usePathname();
    const [expanded, setExpanded] = useState(true);
    const [user, setUser] = useState<SidebarUser>({});
    const [unread, setUnread] = useState(0);

    useEffect(() => {
      const stored = localStorage.getItem('sidebarExpanded');
      if (stored !== null) {
        setExpanded(stored === 'true');
      } else {
        const prefersExpanded = window.innerWidth >= 1024;
        setExpanded(prefersExpanded);
      }
    }, []);

    useEffect(() => {
      localStorage.setItem('sidebarExpanded', String(expanded));
    }, [expanded]);

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
    const iconClass = (active: boolean) => cn("h-5 w-5", active ? "text-[#0074de]" : "text-zinc-500 dark:text-zinc-400");

    return (
      <div
        className={cn(
          'relative z-[95] h-screen flex flex-col duration-300 p-2 border-r bg-white dark:bg-[#0b0f14] dark:border-zinc-800',
          expanded ? 'w-64' : 'w-18'
        )}
      >
        <div className='relative flex justify-between items-center h-16 bg-white dark:bg-[#0b0f14] border-b border-b-zinc-200 dark:border-b-zinc-800 px-2'>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-800">
              <Image src={itxDesk} alt="ITXDesk" width={28} height={28} priority />
            </div>
            {expanded && <h1 className="text-[#0074de] font-semibold">ITX Helpdesk</h1>}
          </div>
        </div>
        
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Toggle sidebar"
                className="absolute top-10 -right-6 z-[110] -translate-y-1/2 rounded-lg border border-zinc-200 bg-white shadow-md hover:bg-zinc-50 dark:border-zinc-800 dark:bg-[#0f1620] dark:hover:bg-[#111b26] p-1.5"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? <PanelLeft size={18} className="text-zinc-700 dark:text-zinc-200" /> : <PanelRight size={18} className="text-zinc-700 dark:text-zinc-200" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              {expanded ? "Collapse" : "Expand"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <nav className='flex-1'>
          <div className="flex flex-col items-center space-y-1 mt-4">
            <NavLink href='/dashboard' label="Dashboard" isActive={pathname === '/dashboard'} isSidebarHovered={expanded} >
              <LayoutDashboard className={iconClass(pathname === '/dashboard')} />
            </NavLink>
            <NavLink href='/tickets' label="Tickets" isActive={pathname === '/tickets'} isSidebarHovered={expanded}>
              <Ticket className={iconClass(pathname === '/tickets')} />
            </NavLink>
            <NavLink href='/reports' label="Reports" isActive={pathname === '/reports'} isSidebarHovered={expanded}>
              <BarChart3 className={iconClass(pathname === '/reports')} />
            </NavLink>
            <NavLink href='/notifications' label="Notifications" isActive={pathname === '/notifications'} isSidebarHovered={expanded}>
              <div className="relative">
                <Bell className={iconClass(pathname === '/notifications')} />
                {hasUnread ? (
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0b0f14]" />
                ) : null}
              </div>
            </NavLink>
            <NavLink href='/admin/settings' label="Profile Settings" isActive={pathname === '/admin/settings'} isSidebarHovered={expanded}>
              <Settings className={iconClass(pathname === '/admin/settings')} />
            </NavLink>
          </div>
        </nav>

        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 h-14 rounded-xl w-full flex items-center gap-3 transition-all duration-300 px-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Avatar className="h-9 w-9 ring-2 ring-zinc-200 dark:ring-zinc-800">
                    {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="Profile" /> : null}
                    <AvatarFallback className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                      {initials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              {!expanded && (
                <TooltipContent side="right" align="center">
                  {user.email ?? "Signed in"}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          {expanded ? (
            <div className="min-w-0">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {user.email ?? "Signed in"}
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 truncate">Ticketing system</div>
            </div>
          ) : (
            <div className="sr-only">{user.email ?? "Signed in"}</div>
          )}
        </div>
      </div>
    )
}
