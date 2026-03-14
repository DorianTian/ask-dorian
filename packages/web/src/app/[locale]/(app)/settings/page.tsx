"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useAuth } from "@/providers/auth-provider"
import { motion, AnimatePresence } from "framer-motion"
import { useUserSettings } from "@ask-dorian/core/hooks"
import { userApi } from "@ask-dorian/core/api"
import {
  User,
  Bell,
  Shield,
  Zap,
  Globe,
  LogOut,
  ChevronRight,
  Smartphone,
  Database,
  Image as ImageIcon,
  Sliders,
  X,
  Camera,
  type LucideIcon,
} from "lucide-react"

function SettingItem({
  icon: Icon,
  title,
  subtitle,
  expandedContent,
  isExpanded,
  onToggle,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  expandedContent?: React.ReactNode
  isExpanded?: boolean
  onToggle?: () => void
}) {
  return (
    <div className="border-b border-white/5 last:border-none">
      <div
        onClick={onToggle}
        className="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className={`size-10 rounded-xl flex items-center justify-center transition-all ${isExpanded ? "bg-primary/10 text-primary" : "bg-white/5 text-slate-400 group-hover:text-primary group-hover:bg-primary/10"}`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-text-main">{title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <ChevronRight
          size={18}
          className={`text-slate-600 transition-all ${isExpanded ? "rotate-90 text-primary" : "group-hover:text-text-main"}`}
        />
      </div>
      {isExpanded && expandedContent && (
        <div className="px-4 pb-4 pl-[72px] space-y-3 text-sm text-slate-400 border-t border-white/5 pt-3 animate-in slide-in-from-top-1 fade-in duration-200">
          {expandedContent}
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const t = useTranslations("settings")
  const logout = useAuth((s) => s.logout)
  const user = useAuth((s) => s.user)
  const [threshold, setThreshold] = useState(85)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [autoCrystallize, setAutoCrystallize] = useState(true)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const toggleItem = (id: string) => setExpandedItem(prev => prev === id ? null : id)

  const { data: settings, mutate: mutateSettings } = useUserSettings()

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

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Profile Avatar */}
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="relative group cursor-pointer">
            <div className="size-32 rounded-3xl border-4 border-primary/20 overflow-hidden shadow-2xl shadow-primary/10 group-hover:border-primary/40 transition-all bg-surface-dark flex items-center justify-center">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="size-full object-cover"
                />
              ) : (
                <User size={48} className="text-slate-600" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
              <Camera size={24} className="text-white" />
            </div>
            <button className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-xl border-4 border-bg-dark shadow-lg hover:scale-110 active:scale-95 transition-transform z-10">
              <User size={18} />
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-main">{user?.name ?? "User"}</h2>
            <p className="text-primary font-bold text-sm uppercase tracking-widest mt-1">
              {user?.role === "pro" ? t("premiumMember") : t("freeMember")}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Account & Security */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2">
              {t("accountSecurity")}
            </h3>
            <div className="bg-surface-dark/40 border border-border-dark rounded-2xl overflow-hidden">
              <SettingItem
                icon={User}
                title={t("profileInfo")}
                subtitle={user?.email ?? ""}
                isExpanded={expandedItem === "profile"}
                onToggle={() => toggleItem("profile")}
                expandedContent={
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="text-text-main font-medium">{user?.name ?? "—"}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="text-text-main font-medium">{user?.email ?? "—"}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Timezone</span><span className="text-text-main font-medium">{user?.timezone ?? "UTC"}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Locale</span><span className="text-text-main font-medium">{user?.locale ?? "en"}</span></div>
                  </div>
                }
              />
              <SettingItem
                icon={Shield}
                title={t("securityPrivacy")}
                subtitle={t("twoFactorActive")}
                isExpanded={expandedItem === "security"}
                onToggle={() => toggleItem("security")}
                expandedContent={
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-slate-500">Two-Factor Auth</span><span className="text-primary font-medium">Active</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Password</span><span className="text-text-main font-medium">••••••••</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Login Sessions</span><span className="text-text-main font-medium">1 device</span></div>
                    <p className="text-xs text-slate-600 pt-1">Password change and 2FA management coming in Phase 2.</p>
                  </div>
                }
              />
              <SettingItem
                icon={ImageIcon}
                title={t("customIcons")}
                subtitle={t("customIconsDesc")}
                isExpanded={expandedItem === "icons"}
                onToggle={() => toggleItem("icons")}
                expandedContent={
                  <p className="text-slate-500">Custom icon packs for fragments and projects. Coming in Phase 2.</p>
                }
              />
              <SettingItem
                icon={Zap}
                title={t("subscription")}
                subtitle={t("subscriptionDesc")}
                isExpanded={expandedItem === "subscription"}
                onToggle={() => toggleItem("subscription")}
                expandedContent={
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-slate-500">Plan</span><span className="text-primary font-bold">Pro</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Price</span><span className="text-text-main font-medium">$12/mo</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="text-green-400 font-medium">Active</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Next Billing</span><span className="text-text-main font-medium">Apr 14, 2026</span></div>
                  </div>
                }
              />
            </div>
          </section>

          {/* AI Preferences */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2">
              {t("aiPreferences")}
            </h3>
            <div className="bg-surface-dark/40 border border-border-dark rounded-2xl p-6 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-text-main">
                      {t("classificationThreshold")}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {t("classificationThresholdDesc")}
                    </p>
                  </div>
                  <span className="text-primary font-mono font-bold text-lg">
                    {threshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-text-main transition-colors mt-2 group"
                >
                  <Sliders
                    size={12}
                    className="group-hover:rotate-180 transition-transform duration-500"
                  />
                  {t("customizeThreshold")}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-text-main">
                    {t("autoCrystallize")}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {t("autoCrystallizeDesc")}
                  </p>
                </div>
                <div
                  onClick={() => setAutoCrystallize(!autoCrystallize)}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-300 ${
                    autoCrystallize ? "bg-primary" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`absolute top-1 size-3 bg-white rounded-full transition-all duration-300 ${
                      autoCrystallize ? "right-1" : "right-6"
                    }`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* System */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2">
              {t("system")}
            </h3>
            <div className="bg-surface-dark/40 border border-border-dark rounded-2xl overflow-hidden">
              <SettingItem
                icon={Bell}
                title={t("notifications")}
                subtitle={t("notificationsDesc")}
                isExpanded={expandedItem === "notifications"}
                onToggle={() => toggleItem("notifications")}
                expandedContent={
                  <div className="space-y-3">
                    {(["taskDueReminders", "fragmentProcessing", "weeklyReview", "emailDigest"] as const).map((key) => {
                      const labels: Record<string, string> = {
                        taskDueReminders: "Task Due Reminders",
                        fragmentProcessing: "Fragment Processing",
                        weeklyReview: "Weekly Review",
                        emailDigest: "Email Digest",
                      }
                      const notifSettings = (settings?.notificationSettings ?? {}) as Record<string, boolean>
                      const isOn = notifSettings[key] ?? key !== "emailDigest"
                      return (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-slate-500">{labels[key]}</span>
                          <div
                            onClick={(e) => { e.stopPropagation(); toggleNotification(key) }}
                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-300 ${isOn ? "bg-primary" : "bg-slate-700"}`}
                          >
                            <div className={`absolute top-1 size-3 bg-white rounded-full transition-all duration-300 ${isOn ? "right-1" : "right-6"}`} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                }
              />
              <SettingItem
                icon={Globe}
                title={t("language")}
                subtitle={t("languageDesc")}
                isExpanded={expandedItem === "language"}
                onToggle={() => toggleItem("language")}
                expandedContent={
                  <div className="space-y-4">
                    <div>
                      <p className="text-slate-500 text-xs mb-2">Display Language</p>
                      <div className="flex gap-2">
                        {[
                          { value: "en", label: "English" },
                          { value: "zh", label: "中文" },
                        ].map((opt) => {
                          const isActive = (settings?.language ?? "en") === opt.value
                          return (
                            <button
                              key={opt.value}
                              onClick={(e) => { e.stopPropagation(); changeLanguage(opt.value) }}
                              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${
                                isActive
                                  ? "bg-primary/10 text-primary border-primary/30"
                                  : "bg-white/5 text-text-main border-white/10 hover:border-primary/20"
                              }`}
                            >
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex justify-between"><span className="text-slate-500">AI Response Language</span><span className="text-text-main font-medium">Match Input</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Timezone</span><span className="text-text-main font-medium">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span></div>
                  </div>
                }
              />
              <SettingItem
                icon={Smartphone}
                title={t("connectedDevices")}
                subtitle={t("connectedDevicesDesc")}
                isExpanded={expandedItem === "devices"}
                onToggle={() => toggleItem("devices")}
                expandedContent={
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div><span className="text-text-main font-medium">This Browser</span><p className="text-xs text-slate-600 mt-0.5">Web • Active now</p></div>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Current</span>
                    </div>
                  </div>
                }
              />
              <SettingItem
                icon={Database}
                title={t("dataManagement")}
                subtitle={t("dataManagementDesc")}
                isExpanded={expandedItem === "data"}
                onToggle={() => toggleItem("data")}
                expandedContent={
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-slate-500">Fragments</span><span className="text-text-main font-medium">Local + Cloud</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Auto-backup</span><span className="text-primary text-xs font-bold">ON</span></div>
                    <p className="text-xs text-slate-600 pt-1">Data export and account deletion available in Phase 2.</p>
                  </div>
                }
              />
            </div>
          </section>

          {/* Sign Out */}
          <div className="pt-4 pb-12">
            <button
              onClick={() => logout()}
              className="w-full py-4 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-2xl font-bold border border-red-500/10 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
            >
              <LogOut
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              {t("signOut")}
            </button>
            <p className="text-center text-[10px] text-slate-600 mt-6 font-mono">
              {t("version")} <br />
              {t("buildId")}
            </p>
          </div>
        </div>
      </div>

      {/* Threshold Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-surface-dark border border-border-dark rounded-3xl p-8 shadow-2xl"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-text-main transition-colors"
              >
                <X size={20} />
              </button>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-text-main">
                    {t("granularTitle")}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {t("granularDesc")}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {t("precisionValue")}
                    </label>
                    <span className="text-4xl font-black text-primary font-mono">
                      {threshold}%
                    </span>
                  </div>

                  <div className="space-y-8 py-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={threshold}
                      onChange={(e) =>
                        setThreshold(parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {t("directInput")}
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={threshold}
                            onChange={(e) =>
                              setThreshold(
                                Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    parseFloat(e.target.value) || 0
                                  )
                                )
                              )
                            }
                            className="bg-transparent text-xl font-bold text-text-main outline-none w-full"
                          />
                          <span className="text-slate-500 font-bold">%</span>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {t("sensitivity")}
                        </p>
                        <p className="text-sm font-bold text-text-main">
                          {threshold > 90
                            ? t("ultraHigh")
                            : threshold > 70
                              ? t("balanced")
                              : t("highRecall")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {t("savePreferences")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
