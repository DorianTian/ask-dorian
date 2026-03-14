// packages/mobile/src/screens/onboarding/onboarding3.tsx
import React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { ArrowLeft, ArrowRight, BrainCircuit, Calendar, User, CheckCircle2 } from "lucide-react-native"
import type { OnboardingScreenProps } from "../../navigation/types"
import { useColors } from "../../theme"
import { completeOnboarding } from "../../navigation/root-navigator"
import { FadeInView } from "../../components/fade-in-view"

const mono = Platform.select({ ios: { fontFamily: "Menlo" as const }, android: { fontFamily: "monospace" as const } })

export function Onboarding3() {
  const colors = useColors()
  const navigation = useNavigation<OnboardingScreenProps<"Onboarding3">["navigation"]>()

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      {/* Header — back + title */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.textPrimary }]}>First Value</Text>
      </View>

      {/* Progress dots — 3rd active */}
      <View style={s.progressDots}>
        <View style={[s.progressDotSmall, { backgroundColor: colors.brandFrom + "33" }]} />
        <View style={[s.progressDotSmall, { backgroundColor: colors.brandFrom + "33" }]} />
        <View style={[s.progressBar, { backgroundColor: colors.brandFrom }]} />
      </View>

      {/* Title area — px-6 text-center */}
      <FadeInView delay={0} duration={500} style={s.titleArea}>
        <Text style={[s.title, { color: colors.textPrimary }]}>Magic Processing</Text>
        <Text style={[s.titleDesc, { color: colors.textTertiary }]}>See how we turn messy notes into organized tasks in seconds.</Text>
      </FadeInView>

      {/* Demo card — mx-6 p-6 rounded-xl bg-primary/5 border border-primary/20 */}
      <FadeInView delay={250} duration={600}>
        <View style={[s.demoCard, { backgroundColor: colors.brandFrom + "0D", borderColor: colors.brandFrom + "33" }]}>
          <View style={[s.cardGlowBottom, { backgroundColor: colors.brandFrom }]} />
          <View style={[s.cardGlowTop, { backgroundColor: colors.brandFrom }]} />

          <View style={s.inputSection}>
            <Text style={[s.sectionLabel, { color: colors.brandFrom }]}>Input Note</Text>
            <View style={[s.inputCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderLight }]}>
              <Text style={[s.inputText, { color: colors.textSecondary }]}>"Meeting with Sarah at 4pm about UI"</Text>
            </View>
          </View>

          <View style={s.aiIndicator}>
            <View style={[s.aiLine, { backgroundColor: colors.brandFrom }]} />
            <View style={[s.aiPill, { backgroundColor: colors.brandFrom + "1A", borderColor: colors.brandFrom + "4D" }]}>
              <BrainCircuit size={16} color={colors.brandFrom} />
              <Text style={[s.aiText, { color: colors.brandFrom }]}>AI is thinking...</Text>
            </View>
            <View style={[s.aiLine, { backgroundColor: colors.brandFrom }]} />
          </View>

          <View style={s.outputSection}>
            <Text style={[s.sectionLabel, { color: colors.brandFrom }]}>Structured Task</Text>
            <View style={[s.outputCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderLight, borderLeftColor: colors.brandFrom }]}>
              <View style={s.outputHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.outputTitle, { color: colors.textPrimary }]}>UI Review Meeting</Text>
                  <View style={s.outputDetail}>
                    <Calendar size={12} color={colors.textTertiary} />
                    <Text style={[s.outputDetailText, { color: colors.textTertiary }]}>Today, 4:00 PM</Text>
                  </View>
                  <View style={s.outputDetail}>
                    <User size={12} color={colors.textTertiary} />
                    <Text style={[s.outputDetailText, { color: colors.textTertiary }]}>Sarah</Text>
                  </View>
                </View>
                <View style={[s.checkBadge, { backgroundColor: colors.brandFrom + "1A" }]}>
                  <CheckCircle2 size={16} color={colors.brandFrom} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </FadeInView>

      {/* Bottom buttons */}
      <FadeInView delay={600} style={s.bottomButtons}>
        <TouchableOpacity
          style={[s.ctaButton, { backgroundColor: colors.brandFrom, shadowColor: colors.brandFrom }]}
          onPress={() => navigation.navigate("Onboarding4")}
          activeOpacity={0.8}
        >
          <Text style={s.ctaText}>Continue</Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => { await completeOnboarding() }}
          style={s.skipBtn}
          activeOpacity={0.7}
        >
          <Text style={[s.skipText, { color: colors.textTertiary }]}>Skip for now</Text>
        </TouchableOpacity>
      </FadeInView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  // p-4 pb-2
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  backBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  // text-lg font-bold tracking-tight flex-1 text-center pr-12
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700", letterSpacing: -0.45, paddingRight: 48 },
  // flex-row items-center justify-center gap-3 py-5
  progressDots: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 20 },
  progressDotSmall: { width: 8, height: 8, borderRadius: 4 },
  progressBar: { width: 32, height: 8, borderRadius: 4 },
  // px-6 text-center
  titleArea: { paddingHorizontal: 24, alignItems: "center" },
  // text-2xl font-bold leading-tight pb-2 pt-5
  title: { fontSize: 24, fontWeight: "700", lineHeight: 30, paddingBottom: 8, paddingTop: 20, textAlign: "center" },
  // text-base text-slate-400 font-normal leading-normal pb-6
  titleDesc: { fontSize: 16, fontWeight: "400", lineHeight: 24, paddingBottom: 24, textAlign: "center" },
  // mx-6 p-6 rounded-xl overflow-hidden
  demoCard: { marginHorizontal: 24, padding: 24, borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  // absolute -bottom-12 -right-12 w-32 h-32 opacity-20
  cardGlowBottom: { position: "absolute", bottom: -48, right: -48, width: 128, height: 128, borderRadius: 64, opacity: 0.2 },
  cardGlowTop: { position: "absolute", top: -48, left: -48, width: 128, height: 128, borderRadius: 64, opacity: 0.1 },
  // mb-8
  inputSection: { marginBottom: 32 },
  // text-xs font-bold tracking-widest uppercase mb-3
  sectionLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 12 },
  // bg-slate-800 p-4 rounded-lg border border-slate-700
  inputCard: { padding: 16, borderRadius: 8, borderWidth: 1 },
  // italic
  inputText: { fontStyle: "italic", fontSize: 14 },
  // flex-col items-center justify-center py-4
  aiIndicator: { alignItems: "center", paddingVertical: 16 },
  // w-px h-8 — vertical line
  aiLine: { width: 1, height: 32, opacity: 0.5 },
  // flex-row items-center gap-2 px-4 py-2 rounded-full border
  aiPill: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, borderWidth: 1, marginVertical: 8 },
  // text-xs font-medium
  aiText: { fontSize: 12, fontWeight: "500" },
  // mt-4
  outputSection: { marginTop: 16 },
  // p-4 rounded-lg border border-slate-700 border-l-4 border-l-primary
  outputCard: { padding: 16, borderRadius: 8, borderWidth: 1, borderLeftWidth: 4 },
  // flex-row items-start justify-between
  outputHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  // text-base font-bold
  outputTitle: { fontSize: 16, fontWeight: "700" },
  // flex-row items-center gap-2 mt-2
  outputDetail: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  // text-xs text-slate-400
  outputDetailText: { fontSize: 12 },
  // bg-primary/10 p-1 rounded
  checkBadge: { padding: 4, borderRadius: 4 },
  // mt-auto p-6 pb-safe gap-4
  bottomButtons: { marginTop: "auto", padding: 24, gap: 16 },
  // w-full bg-primary py-4 rounded-xl shadow-lg flex-row items-center justify-center gap-2
  ctaButton: {
    width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 16, borderRadius: 12,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  ctaText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  // text-slate-400 font-medium py-2 text-sm text-center
  skipBtn: { alignItems: "center", paddingVertical: 8 },
  skipText: { fontWeight: "500", fontSize: 14 },
})
