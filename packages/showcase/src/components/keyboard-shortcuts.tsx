"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ShortcutItem {
  keys: string[]
  labelKey: string
}

interface ShortcutGroup {
  titleKey: string
  shortcuts: ShortcutItem[]
}

const shortcutGroups: ShortcutGroup[] = [
  {
    titleKey: "global",
    shortcuts: [
      { keys: ["⌘", "K"], labelKey: "commandPalette" },
      { keys: ["⌘", "N"], labelKey: "quickCapture" },
      { keys: ["?"], labelKey: "shortcutsPanel" },
    ],
  },
  {
    titleKey: "navigation",
    shortcuts: [
      { keys: ["G", "T"], labelKey: "goToday" },
      { keys: ["G", "I"], labelKey: "goInbox" },
      { keys: ["G", "W"], labelKey: "goWeekly" },
      { keys: ["G", "P"], labelKey: "goProjects" },
      { keys: ["G", "R"], labelKey: "goReview" },
    ],
  },
  {
    titleKey: "taskActions",
    shortcuts: [
      { keys: ["D"], labelKey: "markDone" },
      { keys: ["S"], labelKey: "postponeTask" },
      { keys: ["1", "-", "4"], labelKey: "setPriority" },
    ],
  },
]

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)
  const t = useTranslations("keyboardShortcuts")

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only trigger on `?` key when not in an input/textarea
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable

      if (e.key === "?" && !isInput && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    },
    []
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {shortcutGroups.map((group) => (
            <div key={group.titleKey} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t(group.titleKey)}
              </h3>
              <div className="space-y-1">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.labelKey}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/50"
                  >
                    <span className="text-sm">{t(shortcut.labelKey)}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, idx) =>
                        key === "-" ? (
                          <span
                            key={idx}
                            className="text-xs text-muted-foreground"
                          >
                            -
                          </span>
                        ) : (
                          <kbd
                            key={idx}
                            className="inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1.5 text-[11px] font-medium text-muted-foreground"
                          >
                            {key}
                          </kbd>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
