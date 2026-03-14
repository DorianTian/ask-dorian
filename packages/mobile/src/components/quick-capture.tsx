import React, { useState, useRef, useImperativeHandle, forwardRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native"
import { Sparkles, Image as ImageIcon, Mic, ArrowRight } from "lucide-react-native"
import { fragmentApi } from "@ask-dorian/core/api"
import { useSWRConfig } from "swr"
import { useColors, spacing, radii } from "../theme"

export interface QuickCaptureHandle {
  focus: () => void
}

interface QuickCaptureProps {
  placeholder?: string
}

export const QuickCapture = forwardRef<QuickCaptureHandle, QuickCaptureProps>(function QuickCapture({
  placeholder = "Type anything to capture...",
}, ref) {
  const colors = useColors()
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const inputRef = useRef<TextInput>(null)
  const { mutate } = useSWRConfig()

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }))

  const primaryBg10 = colors.brandFrom + "1A" // ~10% opacity

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

  const canSend = content.trim().length > 0 && !sending
  const isWeb = Platform.OS === "web"

  return (
    <View
      style={[
        s.container,
        {
          backgroundColor: colors.card + "E6", // ~90% opacity
          borderColor: colors.border,
        },
      ]}
    >
      {/* Input row */}
      <View style={s.inputRow}>
        {/* Sparkles icon */}
        <View
          style={[
            s.sparklesBox,
            { backgroundColor: primaryBg10 },
          ]}
        >
          <Sparkles size={18} color={colors.brandFrom} />
        </View>

        {/* Text input */}
        <TextInput
          ref={inputRef}
          style={[s.input, { color: colors.foreground }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={2000}
          returnKeyType="send"
          blurOnSubmit
          onSubmitEditing={handleSend}
        />

        {/* Action buttons */}
        <View style={s.actions}>
          {isWeb && (
            <>
              <TouchableOpacity
                style={s.iconBtn}
                activeOpacity={0.7}
                disabled
              >
                <ImageIcon size={18} color={colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity
                style={s.iconBtn}
                activeOpacity={0.7}
                disabled
              >
                <Mic size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </>
          )}

          {/* Process button */}
          <TouchableOpacity
            style={[
              s.processBtn,
              {
                backgroundColor: canSend ? colors.brandFrom : colors.muted,
              },
            ]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.85}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <View style={s.processBtnInner}>
                <Text
                  style={[
                    s.processBtnText,
                    {
                      color: canSend
                        ? colors.primaryForeground
                        : colors.mutedForeground,
                    },
                  ]}
                >
                  Process
                </Text>
                <ArrowRight
                  size={14}
                  color={
                    canSend
                      ? colors.primaryForeground
                      : colors.mutedForeground
                  }
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom hints row */}
      <View style={s.hintsRow}>
        <Text style={[s.hintLabel, { color: colors.textMuted }]}>
          {Platform.OS === "ios" || Platform.OS === "android"
            ? "Quick Capture"
            : "⌘K Search"}
        </Text>
        <View style={s.hintRight}>
          <View
            style={[s.pulseDot, { backgroundColor: colors.brandFrom }]}
          />
          <Text style={[s.hintLabel, { color: colors.brandFrom }]}>
            Neural Engine Active
          </Text>
        </View>
      </View>
    </View>
  )
})

const s = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sparklesBox: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: spacing.xs,
    // @ts-expect-error — web-only: remove browser focus outline
    outlineStyle: "none",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 0,
  },
  iconBtn: {
    padding: spacing.sm,
    borderRadius: radii.md,
    opacity: 0.6,
  },
  processBtn: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.xs,
    flexShrink: 0,
  },
  processBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  processBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  hintsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
  hintLabel: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  hintRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
})
