// packages/mobile/src/screens/onboarding/onboarding1.tsx
import React from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import type { OnboardingScreenProps } from "../../navigation/types"
import { useColors } from "../../theme"
import { FadeInView } from "../../components/fade-in-view"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

export function Onboarding1() {
  const colors = useColors()
  const navigation = useNavigation<OnboardingScreenProps<"Onboarding1">["navigation"]>()

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      {/* Glow circles — simulating radial-gradient with large translucent Views */}
      <View style={[s.glowTopRight, { backgroundColor: colors.brandFrom + "1A" }]} />
      <View style={[s.glowBottomLeft, { backgroundColor: colors.brandFrom + "0D" }]} />

      {/* Hero image area */}
      <FadeInView delay={0} duration={600} style={s.heroArea}>
        <View style={s.heroImageContainer}>
          <Image
            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBV7YHrBhDXl_g_PzH72vJlg0WiQdvfJ597Q9MMQIwnmpeSQjoWi53y2Vg_lNLwSPgYDvtY_YjxqUmyWv0Tn23iz6scMCUr_B1KV-2duHZpBvjrKpwKS38oOPb_b67gLo1k5VqXKAVw3ymksFwNuRDykRM0dtGMc3_AAc_grrJ4LHEA4IaX_BapAG7dttm9rXKvifQRtDOiFyZJrgld72Vi7ynm_Ymy6gShNwIiuiXMqWS3cel1mtXZ0TK4dBNRdJIoexebuV94AzU" }}
            style={s.heroImage}
            resizeMode="cover"
          />
        </View>
      </FadeInView>

      {/* Bottom content */}
      <View style={s.bottomContent}>
        <FadeInView delay={200}>
          <View style={[s.stepBadge, { backgroundColor: colors.brandFrom + "1A", borderColor: colors.brandFrom + "33" }]}>
            <Text style={[s.stepBadgeText, { color: colors.brandFrom }]}>Step 01</Text>
          </View>
        </FadeInView>

        <FadeInView delay={350}>
          <Text style={[s.title, { color: colors.foreground }]}>Ask Dorian.</Text>
        </FadeInView>

        <FadeInView delay={500}>
          <Text style={[s.subtitle, { color: colors.textTertiary }]}>
            Stop losing{" "}
            <Text style={{ color: colors.brandFrom, fontWeight: "500" }}>fragments</Text>
            {" "}of your brilliance.
          </Text>
        </FadeInView>

        <FadeInView delay={650}>
          <Text style={[s.description, { color: colors.textMuted }]}>
            Every thought, captured and crystallized into a structured knowledge base. Your second brain, refined.
          </Text>
        </FadeInView>

        <FadeInView delay={800}>
          <TouchableOpacity
            style={[s.ctaButton, { backgroundColor: colors.brandFrom, shadowColor: colors.brandFrom }]}
            onPress={() => navigation.navigate("Onboarding2")}
            activeOpacity={0.8}
          >
            <Text style={s.ctaText}>Get Started</Text>
          </TouchableOpacity>

          <View style={s.progressDots}>
            <View style={[s.progressBar, { backgroundColor: colors.brandFrom }]} />
            <View style={[s.progressDot, { backgroundColor: colors.surfaceHover }]} />
            <View style={[s.progressDot, { backgroundColor: colors.surfaceHover }]} />
          </View>
        </FadeInView>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  // top-[-10%] right-[-10%] w-64 h-64 (256x256) bg-primary/10 rounded-full blur-[100px]
  glowTopRight: {
    position: "absolute",
    top: "-10%",
    right: "-10%",
    width: 256,
    height: 256,
    borderRadius: 128,
    opacity: 0.6,
  },
  // bottom-[-5%] left-[-5%] w-80 h-80 (320x320) bg-primary/5
  glowBottomLeft: {
    position: "absolute",
    bottom: "-5%",
    left: "-5%",
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.6,
  },
  // flex-grow flex items-center justify-center px-12 pt-12
  heroArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 48, // px-12
    paddingTop: 48,
  },
  // w-full aspect-square max-w-[280px]
  heroImageContainer: {
    width: 280,
    height: 280,
    borderRadius: 24, // rounded-3xl
    overflow: "hidden",
  },
  // opacity-40 mix-blend-overlay — we approximate with opacity
  heroImage: {
    width: "100%",
    height: "100%",
    opacity: 0.4,
  },
  // px-8 pb-safe flex-col items-center text-center
  bottomContent: {
    paddingHorizontal: 32, // px-8
    alignItems: "center",
  },
  // px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4
  stepBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    marginBottom: 16,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  // text-4xl font-bold tracking-tight mb-4
  title: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -0.9, // tracking-tight ≈ -0.025 * 36
    marginBottom: 16,
  },
  // text-xl text-slate-400 font-light leading-relaxed max-w-[280px]
  subtitle: {
    fontSize: 20,
    fontWeight: "300",
    lineHeight: 32.5, // 20 * 1.625
    textAlign: "center",
    maxWidth: 280,
  },
  // text-sm text-slate-500 mb-10 max-w-[300px]
  description: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 300,
    marginBottom: 40,
    marginTop: 16,
  },
  // w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 rounded-xl shadow-lg shadow-primary/25
  ctaButton: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // flex items-center justify-center space-x-2 mt-4 mb-8
  progressDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  // w-8 h-1 rounded-full bg-primary
  progressBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  // w-1.5 h-1.5 rounded-full bg-slate-700
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
})
