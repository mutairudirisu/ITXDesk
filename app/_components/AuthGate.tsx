"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/app/_lib/supabase"
import { Button } from "@/components/ui/button"

type AuthGateProps = {
  children: ReactNode
}

export default function AuthGate({ children }: AuthGateProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [status, setStatus] = useState<"checking" | "authed" | "unauth" | "error">("checking")
  const [showLoader, setShowLoader] = useState(false)

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

  if (status === "authed") return <>{children}</>

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
