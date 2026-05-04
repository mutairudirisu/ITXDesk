"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { insertTicket, type TicketCategory, type TicketCreateData, type TicketPriority } from "@/app/_lib/data-service"
import { mutate } from "swr"

const categories: TicketCategory[] = ["Hardware", "Software", "Network", "Access", "Other"]
const priorities: TicketPriority[] = ["Low", "Medium", "High", "Urgent"]

const formSchema = z.object({
  title: z.string().min(3, "Title is too short"),
  category: z.enum(["Hardware", "Software", "Network", "Access", "Other"]),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  floor: z.string().optional(),
  requester_name: z.string().optional(),
  requester_email: z.string().email("Invalid email address").optional().or(z.literal("")),
  description: z.string().optional(),
})

type TicketFormProps = {
  onClose: () => void
}

const normalize = (value: string) => value.trim().toLowerCase()

const buildSuggestedSteps = (title: string, category: TicketCategory) => {
  const t = normalize(title)

  const common = [
    "Restarted the affected device",
    "Tried again after signing out/in (where applicable)",
    "Checked for any visible error message and captured it",
  ]

  if (category === "Network") {
    const wifi = /wifi|wi-fi|wireless|wlan/.test(t)
    const vpn = /vpn/.test(t)
    const internet = /internet|offline|no connection|cannot connect|can't connect|network/.test(t)
    const steps = [
      ...(wifi ? ["Toggled Wi‑Fi off/on and forgot/rejoined the network"] : []),
      ...(vpn ? ["Disconnected and reconnected VPN"] : []),
      ...(internet ? ["Tested another website/app to confirm internet impact"] : []),
      "Tried a different network (mobile hotspot) to isolate the issue",
      "Ran a quick ping test (if possible)",
      "Restarted router/access point (if within control)",
      ...common,
    ]
    return Array.from(new Set(steps))
  }

  if (category === "Hardware") {
    const power = /won't turn on|wont turn on|no power|dead|power|charging|battery/.test(t)
    const display = /screen|display|black screen|flicker/.test(t)
    const peripheral = /keyboard|mouse|touchpad|printer|usb|port/.test(t)
    const steps = [
      ...(power ? ["Checked power cable/charger and tried a different outlet"] : []),
      ...(display ? ["Adjusted brightness and tested with an external monitor (if available)"] : []),
      ...(peripheral ? ["Unplugged/replugged and tried a different port/cable"] : []),
      "Restarted the device and checked for any hardware indicator lights",
      "Checked for physical damage or loose connections",
      ...common,
    ]
    return Array.from(new Set(steps))
  }

  if (category === "Software") {
    const install = /install|installation|setup/.test(t)
    const login = /login|sign in|signin|password|auth|authentication|otp|2fa|mfa/.test(t)
    const crash = /crash|not opening|won't open|wont open|freeze|stuck/.test(t)
    const slow = /slow|lag|loading|timeout/.test(t)
    const steps = [
      ...(crash ? ["Force-closed the app and reopened it"] : []),
      ...(slow ? ["Tried on a different network and reloaded the page/app"] : []),
      ...(install ? ["Ran installer as administrator and verified disk space"] : []),
      ...(login ? ["Verified correct username/email and attempted password reset"] : []),
      "Cleared browser cache/cookies (if web-based)",
      "Tried in a different browser or incognito/private mode (if web-based)",
      "Checked for updates and restarted the application",
      "Reinstalled the application (if allowed) or repaired installation",
      ...common,
    ]
    return Array.from(new Set(steps))
  }

  if (category === "Access") {
    const password = /password|reset|locked|lockout|locked out/.test(t)
    const permissions = /permission|access|role|privilege|denied|unauthorized|forbidden/.test(t)
    const steps = [
      ...(password ? ["Tried password reset and confirmed the account email"] : []),
      ...(permissions ? ["Confirmed required role/access level with manager/requester"] : []),
      "Verified correct account details and system name",
      "Tried signing in from a different device/browser",
      ...common,
    ]
    return Array.from(new Set(steps))
  }

  return common
}

