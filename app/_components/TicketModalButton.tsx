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
          "duration-300 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          "sm:left-[50%] sm:top-[50%] sm:bottom-auto sm:right-auto sm:w-full sm:max-w-2xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:p-6 sm:pb-6 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg">{labelHeader ?? label}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(92vh-5.5rem)] sm:h-[560px] w-full rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-[#0b0f14]">
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
