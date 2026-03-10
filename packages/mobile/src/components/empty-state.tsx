import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { useColors, spacing, typography } from "../theme"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  const colors = useColors()

  return (
    <View style={s.container}>
      {icon && <View style={s.icon}>{icon}</View>}
      <Text style={[s.title, { color: colors.mutedForeground }]}>{title}</Text>
      {subtitle && (
        <Text style={[s.subtitle, { color: colors.mutedForeground }]}>
          {subtitle}
        </Text>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["5xl"],
    paddingHorizontal: spacing["2xl"],
  },
  icon: {
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  title: {
    ...typography.body,
    textAlign: "center",
  },
  subtitle: {
    ...typography.caption,
    textAlign: "center",
    marginTop: spacing.xs,
  },
})
