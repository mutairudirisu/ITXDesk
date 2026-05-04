"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/app/_lib/supabase"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { closeExpiredTickets } from "@/app/_lib/data-service"

type AuthGateProps = {
  children: ReactNode
}

export default function AuthGate({ children }: AuthGateProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [status, setStatus] = useState<"checking" | "authed" | "unauth" | "error">("checking")
  const [showLoader, setShowLoader] = useState(false)

  // Inactivity timeout logic (20 minutes)
  useEffect(() => {
    if (status !== "authed") return

    let timeoutId: NodeJS.Timeout

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(async () => {
        toast({
          title: "Session Timeout",
          description: "You have been logged out due to inactivity.",
          variant: "destructive",
        })
        await supabase.auth.signOut()
        router.push("/login")
      }, 20 * 60 * 1000) // 20 minutes
    }

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]
    events.forEach((event) => document.addEventListener(event, resetTimer))

    resetTimer()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      events.forEach((event) => document.removeEventListener(event, resetTimer))
    }
  }, [status, router, toast])

  // Auto-close expired tickets
  useEffect(() => {
    if (status !== "authed") return

    const handleAutoClose = async () => {
      try {
        const closed = await closeExpiredTickets()
        if (closed && closed.length > 0) {
            toast({
              title: "Tickets Auto-closed",
              description: `${closed.length} tickets older than 2 days were automatically closed.`,
              variant: "success",
            })
          }
      } catch (error) {
        console.error("Auto-close error:", error)
      }
    }

    handleAutoClose()
  }, [status, toast])

  useEffect(() => {
    let mounted = true
    setStatus("checking")
    setShowLoader(false)

    const loaderId = window.setTimeout(() => {
      if (!mounted) return
      setShowLoader(true)
    }, 250)

    const nextUrl = `/login?next=${encodeURIComponent(pathname || "/dashboard")}`

    const handle = (session: unknown) => {
      if (!mounted) return
      window.clearTimeout(loaderId)

      if (session) {
        setStatus("authed")
        return
      }

      setStatus("unauth")
      router.replace(nextUrl)
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      handle(session)
    })

    supabase.auth
      .getSession()
      .then(({ data }) => handle(data.session))
      .catch(() => {
        if (!mounted) return
        window.clearTimeout(loaderId)
        setStatus("error")
      })

    return () => {
      mounted = false
      window.clearTimeout(loaderId)
      sub.subscription.unsubscribe()
    }
  }, [pathname, router])

  if (status === "authed") return <>{children}<TicketRealtimeListener toast={toast} /></>

  if (status === "checking") {
    if (!showLoader) return <div className="h-[60vh]" />
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-sm text-zinc-600">Checking session...</div>
      </div>
    )
  }

  if (status === "unauth") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="text-sm text-zinc-600">You need to sign in to continue.</div>
          <Button onClick={() => router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`)}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="space-y-3 text-center">
        <div className="text-sm text-zinc-600">Session check failed. Please try again.</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    </div>
  )
}

type TicketRealtimeListenerProps = {
  toast: (args: { title?: string; description?: string; variant?: "default" | "destructive" | "success" }) => void
}

function TicketRealtimeListener({ toast }: TicketRealtimeListenerProps) {
  useEffect(() => {
    const pushToStore = (title: string, description: string) => {
      if (typeof window === "undefined") return
      try {
        const key = "itxdesk_notifications"
        const raw = window.localStorage.getItem(key)
        const parsed = raw ? (JSON.parse(raw) as unknown) : []
        const list = Array.isArray(parsed) ? parsed : []
        const next = [
          {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            title,
            description,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...list,
        ].slice(0, 200)
        window.localStorage.setItem(key, JSON.stringify(next))
        window.dispatchEvent(new Event("itxdesk:notifications"))
      } catch {
        return
      }
    }

    const notify = (title: string, description: string) => {
      toast({ title, description, variant: "success" })
      pushToStore(title, description)
      if (typeof window === "undefined") return
      if (!("Notification" in window)) return
      
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }

      if (Notification.permission === "granted") {
        try {
          new Notification(title, { body: description, icon: "/ITXDesk.svg" })
        } catch (err) {
          console.error("Browser notification error:", err)
        }
      }
    }

    const channel = supabase
      .channel("itxdesk-tickets")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tickets" },
        (payload) => {
          console.log("Realtime INSERT received:", payload)
          const row = (payload as unknown as { new?: Record<string, unknown> }).new ?? {}
          const title = typeof row.title === "string" ? row.title : "New ticket"
          const id = typeof row.id === "number" ? row.id : null
          notify("New ticket logged", id ? `#${id} • ${title}` : title)
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tickets" },
        (payload) => {
          console.log("Realtime UPDATE received:", payload)
          const p = payload as unknown as { new?: Record<string, unknown>; old?: Record<string, unknown> }
          const nextStatus = typeof p.new?.status === "string" ? p.new?.status : ""
          const prevStatus = typeof p.old?.status === "string" ? p.old?.status : ""
          if (!nextStatus || nextStatus === prevStatus) return
          const id = typeof p.new?.id === "number" ? p.new?.id : null
          
          if (nextStatus === "Resolved") {
            notify("Ticket Resolved", id ? `#${id} has been resolved` : `Ticket resolved`)
          } else {
            notify("Ticket updated", id ? `#${id} marked as ${nextStatus}` : `Marked as ${nextStatus}`)
          }
        }
      )
      .subscribe((status) => {
        console.log("Supabase Realtime Status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [toast])

  return null
}
