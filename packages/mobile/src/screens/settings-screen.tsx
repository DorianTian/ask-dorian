import React, { useState } from "react"
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
  ChevronDown,
  Database,
  User,
  Zap,
  ImageIcon,
} from "lucide-react-native"
import type { LucideIcon } from "lucide-react-native"
import { useColors, useTheme } from "../theme"
import { useAuth } from "../providers/auth-provider"
import { useUserSettings } from "@ask-dorian/core/hooks"
import { userApi } from "@ask-dorian/core/api"

// --- Expandable Settings Row ---

interface SettingsRowProps {
  icon: LucideIcon
  label: string
  subtitle?: string
  value?: string
  showBorder?: boolean
  isExpanded?: boolean
  onPress?: () => void
  children?: React.ReactNode
}

function SettingsRow({
  icon: Icon,
  label,
  subtitle,
  value,
  showBorder = true,
  isExpanded,
  onPress,
  children,
}: SettingsRowProps) {
  const colors = useColors()
  return (
    <View>
      <TouchableOpacity
        style={[
          s.settingsRow,
          showBorder && !isExpanded && [s.settingsRowBorder, { borderBottomColor: colors.border + "80" }],
        ]}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <View style={s.settingsRowLeft}>
          <View style={[
            s.iconContainer,
            { backgroundColor: isExpanded ? colors.brandFrom + "1A" : colors.card },
          ]}>
            <Icon size={18} color={isExpanded ? colors.brandFrom : colors.textTertiary} />
          </View>
          <View style={s.rowTextCol}>
            <Text style={[s.rowLabel, { color: colors.foreground }]}>{label}</Text>
            {subtitle && (
              <Text style={[s.rowSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
            )}
          </View>
        </View>
        <View style={s.settingsRowRight}>
          {value && <Text style={[s.rowValue, { color: colors.textTertiary }]}>{value}</Text>}
          {isExpanded ? (
            <ChevronDown size={16} color={colors.brandFrom} />
          ) : (
            <ChevronRight size={16} color={colors.textTertiary} />
          )}
        </View>
      </TouchableOpacity>
      {isExpanded && children && (
        <View style={[
          s.expandedContent,
          { borderBottomColor: colors.border + "80" },
          showBorder && s.settingsRowBorder,
        ]}>
          {children}
        </View>
      )}
    </View>
  )
}

// --- Detail Row (key-value inside expanded content) ---

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  const colors = useColors()
  return (
    <View style={s.detailRow}>
      <Text style={[s.detailLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[s.detailValue, { color: valueColor ?? colors.foreground }]}>{value}</Text>
    </View>
  )
}

// --- Main Screen ---

export function SettingsScreen() {
  const colors = useColors()
  const { mode, setMode } = useTheme()
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const { data: settings, mutate: mutateSettings } = useUserSettings()

  const toggleItem = (id: string) => setExpandedItem((prev) => (prev === id ? null : id))

  const toggleNotification = async (key: string) => {
    const current = (settings?.notificationSettings ?? {}) as Record<string, boolean>
    const updated = { ...current, [key]: !current[key] }
    await userApi.updateSettings({ notificationSettings: updated })
    mutateSettings()
  }

  const changeLanguage = async (lang: string) => {
    await userApi.updateSettings({ language: lang })
    mutateSettings()
  }

  const handleLogOut = async () => {
    await logout()
  }

  const cycleAppearance = () => {
    const next = mode === "dark" ? "light" : mode === "light" ? "system" : "dark"
    setMode(next)
  }

  const appearanceLabel = mode === "system" ? "System" : mode === "dark" ? "Dark" : "Light"

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={[s.headerTitle, { color: colors.foreground }]}>Settings</Text>

        {/* User Card */}
        <View style={[s.userCard, { backgroundColor: colors.card + "66", borderColor: colors.border + "80" }]}>
          <View style={[s.avatarContainer, { backgroundColor: colors.card, borderColor: colors.brandFrom + "33" }]}>
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={s.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={[s.avatarFallback, { color: colors.textTertiary }]}>
                {(user?.name ?? "U")[0].toUpperCase()}
              </Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.userName, { color: colors.foreground }]}>{user?.name ?? "User"}</Text>
            <Text style={[s.userEmail, { color: colors.textTertiary }]}>{user?.email ?? ""}</Text>
            <Text style={[s.memberBadge, { color: colors.brandFrom }]}>
              {user?.role === "pro" ? "PRO MEMBER" : "FREE MEMBER"}
            </Text>
          </View>
        </View>

        {/* Sections container */}
        <View style={s.sectionsContainer}>
          {/* Account & Security */}
          <View>
            <Text style={[s.sectionHeader, { color: colors.textMuted }]}>Account & Security</Text>
            <View style={[s.sectionCard, { backgroundColor: colors.card + "66", borderColor: colors.border + "80" }]}>
              <SettingsRow
                icon={User}
                label="Profile Info"
                subtitle={user?.email ?? ""}
                isExpanded={expandedItem === "profile"}
                onPress={() => toggleItem("profile")}
                showBorder
              >
                <DetailRow label="Name" value={user?.name ?? "—"} />
                <DetailRow label="Email" value={user?.email ?? "—"} />
                <DetailRow label="Timezone" value={user?.timezone ?? "UTC"} />
                <DetailRow label="Locale" value={user?.locale ?? "en"} />
              </SettingsRow>

              <SettingsRow
                icon={Shield}
                label="Security & Privacy"
                subtitle="Two-factor authentication"
                isExpanded={expandedItem === "security"}
                onPress={() => toggleItem("security")}
                showBorder
              >
                <DetailRow label="Two-Factor Auth" value="Active" valueColor={colors.brandFrom} />
                <DetailRow label="Password" value="••••••••" />
                <DetailRow label="Login Sessions" value="1 device" />
                <Text style={[s.phaseNote, { color: colors.textMuted }]}>
                  Password change and 2FA management coming in Phase 2.
                </Text>
              </SettingsRow>

              <SettingsRow
                icon={Zap}
                label="Subscription"
                subtitle="Manage your plan"
                isExpanded={expandedItem === "subscription"}
                onPress={() => toggleItem("subscription")}
                showBorder={false}
              >
                <DetailRow label="Plan" value="Pro" valueColor={colors.brandFrom} />
                <DetailRow label="Price" value="$12/mo" />
                <DetailRow label="Status" value="Active" valueColor="#22C55E" />
                <DetailRow label="Next Billing" value="Apr 14, 2026" />
              </SettingsRow>
            </View>
          </View>

          {/* Preferences */}
          <View>
            <Text style={[s.sectionHeader, { color: colors.textMuted }]}>Preferences</Text>
            <View style={[s.sectionCard, { backgroundColor: colors.card + "66", borderColor: colors.border + "80" }]}>
              <SettingsRow
                icon={Moon}
                label="Appearance"
                value={appearanceLabel}
                onPress={cycleAppearance}
                showBorder
              />

              <SettingsRow
                icon={Bell}
                label="Notifications"
                subtitle="Task reminders & updates"
                isExpanded={expandedItem === "notifications"}
                onPress={() => toggleItem("notifications")}
                showBorder
              >
                {(["taskDueReminders", "fragmentProcessing", "weeklyReview", "emailDigest"] as const).map((key) => {
                  const labels: Record<string, string> = {
                    taskDueReminders: "Task Due Reminders",
                    fragmentProcessing: "Fragment Processing",
                    weeklyReview: "Weekly Review",
                    emailDigest: "Email Digest",
                  }
                  const notifSettings = (settings?.notificationSettings ?? {}) as Record<string, boolean>
                  const isOn = notifSettings[key] !== undefined ? notifSettings[key] : key !== "emailDigest"
                  return (
                    <TouchableOpacity
                      key={key}
                      style={s.toggleRow}
                      activeOpacity={0.7}
                      onPress={() => toggleNotification(key)}
                    >
                      <Text style={[s.detailLabel, { color: colors.textMuted }]}>{labels[key]}</Text>
                      <View style={[s.toggleTrack, { backgroundColor: isOn ? colors.brandFrom : colors.border }]}>
                        <View style={[s.toggleThumb, isOn ? s.toggleThumbOn : s.toggleThumbOff]} />
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </SettingsRow>

              <SettingsRow
                icon={Globe}
                label="Language & Region"
                subtitle="Display and AI language"
                isExpanded={expandedItem === "language"}
                onPress={() => toggleItem("language")}
                showBorder={false}
              >
                <Text style={[s.detailLabel, { color: colors.textMuted, marginBottom: 8 }]}>Display Language</Text>
                <View style={s.langOptions}>
                  {[
                    { value: "en", label: "English" },
                    { value: "zh", label: "中文" },
                  ].map((opt) => {
                    const isActive = (settings?.language ?? "en") === opt.value
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          s.langOption,
                          {
                            backgroundColor: isActive ? colors.brandFrom + "1A" : "transparent",
                            borderColor: isActive ? colors.brandFrom + "4D" : colors.border + "80",
                          },
                        ]}
                        onPress={() => changeLanguage(opt.value)}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.langOptionText, { color: isActive ? colors.brandFrom : colors.foreground }]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
                <DetailRow label="AI Response Language" value="Match Input" />
                <DetailRow label="Timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
              </SettingsRow>
            </View>
          </View>

          {/* System */}
          <View>
            <Text style={[s.sectionHeader, { color: colors.textMuted }]}>System</Text>
            <View style={[s.sectionCard, { backgroundColor: colors.card + "66", borderColor: colors.border + "80" }]}>
              <SettingsRow
                icon={Smartphone}
                label="Connected Devices"
                subtitle="Manage your devices"
                isExpanded={expandedItem === "devices"}
                onPress={() => toggleItem("devices")}
                showBorder
              >
                <View style={s.deviceRow}>
                  <View>
                    <Text style={[s.detailValue, { color: colors.foreground }]}>This Browser</Text>
                    <Text style={[s.phaseNote, { color: colors.textMuted }]}>Web • Active now</Text>
                  </View>
                  <View style={[s.currentBadge, { backgroundColor: colors.brandFrom + "1A" }]}>
                    <Text style={[s.currentBadgeText, { color: colors.brandFrom }]}>Current</Text>
                  </View>
                </View>
              </SettingsRow>

              <SettingsRow
                icon={Database}
                label="Data Management"
                subtitle="Export, backup & storage"
                isExpanded={expandedItem === "data"}
                onPress={() => toggleItem("data")}
                showBorder={false}
              >
                <DetailRow label="Storage" value="Local + Cloud" />
                <DetailRow label="Auto-backup" value="ON" valueColor={colors.brandFrom} />
                <Text style={[s.phaseNote, { color: colors.textMuted }]}>
                  Data export and account deletion available in Phase 2.
                </Text>
              </SettingsRow>
            </View>
          </View>

          {/* Log Out */}
          <View style={s.logoutSection}>
            <TouchableOpacity
              style={[s.logoutButton, { borderColor: colors.destructive + "33" }]}
              activeOpacity={0.7}
              onPress={handleLogOut}
            >
              <LogOut size={18} color={colors.destructive} />
              <Text style={[s.logoutText, { color: colors.destructive }]}>Log Out</Text>
            </TouchableOpacity>
            <Text style={[s.versionText, { color: colors.textMuted }]}>
              Ask Dorian v0.1.0{"\n"}Build 2026.03.14
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 32,
  },

  // Header
  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.75,
    marginBottom: 32,
    paddingTop: 12,
  },

  // User Card
  userCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    fontSize: 28,
    fontWeight: "700",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  memberBadge: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginTop: 6,
  },

  // Sections
  sectionsContainer: {
    gap: 24,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },

  // Settings row
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
  },
  settingsRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rowTextCol: {
    flex: 1,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  rowSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  settingsRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowValue: {
    fontSize: 14,
  },

  // Expanded content
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingLeft: 52, // align with text after icon
    gap: 10,
  },

  // Detail row (key-value)
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Phase note
  phaseNote: {
    fontSize: 11,
    marginTop: 4,
  },

  // Device row
  deviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  // Toggle row (notification switches)
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  toggleTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    padding: 2,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
  },
  toggleThumbOn: {
    alignSelf: "flex-end",
  },
  toggleThumbOff: {
    alignSelf: "flex-start",
  },

  // Language options
  langOptions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  langOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  langOptionText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Log Out
  logoutSection: {
    paddingTop: 16,
    gap: 16,
  },
  logoutButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
  },
  versionText: {
    fontSize: 10,
    textAlign: "center",
    lineHeight: 16,
    ...Platform.select({
      ios: { fontFamily: "Menlo" },
      android: { fontFamily: "monospace" },
    }),
  },
})