const generateAssistedDescription = (input: { title: string; category: TicketCategory; floor?: string }) => {
  const intro =
    input.category === "Access"
      ? "Access request submitted via ITX Helpdesk."
      : "Support request submitted via ITX Helpdesk."

  const systemPrompt =
    input.category === "Network"
      ? "Please include: location, affected device(s), Wi‑Fi/LAN, and any error message."
      : input.category === "Hardware"
        ? "Please include: device model/asset tag, symptoms, and whether the device powers on."
        : input.category === "Software"
          ? "Please include: application name/version, steps to reproduce, and any error message."
          : input.category === "Access"
            ? "Please include: system name, access level/role needed, and business justification."
            : "Please include: impact, frequency, and any relevant screenshots/logs."

  const steps = buildSuggestedSteps(input.title, input.category)

  const lines = [
    intro,
    "",
    `Title: ${input.title}`,
    `Category: ${input.category}`,
    ...(input.floor?.trim() ? [`Location/Floor: ${input.floor.trim()}`] : []),
    "",
    "What I already tried (suggested):",
    ...steps.map((s) => `- ${s}`),
    "",
    "Details:",
    "- (Add the exact error message, when it started, and any extra context)",
    "",
    "Impact:",
    "- (Who/what is affected?)",
    "",
    "Urgency/Deadline:",
    "- (If time-sensitive, add the deadline here)",
    "",
    "Checklist:",
    `- ${systemPrompt}`,
  ]

  return lines.join("\n")
}

export default function TicketForm({ onClose }: TicketFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAssisting, setIsAssisting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "Software",
      priority: "Medium",
      floor: "",
      requester_name: "",
      requester_email: "",
      description: "",
    },
  })

  const watched = form.watch()

  const assistEnabled = useMemo(() => {
    return watched.title.trim().length >= 3
  }, [watched.title])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      const payload: TicketCreateData = {
        title: values.title.trim(),
        category: values.category,
        priority: values.priority,
        requester_name: values.requester_name?.trim() || undefined,
        requester_email: values.requester_email?.trim() || undefined,
        description:
          [values.floor?.trim() ? `Location/Floor: ${values.floor.trim()}` : "", values.description?.trim() || ""]
            .filter(Boolean)
            .join("\n\n") || undefined,
      }

      await insertTicket(payload)
      await mutate("tickets")

      toast({
        title: "Success",
        description: "Ticket created successfully.",
        variant: "success",
      })

      form.reset()
      onClose()
    } catch {
      toast({
        title: "Error",
        description: "Failed to create ticket. Please check your Supabase table and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onAssist = () => {
    try {
      if (!assistEnabled) return
      setIsAssisting(true)

      const next = generateAssistedDescription({
        title: form.getValues().title,
        category: form.getValues().category,
        floor: form.getValues().floor,
      })

      const current = (form.getValues().description ?? "").trim()
      const value = current ? `${next}\n\n---\n\nExisting notes:\n${current}` : next
      form.setValue("description", value, { shouldDirty: true })
    } finally {
      setIsAssisting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-1 py-2">
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-white/80 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/60">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Laptop won’t connect to Wi‑Fi"
                    {...field}
                    className="bg-white/70 dark:bg-zinc-950/40"
                  />
                </FormControl>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  AI uses your title to draft a description template.
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/70 dark:bg-zinc-950/40">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/70 dark:bg-zinc-950/40">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="requester_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requester Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} className="bg-white/70 dark:bg-zinc-950/40" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requester_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requester Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} className="bg-white/70 dark:bg-zinc-950/40" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="floor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Floor / Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 2nd Floor, Reception" {...field} className="bg-white/70 dark:bg-zinc-950/40" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between gap-2">
                  <FormLabel>Description</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAssist}
                    disabled={!assistEnabled || isAssisting}
                    className="h-8"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Generate
                  </Button>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Add details (or generate with AI)"
                    className="min-h-52 bg-white/70 dark:bg-zinc-950/40"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Ticket"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
