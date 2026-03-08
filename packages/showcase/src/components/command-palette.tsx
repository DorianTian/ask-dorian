"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import {
  Sparkles,
  ListTodo,
  FileText,
  Lightbulb,
  Sun,
  Inbox,
  CalendarRange,
  FolderKanban,
  RotateCcw,
  Plus,
  Search,
} from "lucide-react"

import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandEmpty,
  CommandShortcut,
} from "@/components/ui/command"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const t = useTranslations("commandPalette")

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
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
    <CommandDialog open={open} onOpenChange={setOpen} title={t("hint")}>
      <Command>
        <CommandInput placeholder={t("placeholder")} />
        <CommandList>
          <CommandEmpty>{t("noResults")}</CommandEmpty>

          {/* Quick Capture */}
          <CommandGroup heading={t("quickCapture")}>
            <CommandItem>
              <Sparkles className="text-muted-foreground" />
              <span>{t("typeFragment")}</span>
            </CommandItem>
            <CommandItem>
              <ListTodo className="text-muted-foreground" />
              <span>{t("slashTask")}</span>
            </CommandItem>
            <CommandItem>
              <FileText className="text-muted-foreground" />
              <span>{t("slashNote")}</span>
            </CommandItem>
            <CommandItem>
              <Lightbulb className="text-muted-foreground" />
              <span>{t("slashIdea")}</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Navigation */}
          <CommandGroup heading={t("navigation")}>
            <CommandItem>
              <Sun className="text-muted-foreground" />
              <span>{t("goToday")}</span>
              <CommandShortcut>G T</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Inbox className="text-muted-foreground" />
              <span>{t("goInbox")}</span>
              <CommandShortcut>G I</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CalendarRange className="text-muted-foreground" />
              <span>{t("goWeekly")}</span>
              <CommandShortcut>G W</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <FolderKanban className="text-muted-foreground" />
              <span>{t("goProjects")}</span>
              <CommandShortcut>G P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <RotateCcw className="text-muted-foreground" />
              <span>{t("goReview")}</span>
              <CommandShortcut>G R</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Actions */}
          <CommandGroup heading={t("actions")}>
            <CommandItem>
              <Plus className="text-muted-foreground" />
              <span>{t("newFragment")}</span>
              <CommandShortcut>N</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Search className="text-muted-foreground" />
              <span>{t("searchAll")}</span>
              <CommandShortcut>/</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
