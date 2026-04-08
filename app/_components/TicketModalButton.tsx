"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type TicketModalButtonProps = {
  children: ReactNode
  label: string
  labelHeader?: string
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function TicketModalButton({
  children,
  label,
  labelHeader,
  className,
  open,
  onOpenChange,
}: TicketModalButtonProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        className={`text-xs px-3 rounded-lg py-2 bg-[#0074de] text-white tracking-wide font-semibold border border-[#0074de] shadow-sm hover:bg-[#0b5fb0] ${className ?? ""}`}
      >
        {label}
      </DialogTrigger>
      <DialogContent
        className={cn(
          "bg-white/95 backdrop-blur dark:bg-[#0f1620] border-zinc-200 dark:border-zinc-800",
          "left-0 right-0 bottom-0 top-auto translate-x-0 translate-y-0 max-w-none w-full rounded-t-2xl rounded-b-none p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]",
          "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          "md:left-[50%] md:top-[50%] md:bottom-auto md:right-auto md:w-full md:max-w-2xl md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-lg md:p-6 md:pb-6 md:data-[state=closed]:slide-out-to-left-1/2 md:data-[state=closed]:slide-out-to-top-[48%] md:data-[state=open]:slide-in-from-left-1/2 md:data-[state=open]:slide-in-from-top-[48%]"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg">{labelHeader ?? label}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(85vh-5.5rem)] md:h-[560px] w-full rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-[#0b0f14]">
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
