"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/app/_lib/supabase"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { toast } = useToast()
  const router = useRouter()

  const onSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      })
      return
    }
    router.push("/login")
    router.refresh()
  }

  return (
    <Card className="max-w-xl bg-white/80 backdrop-blur dark:bg-zinc-950/60">
      <CardHeader>
        <CardTitle>Session</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="text-sm text-zinc-600">Sign out of ITX Helpdesk on this device.</div>
        <Button variant="destructive" onClick={onSignOut}>
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}
