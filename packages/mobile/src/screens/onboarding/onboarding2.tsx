// packages/mobile/src/screens/onboarding/onboarding2.tsx
import React from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { ArrowRight, X, Diamond } from "lucide-react-native"
import type { OnboardingScreenProps } from "../../navigation/types"
import { useColors } from "../../theme"
import { completeOnboarding } from "../../navigation/root-navigator"

export function Onboarding2() {
  const colors = useColors()
  const navigation = useNavigation<OnboardingScreenProps<"Onboarding2">["navigation"]>()

  const handleSkip = async () => {
    await completeOnboarding()
    // Navigation will auto-switch via RootNavigator state
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      {/* Background glow */}
      <View style={[s.glowTopRight, { backgroundColor: colors.brandFrom }]} />
      <View style={[s.glowBottomLeft, { backgroundColor: colors.brandFrom }]} />

      {/* Header — X skip + title */}
      <View style={s.header}>
        <TouchableOpacity onPress={handleSkip} style={s.closeBtn} activeOpacity={0.7}>
          <X size={24} color="#94A3B8" />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: "#F1F5F9" }]}>Ask Dorian</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Hero — square image area with Diamond icon */}
      <View style={s.heroArea}>
        <View style={[s.heroSquare, { borderColor: colors.brandFrom + "33" }]}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800" }}
            style={s.heroImage}
            resizeMode="cover"
          />
          {/* Diamond icon overlay — w-32 h-32 rounded-full bg-primary/20 border border-primary/30 */}
          <View style={[s.diamondCircle, { backgroundColor: colors.brandFrom + "33", borderColor: colors.brandFrom + "4D" }]}>
            <Diamond size={48} color={colors.brandFrom} strokeWidth={1.5} />
          </View>
        </View>
      </View>

      {/* Bottom content */}
      <View style={s.bottomContent}>
        {/* Title — text-3xl font-bold leading-tight mb-4 tracking-tight */}
        <Text style={[s.title, { color: "#F1F5F9" }]}>Fragment-First Philosophy</Text>

        {/* Subtitle — text-lg text-slate-400 font-normal leading-relaxed mb-10 max-w-[280px] */}
        <Text style={s.subtitle}>
          Stop losing fragments. Our system{" "}
          <Text style={{ color: colors.brandFrom, fontWeight: "500" }}>auto-converts</Text>
          {" "}every thought into immediate action.
        </Text>

        {/* Progress dots — 4 dots, 2nd is active bar */}
        <View style={s.progressDots}>
          <View style={[s.progressDotSmall, { backgroundColor: colors.brandFrom + "33" }]} />
          <View style={[s.progressBar, { backgroundColor: colors.brandFrom }]} />
          <View style={[s.progressDotSmall, { backgroundColor: colors.brandFrom + "33" }]} />
          <View style={[s.progressDotSmall, { backgroundColor: colors.brandFrom + "33" }]} />
        </View>

        {/* Continue button */}
        <TouchableOpacity
          style={[s.ctaButton, { backgroundColor: colors.brandFrom }]}
          onPress={() => navigation.navigate("Onboarding3")}
          activeOpacity={0.8}
        >
          <Text style={s.ctaText}>Continue</Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Skip button */}
        <TouchableOpacity onPress={handleSkip} style={s.skipBtn} activeOpacity={0.7}>
          <Text style={s.skipText}>Skip Intro</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  glowTopRight: { position: "absolute", top: "-10%", right: "-10%", width: 256, height: 256, borderRadius: 128, opacity: 0.15 },
  glowBottomLeft: { position: "absolute", bottom: "-5%", left: "-5%", width: 320, height: 320, borderRadius: 160, opacity: 0.05 },
  // flex items-center p-4 justify-between
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16 },
  closeBtn: { padding: 8 },
  // text-lg font-bold tracking-tight
  headerTitle: { fontSize: 18, fontWeight: "700", letterSpacing: -0.45 },
  // px-6 py-4 flex-grow flex-col justify-center
  heroArea: { flex: 1, paddingHorizontal: 24, paddingVertical: 16, justifyContent: "center", alignItems: "center" },
  // w-full aspect-square rounded-3xl overflow-hidden border border-primary/20
  heroSquare: { width: "100%", aspectRatio: 1, borderRadius: 24, overflow: "hidden", borderWidth: 1, alignItems: "center", justifyContent: "center" },
  heroImage: { ...StyleSheet.absoluteFillObject, opacity: 0.4 },
  // w-32 h-32 (128x128) rounded-full bg-primary/20 border border-primary/30
  diamondCircle: { width: 128, height: 128, borderRadius: 64, borderWidth: 1, alignItems: "center", justifyContent: "center", zIndex: 10 },
  // px-8 pb-safe flex-col items-center text-center
  bottomContent: { paddingHorizontal: 32, alignItems: "center" },
  // text-3xl font-bold leading-tight mb-4 tracking-tight
  title: { fontSize: 30, fontWeight: "700", lineHeight: 37.5, marginBottom: 16, letterSpacing: -0.75, textAlign: "center" },
  // text-lg text-slate-400 font-normal leading-relaxed mb-10 max-w-[280px]
  subtitle: { fontSize: 18, color: "#94A3B8", fontWeight: "400", lineHeight: 29.25, marginBottom: 40, maxWidth: 280, textAlign: "center" },
  // flex gap-2.5 mb-10
  progressDots: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 40 },
  // h-1.5 w-1.5 (6x6)
  progressDotSmall: { width: 6, height: 6, borderRadius: 3 },
  // h-1.5 w-8 (32x6)
  progressBar: { width: 32, height: 6, borderRadius: 3 },
  // w-full bg-primary py-4 px-6 rounded-xl shadow-lg
  ctaButton: {
    width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12,
    shadowColor: "#10B981", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  ctaText: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
  // mt-4 text-slate-500 font-medium text-sm uppercase tracking-widest
  skipBtn: { marginTop: 16, paddingVertical: 8, marginBottom: 24 },
  skipText: { color: "#64748B", fontWeight: "500", fontSize: 14, textTransform: "uppercase", letterSpacing: 1.6 },
})
