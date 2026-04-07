import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ReactNode } from "react"

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
      <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur dark:bg-[#0f1620] border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg">{labelHeader ?? label}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[560px] w-full rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-[#0b0f14]">
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
