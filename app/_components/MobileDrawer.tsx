"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

type MobileDrawerProps = {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function MobileDrawer({ open, onClose, title, subtitle, children, footer }: MobileDrawerProps) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[45] flex items-end justify-center pb-[calc(5rem+env(safe-area-inset-bottom))] md:items-center md:pb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          aria-modal="true"
          role="dialog"
        >
          <button
            type="button"
            className="absolute inset-x-0 top-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] bg-black/50"
            onClick={onClose}
            aria-label="Close"
          />

          <motion.div
            className="relative w-full bg-white shadow-2xl overflow-hidden rounded-t-[28px] md:max-w-2xl md:rounded-[28px] dark:bg-zinc-950"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              const shouldClose = info.offset.y > 90 || info.velocity.y > 900
              if (shouldClose) onClose()
            }}
            style={{ height: "90dvh" }}
          >
            <div className="flex justify-center pt-3 md:hidden">
              <div className="h-1.5 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="px-5 pt-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {title ? <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</div> : null}
                  {subtitle ? (
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">{subtitle}</div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-4" style={{ height: "calc(90dvh - 140px)" }}>
              {children}
            </div>

            {footer ? (
              <div className="px-5 py-4 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
