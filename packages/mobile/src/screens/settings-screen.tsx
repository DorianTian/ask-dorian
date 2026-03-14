import React from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  Moon,
  Bell,
  Globe,
  Shield,
  Smartphone,
  LogOut,
  ChevronRight,
} from "lucide-react-native"
import type { LucideIcon } from "lucide-react-native"
import { useColors } from "../theme"
import { resetOnboarding } from "../navigation/root-navigator"

const AVATAR_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAMA7CiP9klxIz3dV5xzV0_iYMNS6BAM1aPJUmtc2gJcTyCAS5Udj1injSqRuPtW1C-A214P-3Xhzz1n8PuhrZ-U1R9Z10nl2m-hPVJLke4Kv6D7bpV6XKTXLQ-4QKIGNueQaGVWhP8-aRxZlc-qH3E5ApWAUYAHB8NHT9pYhh1SqaVxGSM8DG9yQMULQL2cGNVDPGZEdtotqrk7AbqD6c3GW0PfATjqplX5534qj-u1VgZQciQwR5aQmvpxa3Qv_ZI0Bo5UJgEJS8"

interface SettingsRowProps {
  icon: LucideIcon
  label: string
  value?: string
  showBorder?: boolean
}

function SettingsRow({ icon: Icon, label, value, showBorder = true }: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={[
        s.settingsRow,
        showBorder && s.settingsRowBorder,
      ]}
      activeOpacity={0.7}
    >
      <View style={s.settingsRowLeft}>
        <View style={s.iconContainer}>
          <Icon size={18} color="#94A3B8" />
        </View>
        <Text style={s.rowLabel}>{label}</Text>
      </View>
      <View style={s.settingsRowRight}>
        {value && <Text style={s.rowValue}>{value}</Text>}
        <ChevronRight size={16} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  )
}

export function SettingsScreen() {
  const colors = useColors()

  const handleLogOut = async () => {
    await resetOnboarding()
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={[s.headerTitle, { color: colors.foreground }]}>Settings</Text>

        {/* User Card */}
        <View style={s.userCard}>
          <View style={s.avatarContainer}>
            <Image
              source={{ uri: AVATAR_URI }}
              style={s.avatarImage}
              resizeMode="cover"
            />
          </View>
          <View>
            <Text style={[s.userName, { color: colors.foreground }]}>Dorian</Text>
            <Text style={s.userEmail}>dorian@example.com</Text>
            <TouchableOpacity activeOpacity={0.7} style={s.manageAccountBtn}>
              <Text style={[s.manageAccountText, { color: colors.brandFrom }]}>
                Manage Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sections container */}
        <View style={s.sectionsContainer}>
          {/* Preferences Section */}
          <View>
            <Text style={s.sectionHeader}>Preferences</Text>
            <View style={s.sectionCard}>
              <SettingsRow icon={Moon} label="Appearance" value="Dark" showBorder />
              <SettingsRow icon={Bell} label="Notifications" showBorder />
              <SettingsRow icon={Globe} label="Language & Region" showBorder={false} />
            </View>
          </View>

          {/* Privacy & Security Section */}
          <View>
            <Text style={s.sectionHeader}>Privacy & Security</Text>
            <View style={s.sectionCard}>
              <SettingsRow icon={Shield} label="Data Privacy" showBorder />
              <SettingsRow icon={Smartphone} label="Connected Devices" showBorder={false} />
            </View>
          </View>

          {/* Log Out */}
          <View style={s.logoutSection}>
            <TouchableOpacity
              style={s.logoutButton}
              activeOpacity={0.7}
              onPress={handleLogOut}
            >
              <LogOut size={18} color="#EF4444" />
              <Text style={s.logoutText}>Log Out</Text>
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
  headerTitle: {
    fontSize: 30, // text-3xl
    fontWeight: "700", // font-bold
    letterSpacing: -0.75, // tracking-tight ~ -0.025 * 30
    marginBottom: 32, // mb-8
    paddingTop: 12,
  },

  // User Card
  userCard: {
    backgroundColor: "#18181B66", // bg-surface/40
    borderColor: "#27272A80", // border-border/50
    borderWidth: 1,
    borderRadius: 16, // rounded-2xl
    padding: 24, // p-6
    flexDirection: "row", // flex items-center
    alignItems: "center",
    gap: 24, // gap-6
  },

  // Avatar
  avatarContainer: {
    width: 80, // size-20
    height: 80,
    borderRadius: 9999, // rounded-full
    backgroundColor: "#18181B", // bg-surface
    borderWidth: 2, // border-2
    borderColor: "#10B98133", // border-primary/20
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },

  // User info
  userName: {
    fontSize: 20, // text-xl
    fontWeight: "700", // font-bold
  },
  userEmail: {
    fontSize: 14, // text-sm
    color: "#94A3B8", // text-slate-400
    marginTop: 2,
  },
  manageAccountBtn: {
    marginTop: 8, // mt-2
  },
  manageAccountText: {
    fontSize: 12, // text-xs
    fontWeight: "700", // font-bold
    textTransform: "uppercase",
    letterSpacing: 1.6, // tracking-widest
  },

  // Sections container
  sectionsContainer: {
    gap: 24, // space-y-6
  },

  // Section header
  sectionHeader: {
    fontSize: 12, // text-xs
    fontWeight: "700", // font-bold
    textTransform: "uppercase",
    letterSpacing: 1.6, // tracking-widest
    color: "#64748B", // text-slate-500
    marginBottom: 12, // mb-3
    paddingHorizontal: 8, // px-2
  },

  // Section card (group)
  sectionCard: {
    backgroundColor: "#18181B66", // bg-surface/40
    borderColor: "#27272A80", // border-border/50
    borderWidth: 1,
    borderRadius: 16, // rounded-2xl
    overflow: "hidden",
  },

  // Settings row
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16, // p-4
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#27272A80", // border-border/50
  },
  settingsRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12, // gap-3
  },
  iconContainer: {
    padding: 8, // p-2
    backgroundColor: "#18181B", // bg-surface
    borderRadius: 8, // rounded-lg
  },
  rowLabel: {
    fontSize: 16, // text-base (font-medium)
    fontWeight: "500",
    color: "#F8FAFC", // foreground (dark theme default)
  },
  settingsRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // gap-2
  },
  rowValue: {
    fontSize: 14, // text-sm
    color: "#94A3B8", // text-slate-400
  },

  // Log Out
  logoutSection: {
    paddingTop: 16, // pt-4
  },
  logoutButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8, // gap-2
    padding: 16, // p-4
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    borderColor: "#EF444433", // border-red-500/20
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700", // font-bold
    color: "#EF4444", // text-red-500
  },
})
