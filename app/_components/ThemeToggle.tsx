"use client"

import { useEffect, useState } from "react"
import { Sun, Moon, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Mode = "light" | "dark" | "system"

const getSystemPrefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches

const applyMode = (mode: Mode) => {
  const root = document.documentElement
  if (mode === "system") {
    const dark = getSystemPrefersDark()
    root.classList.toggle("dark", dark)
  } else {
    root.classList.toggle("dark", mode === "dark")
  }
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system")

  useEffect(() => {
    const saved = localStorage.getItem("theme-mode") as Mode | null
    const next = saved ?? "system"
    setMode(next)
    applyMode(next)

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)")
    const handler = () => {
      const stored = (localStorage.getItem("theme-mode") as Mode | null) ?? "system"
      if (stored === "system") applyMode("system")
    }
    mq?.addEventListener?.("change", handler)
    return () => mq?.removeEventListener?.("change", handler)
  }, [])

  const change = (m: Mode) => {
    setMode(m)
    localStorage.setItem("theme-mode", m)
    applyMode(m)
  }

  const ActiveIcon = mode === "light" ? Sun : mode === "dark" ? Moon : Laptop

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="md:hidden">
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Theme"
            className="bg-white/70 backdrop-blur dark:bg-[#0f1620] dark:border-zinc-800"
          >
            <ActiveIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="md:hidden">
          <DropdownMenuItem onClick={() => change("light")}>
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => change("system")}>
            <Laptop className="mr-2 h-4 w-4" />
            System
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => change("dark")}>
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden md:inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/70 p-1 backdrop-blur dark:border-zinc-800 dark:bg-[#0f1620]">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Light theme"
          onClick={() => change("light")}
          className={mode === "light" ? "bg-zinc-900 text-white rounded-full hover:bg-zinc-900 hover:text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-white" : ""}
        >
          <Sun className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="System theme"
          onClick={() => change("system")}
          className={mode === "system" ? "bg-zinc-900 text-white rounded-full hover:bg-zinc-900 hover:text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-white" : ""}
        >
          <Laptop className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Dark theme"
          onClick={() => change("dark")}
          className={mode === "dark" ? "bg-zinc-900 rounded-full text-white hover:bg-zinc-900 hover:text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-white" : ""}
        >
          <Moon className="h-4 w-4" />
        </Button>
      </div>
    </>
  )
}
