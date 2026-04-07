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


export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle className={`${variant === "default" ? "text-green-600" : "text-red-600"} flex gap-2 items-center`}>
                {variant === "default" && <Check className="h-4 w-4 text-green-600" />}
                {variant === "destructive" && <XCircle className="h-4 w-4 text-white bg-red-600 rounded-full" />}
                {title}
              </ToastTitle>}
              {description && (
                <ToastDescription >{description}</ToastDescription>
              )}
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
