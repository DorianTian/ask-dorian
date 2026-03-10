import React, { useState, useRef } from "react"
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native"
import { Send, Mic } from "lucide-react-native"
import { fragmentApi } from "@ask-dorian/core/api"
import { useSWRConfig } from "swr"
import { useColors, spacing, radii } from "../theme"

interface QuickCaptureProps {
  placeholder?: string
}

export function QuickCapture({
  placeholder = "Capture a thought...",
}: QuickCaptureProps) {
  const colors = useColors()
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const inputRef = useRef<TextInput>(null)
  const { mutate } = useSWRConfig()

  async function handleSend() {
    const trimmed = content.trim()
    if (!trimmed || sending) return

    setSending(true)
    try {
      const result = await fragmentApi.create({ rawContent: trimmed })
      if (result.ok) {
        setContent("")
        mutate(
          (key: string) => typeof key === "string" && key.includes("/fragments"),
          undefined,
          { revalidate: true },
        )
        mutate("/today", undefined, { revalidate: true })
      }
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  return (
    <View style={[s.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TextInput
        ref={inputRef}
        style={[s.input, { color: colors.foreground }]}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        value={content}
        onChangeText={setContent}
        multiline
        maxLength={2000}
        returnKeyType="send"
        blurOnSubmit
        onSubmitEditing={handleSend}
      />
      <View style={s.actions}>
        <TouchableOpacity disabled style={s.iconBtn}>
          <Mic size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            s.sendBtn,
            {
              backgroundColor:
                content.trim() && !sending ? colors.primary : colors.muted,
            },
          ]}
          onPress={handleSend}
          disabled={!content.trim() || sending}
          activeOpacity={0.7}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <Send
              size={16}
              color={
                content.trim() ? colors.primaryForeground : colors.mutedForeground
              }
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconBtn: {
    padding: spacing.sm,
    opacity: 0.4,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
})
