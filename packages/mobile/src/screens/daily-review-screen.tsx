import React, { useState, useRef, useCallback } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Check, X, Clock, ArrowRight } from "lucide-react-native"
import { useColors } from "../theme"

const mono = Platform.select({
  ios: { fontFamily: "Menlo" as const },
  android: { fontFamily: "monospace" as const },
})

export function DailyReviewScreen() {
  const colors = useColors()
  const [isCompleted, setIsCompleted] = useState(false)

  // Animated values for check icon
  const scaleAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  const handleAccept = useCallback(() => {
    setIsCompleted(true)
    // scale 1 -> 1.3 -> 1, rotate 0 -> -10 -> 10 -> 0
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start()
  }, [scaleAnim, rotateAnim])

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-10, 0, 10],
    outputRange: ["-10deg", "0deg", "10deg"],
  })

  // Pulse animation for status dot
  const pulseAnim = useRef(new Animated.Value(1)).current
  React.useEffect(() => {
    if (!isCompleted) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      )
      pulse.start()
      return () => pulse.stop()
    }
  }, [isCompleted, pulseAnim])

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scrollContent}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={[s.headerTitle, { color: colors.foreground }]}>Daily Review</Text>
            <Text style={[s.headerSubtitle]}>3 items need your attention</Text>
          </View>
          <View
            style={[
              s.timeBlockBadge,
              {
                backgroundColor: colors.brandFrom + "1A", // primary/10
                borderColor: colors.brandFrom + "33", // primary/20
              },
            ]}
          >
            <Text style={[s.timeBlockText, { color: colors.brandFrom }]}>12:45 Time Block</Text>
          </View>
        </View>

        {/* Cards container */}
        <View style={s.cardsContainer}>
          {/* Main Card */}
          <View
            style={[
              s.mainCard,
              {
                backgroundColor: "#18181B66", // bg-surface/40
                borderColor: isCompleted ? colors.brandFrom + "80" : "#27272A80", // border-primary/50 : border-border/50
              },
              isCompleted && {
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.1,
                shadowRadius: 30,
                elevation: 4,
              },
            ]}
          >
            {/* Status row */}
            <View style={s.statusRow}>
              <View style={s.statusLeft}>
                <Animated.View
                  style={[
                    s.statusDot,
                    { backgroundColor: colors.brandFrom },
                    !isCompleted && { opacity: pulseAnim },
                  ]}
                />
                <Text style={[s.statusLabel, { color: colors.brandFrom }]}>Pending Task</Text>
              </View>
              <View style={s.captureTimeRow}>
                <Clock size={12} color="#64748B" />
                <Text style={s.captureTimeText}>Captured 2h ago</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={[s.cardTitle, { color: colors.foreground }]}>
              Review Q3 Marketing Assets
            </Text>

            {/* Quote block */}
            <View
              style={[
                s.quoteBlock,
                {
                  backgroundColor: "#09090B66", // bg-bg/40
                  borderLeftColor: colors.brandFrom + "66", // border-primary/40
                },
              ]}
            >
              <Text style={s.quoteText}>
                &ldquo;Need to go over the new ad creatives for Q3 before the meeting tomorrow at
                2pm.&rdquo;
              </Text>
            </View>

            {/* Action buttons */}
            <View style={s.actionsRow}>
              <TouchableOpacity
                style={[
                  s.discardButton,
                  {
                    backgroundColor: "#18181B", // bg-surface
                    borderColor: "#27272A", // border-border
                  },
                ]}
                activeOpacity={0.7}
              >
                <X size={16} color={colors.foreground} />
                <Text style={[s.discardText, { color: colors.foreground }]} numberOfLines={1}>
                  Discard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAccept}
                style={[
                  s.acceptButton,
                  {
                    backgroundColor: isCompleted ? "#059669" : colors.brandFrom, // emerald-600 : primary
                    shadowColor: isCompleted ? "#059669" : "#10B981",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 4,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={{
                    transform: [{ scale: scaleAnim }, { rotate: rotateInterpolate }],
                  }}
                >
                  <Check size={16} color="#FFFFFF" />
                </Animated.View>
                <Text style={s.acceptText} numberOfLines={1}>
                  {isCompleted ? "Scheduled" : "Accept & Schedule"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Secondary Card (opacity-60) */}
          <View
            style={[
              s.secondaryCard,
              {
                backgroundColor: "#18181B66", // bg-surface/40
                borderColor: "#27272A80", // border-border/50
              },
            ]}
          >
            {/* Status row */}
            <View style={s.statusRow}>
              <View style={s.statusLeft}>
                <View style={[s.statusDot, { backgroundColor: "#64748B" }]} />
                <Text style={[s.statusLabel, { color: "#94A3B8" }]}>Knowledge Node</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={[s.secondaryTitle, { color: "#94A3B8" }]}>
              React Server Components Architecture
            </Text>

            {/* Description */}
            <Text style={s.secondaryDesc} numberOfLines={1}>
              &ldquo;RSCs allow components to render exclusively on the server...&rdquo;
            </Text>

            {/* Review Next link */}
            <TouchableOpacity style={s.reviewNextRow} activeOpacity={0.7}>
              <Text style={s.reviewNextText}>Review Next</Text>
              <ArrowRight size={14} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16, // p-4
    paddingBottom: 48,
    gap: 32, // space-y-8
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 24, // text-2xl
    fontWeight: "700", // font-bold
    letterSpacing: -0.6, // tracking-tight ~ -0.025 * 24
    marginBottom: 4, // mb-1
  },
  headerSubtitle: {
    fontSize: 14, // text-sm
    color: "#94A3B8", // text-slate-400
  },
  timeBlockBadge: {
    paddingHorizontal: 12, // px-3
    paddingVertical: 6, // py-1.5
    borderRadius: 8, // rounded-lg
    borderWidth: 1,
  },
  timeBlockText: {
    fontSize: 14, // text-sm
    fontWeight: "700", // font-bold
  },

  // Cards container
  cardsContainer: {
    gap: 24, // space-y-6
  },

  // Main Card
  mainCard: {
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    padding: 24, // p-6
  },

  // Status row
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16, // mb-4
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // gap-2
  },
  statusDot: {
    width: 8, // size-2
    height: 8,
    borderRadius: 9999, // rounded-full
  },
  statusLabel: {
    fontSize: 10, // text-[10px]
    fontWeight: "700", // font-bold
    textTransform: "uppercase",
    letterSpacing: 1.6, // tracking-widest
  },

  // Capture time
  captureTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // gap-1
  },
  captureTimeText: {
    fontSize: 10, // text-[10px]
    color: "#64748B", // text-slate-500
    ...mono,
  },

  // Card title
  cardTitle: {
    fontSize: 20, // text-xl
    fontWeight: "700", // font-bold
    marginBottom: 16, // mb-4
  },

  // Quote block
  quoteBlock: {
    borderRadius: 12, // rounded-xl
    padding: 16, // p-4
    borderLeftWidth: 4, // border-l-4
    marginBottom: 24, // mb-6
  },
  quoteText: {
    fontSize: 14, // text-sm
    color: "#94A3B8", // text-slate-400
    fontStyle: "italic",
  },

  // Action buttons
  actionsRow: {
    flexDirection: "row",
    gap: 16, // gap-4
  },
  discardButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8, // gap-2
    paddingVertical: 12, // py-3
    borderRadius: 12, // rounded-xl
    borderWidth: 1,
  },
  discardText: {
    fontWeight: "500", // font-medium
    fontSize: 14, // text-sm
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8, // gap-2
    paddingVertical: 12, // py-3
    paddingHorizontal: 8, // px-2
    borderRadius: 12, // rounded-xl
  },
  acceptText: {
    color: "#FFFFFF", // text-white
    fontWeight: "500", // font-medium
    fontSize: 14, // text-sm
  },

  // Secondary Card
  secondaryCard: {
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    padding: 24, // p-6
    opacity: 0.6, // opacity-60
  },

  // Secondary title
  secondaryTitle: {
    fontSize: 18, // text-lg
    fontWeight: "700", // font-bold
    marginBottom: 8, // mb-2
  },

  // Secondary description
  secondaryDesc: {
    fontSize: 14, // text-sm
    color: "#64748B", // text-slate-500
    marginBottom: 16, // mb-4
  },

  // Review Next
  reviewNextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // gap-1
  },
  reviewNextText: {
    fontSize: 12, // text-xs
    fontWeight: "700", // font-bold
    color: "#64748B", // text-slate-500
  },
})
