"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/app/_lib/supabase"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string>("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("unsupported")

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (!mounted) return
        const meta = (data.user?.user_metadata ?? {}) as Record<string, unknown>
        setEmail(data.user?.email ?? "")
        setFirstName(typeof meta.first_name === "string" ? meta.first_name : "")
        setLastName(typeof meta.last_name === "string" ? meta.last_name : "")
        setAvatarUrl(typeof meta.avatar_url === "string" ? meta.avatar_url : "")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("Notification" in window)) {
      setNotificationPermission("unsupported")
      return
    }
    setNotificationPermission(Notification.permission)
  }, [])

  const notificationStatus = useMemo(() => {
    if (notificationPermission === "unsupported") return "Not supported on this device/browser"
    if (notificationPermission === "granted") return "Enabled"
    if (notificationPermission === "denied") return "Blocked"
    return "Not enabled"
  }, [notificationPermission])

  const onSaveProfile = async () => {
    try {
      setSavingProfile(true)
      const derivedFullName = `${firstName} ${lastName}`.replaceAll(/\s+/g, " ").trim()
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: derivedFullName,
          avatar_url: avatarUrl.trim(),
        },
      })
      if (error) throw error
      toast({
        title: "Saved",
        description: "Profile updated successfully.",
      })
      router.refresh()
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const onChangePassword = async () => {
    const next = newPassword.trim()
    if (next.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      })
      return
    }
    if (next !== confirmPassword.trim()) {
      toast({
        title: "Passwords do not match",
        description: "Please confirm the same password.",
        variant: "destructive",
      })
      return
    }

    try {
      setChangingPassword(true)
      const { error } = await supabase.auth.updateUser({ password: next })
      if (error) throw error
      setNewPassword("")
      setConfirmPassword("")
      toast({
        title: "Updated",
        description: "Password changed successfully.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to change password.",
        variant: "destructive",
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const onEnableNotifications = async () => {
    if (typeof window === "undefined") return
    if (!("Notification" in window)) {
      setNotificationPermission("unsupported")
      toast({
        title: "Not supported",
        description: "Notifications are not supported on this device/browser.",
        variant: "destructive",
      })
      return
    }
    const perm = await Notification.requestPermission()
    setNotificationPermission(perm)
    if (perm === "granted") {
      toast({
        title: "Enabled",
        description: "Notifications are now enabled on this device.",
      })
      return
    }
    toast({
      title: "Not enabled",
      description: perm === "denied" ? "Notifications were blocked in browser settings." : "Notifications were not enabled.",
      variant: perm === "denied" ? "destructive" : "default",
    })
  }

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
    <div className="space-y-4">
      <Card className="max-w-2xl bg-white/80 backdrop-blur dark:bg-zinc-950/60">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={loading ? "Loading..." : email} readOnly className="bg-white/70 dark:bg-[#0b0f14] dark:border-zinc-800" />
            </div>
            <div className="space-y-2">
              <Label>First name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="bg-white/70 dark:bg-[#0b0f14] dark:border-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <Label>Last name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="bg-white/70 dark:bg-[#0b0f14] dark:border-zinc-800"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Avatar URL</Label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="bg-white/70 dark:bg-[#0b0f14] dark:border-zinc-800"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={onSaveProfile} disabled={savingProfile || loading}>
              {savingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl bg-white/80 backdrop-blur dark:bg-zinc-950/60">
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>New password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="bg-white/70 dark:bg-[#0b0f14] dark:border-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="bg-white/70 dark:bg-[#0b0f14] dark:border-zinc-800"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={onChangePassword} disabled={changingPassword || loading}>
              {changingPassword ? "Updating..." : "Change Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl bg-white/80 backdrop-blur dark:bg-zinc-950/60">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="text-sm text-zinc-900 dark:text-zinc-50">Ticket notifications</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">Status: {notificationStatus}</div>
          </div>
          <Button variant="outline" onClick={onEnableNotifications} disabled={notificationPermission === "unsupported" || notificationPermission === "granted"}>
            Enable Notifications
          </Button>
        </CardContent>
      </Card>

      <Card className="max-w-2xl bg-white/80 backdrop-blur dark:bg-zinc-950/60">
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
    </div>
  )
}
