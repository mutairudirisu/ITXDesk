"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

import { Check, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"


export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && (
                <ToastTitle
                  className={cn(
                    "flex items-center gap-2",
                    (variant === "default" || variant === "success") ? "text-emerald-600" : variant === "destructive" ? "text-red-600" : ""
                  )}
                >
                  {(variant === "default" || variant === "success") && <Check className="h-4 w-4 text-emerald-600" />}
                  {variant === "destructive" && <XCircle className="h-4 w-4 text-red-600" />}
                  {title}
                </ToastTitle>
              )}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
