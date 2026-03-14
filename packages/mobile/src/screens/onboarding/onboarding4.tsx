// packages/mobile/src/screens/onboarding/onboarding4.tsx
import React from "react"
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { ArrowLeft, CheckCircle, Calendar as CalendarIcon, Mail } from "lucide-react-native"
import type { OnboardingScreenProps } from "../../navigation/types"
import { useColors } from "../../theme"
import { GoogleLogo } from "../../components/google-logo"
import { completeOnboarding } from "../../navigation/root-navigator"
import { FadeInView } from "../../components/fade-in-view"

export function Onboarding4() {
  const colors = useColors()
  const navigation = useNavigation<OnboardingScreenProps<"Onboarding4">["navigation"]>()

  const handleComplete = async () => {
    await completeOnboarding()
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      {/* Background glow */}
      <View style={[s.glowTop, { backgroundColor: colors.brandFrom }]} />
      <View style={[s.glowBottomLeft, { backgroundColor: colors.brandFrom }]} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerLabel, { color: colors.textPrimary }]}>Step 3 of 3</Text>
      </View>

      {/* Main content */}
      <ScrollView contentContainerStyle={s.mainContent}>
        {/* CheckCircle icon with glow */}
        <FadeInView delay={0} duration={500}>
          <View style={s.iconArea}>
            <View style={[s.iconGlow, { backgroundColor: colors.brandFrom }]} />
            <View style={[s.iconCircle, { backgroundColor: colors.brandFrom + "1A", borderColor: colors.brandFrom + "4D" }]}>
              <CheckCircle size={48} color={colors.brandFrom} />
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={200}>
          <Text style={[s.title, { color: colors.textPrimary }]}>You're all set!</Text>
          <Text style={[s.subtitle, { color: colors.textTertiary }]}>
            Your account has been created. Connect your calendar to start synchronizing your schedule.
          </Text>
        </FadeInView>

        {/* Calendar card */}
        <FadeInView delay={400} duration={600}>
          <View style={[s.calendarCard, { backgroundColor: colors.card + "0D", borderColor: colors.border }]}>
            <View style={s.calendarImageArea}>
              <Image
                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSJLo5XjV9qBXgEZa4tiVFBq2vhT3dBpM4jGxumZNqa6S3eb6kIPfyBKiJ6_nB-I2sDxFBClSc5RgPqLJau7P3c33KbsKNr02qpCiOjq-SrBfbFuUYrm8mfwA0YdZFLSdJ0sTfCPT__oSU2T_Jtj3GB5nKlLMztP_7OYgmfagNimV355uiigMZCFrNjnI1FAuWS9H0XXbWKXu2CTySsqYWfyxmLJapkdnhuOhGkyyxEAqO9jgZ_IKY8-ePYtf0vGiI5sV1a3yPSFE" }}
                style={s.calendarImage}
                resizeMode="cover"
              />
              <View style={s.calendarIconOverlay}>
                <View style={[s.calendarIconBg, { borderColor: "rgba(255,255,255,0.1)" }]}>
                  <CalendarIcon size={32} color="#FFFFFF" />
                </View>
              </View>
            </View>

            <View style={s.calendarTextArea}>
              <Text style={[s.calendarTitle, { color: colors.textPrimary }]}>Sync your schedule</Text>
              <Text style={[s.calendarDesc, { color: colors.textTertiary }]}>Keep track of all your appointments in one place and avoid double-booking.</Text>
            </View>

            <TouchableOpacity
              style={[s.connectButton, { backgroundColor: colors.brandFrom, shadowColor: colors.brandFrom }]}
              onPress={handleComplete}
              activeOpacity={0.8}
            >
              <CalendarIcon size={20} color="#FFFFFF" />
              <Text style={s.connectText}>Connect Google Calendar</Text>
            </TouchableOpacity>
          </View>
        </FadeInView>

        {/* Login section */}
        <FadeInView delay={650}>
          <View style={s.loginSection}>
            <View style={s.dividerRow}>
              <View style={[s.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[s.dividerText, { color: colors.textMuted }]}>or sign in to continue</Text>
              <View style={[s.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <TouchableOpacity
              style={[s.authButton, { backgroundColor: colors.card + "0D", borderColor: colors.border }]}
              onPress={handleComplete}
              activeOpacity={0.7}
            >
              <GoogleLogo size={20} />
              <Text style={[s.authButtonText, { color: colors.textPrimary }]}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.authButton, { backgroundColor: colors.card + "0D", borderColor: colors.border }]}
              onPress={handleComplete}
              activeOpacity={0.7}
            >
              <Mail size={20} color={colors.textPrimary} />
              <Text style={[s.authButtonText, { color: colors.textPrimary }]}>Continue with Email</Text>
            </TouchableOpacity>
          </View>
        </FadeInView>

        <FadeInView delay={800}>
          <TouchableOpacity onPress={handleComplete} style={s.skipBtn} activeOpacity={0.7}>
            <Text style={[s.skipText, { color: colors.textTertiary }]}>Skip for now</Text>
          </TouchableOpacity>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  glowTop: { position: "absolute", top: "-20%", left: "25%", width: 256, height: 256, borderRadius: 128, opacity: 0.15 },
  glowBottomLeft: { position: "absolute", bottom: "-10%", left: "-10%", width: 320, height: 320, borderRadius: 160, opacity: 0.08 },
  // p-4 flex-row justify-between
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16 },
  backBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  // text-xs opacity-60 uppercase tracking-widest — flex-1 text-center pr-12
  headerLabel: { flex: 1, textAlign: "center", paddingRight: 48, fontSize: 12, fontWeight: "700", opacity: 0.6, textTransform: "uppercase", letterSpacing: 1.6 },
  // flex-1 flex-col px-6 pt-8 pb-12 items-center text-center
  mainContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, alignItems: "center", paddingBottom: 24 },
  // mb-10 relative
  iconArea: { marginBottom: 40, alignItems: "center", justifyContent: "center" },
  // absolute -inset-4 blur-3xl rounded-full opacity-50
  iconGlow: { position: "absolute", width: 128, height: 128, borderRadius: 64, opacity: 0.2 },
  // w-24 h-24 (96x96) rounded-full bg-primary/10 border border-primary/30
  iconCircle: { width: 96, height: 96, borderRadius: 48, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  // text-4xl font-bold leading-tight mb-4
  title: { fontSize: 36, fontWeight: "700", lineHeight: 45, marginBottom: 16, textAlign: "center" },
  // text-base text-slate-400 font-normal leading-relaxed max-w-xs
  subtitle: { fontSize: 16, fontWeight: "400", lineHeight: 26, maxWidth: 320, textAlign: "center" },
  // mt-12 w-full max-w-sm bg-white/5 border border-white/10 rounded-xl p-6 gap-6
  calendarCard: { marginTop: 48, width: "100%", maxWidth: 380, borderRadius: 12, padding: 24, gap: 24, borderWidth: 1 },
  // w-full aspect-video rounded-lg overflow-hidden
  calendarImageArea: { width: "100%", aspectRatio: 16 / 9, borderRadius: 8, overflow: "hidden" },
  calendarImage: { width: "100%", height: "100%" },
  // absolute inset-0 flex items-center justify-center
  calendarIconOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  // bg-[#121220]/60 p-3 rounded-full border border-white/10
  calendarIconBg: { backgroundColor: "rgba(18,18,32,0.6)", padding: 12, borderRadius: 9999, borderWidth: 1 },
  // flex-col items-center gap-2
  calendarTextArea: { alignItems: "center", gap: 8 },
  // text-lg font-bold
  calendarTitle: { fontSize: 18, fontWeight: "700" },
  // text-sm text-slate-400 leading-normal text-center
  calendarDesc: { fontSize: 14, lineHeight: 21, textAlign: "center" },
  // w-full flex-row items-center justify-center gap-3 rounded-lg h-14 px-6 bg-primary shadow-lg
  connectButton: {
    width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12,
    height: 56, borderRadius: 8, paddingHorizontal: 24,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  // text-base font-bold
  connectText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  // Login section
  loginSection: { width: "100%", maxWidth: 380, marginTop: 24, gap: 12 },
  // Divider: line — text — line
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  dividerLine: { flex: 1, height: 1 },
  // text-xs font-mono text-slate-500 uppercase tracking-widest
  dividerText: { fontSize: 12, fontWeight: "500", letterSpacing: 0.5 },
  // Auth button: h-14 (56px) rounded-lg border flex-row gap-3
  authButton: {
    width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12,
    height: 56, borderRadius: 8, borderWidth: 1, paddingHorizontal: 24,
  },
  // text-base font-medium text-slate-100
  authButtonText: { fontSize: 16, fontWeight: "500" },
  // mt-auto pt-8 h-12 text-slate-400 font-medium
  skipBtn: { paddingTop: 16, paddingBottom: 24, height: 48, justifyContent: "center" },
  skipText: { fontSize: 16, fontWeight: "500", textAlign: "center" },
})
