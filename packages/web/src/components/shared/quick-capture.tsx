"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { Send, Mic, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { fragmentApi } from "@ask-dorian/core/api"
import { useSWRConfig } from "swr"

interface QuickCaptureProps {
  className?: string
  placeholder?: string
}

export function QuickCapture({
  className,
  placeholder = "记录一条碎片... 按 Enter 发送",
}: QuickCaptureProps) {
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { mutate } = useSWRConfig()

  async function handleSend() {
    const trimmed = content.trim()
    if (!trimmed || sending) return

    setSending(true)
    try {
      const result = await fragmentApi.create({ rawContent: trimmed })
      if (result.ok) {
        setContent("")
        // Revalidate all fragment-related queries
        mutate((key: string) => typeof key === "string" && key.includes("/fragments"), undefined, { revalidate: true })
        mutate("/today", undefined, { revalidate: true })
      }
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2 rounded-lg border bg-card p-3 shadow-sm transition-shadow focus-within:shadow-md",
        className,
      )}
    >
      <textarea
        ref={inputRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="min-h-[36px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        style={{
          height: "auto",
          overflow: "hidden",
        }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement
          target.style.height = "auto"
          target.style.height = Math.min(target.scrollHeight, 120) + "px"
        }}
      />
      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground"
          disabled
          title="Voice (coming soon)"
        >
          <Mic className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          className="h-8 w-8"
          disabled={!content.trim() || sending}
          onClick={handleSend}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
